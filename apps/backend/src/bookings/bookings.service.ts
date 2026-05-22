import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BookingReferenceDto, CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

type BookingFilters = {
  date?: string;
  agent?: string;
  nation?: string;
  status?: string;
  upload?: string;
  search?: string;
};

type ImportBookingFilesDto = {
  mainFileName: string;
  mainFileBase64: string;
  detailFileName?: string;
  detailFileBase64?: string;
  clientImportedAt?: string;
};

type ParsedWorkbook = Array<Array<string | number>>;

type AgentMatcher = {
  id: string;
  agentCode: string;
  name: string;
  aliases: Array<{
    pattern: string;
    matchType: string;
  }>;
};

type AgentCodeRefMatcher = {
  id: string;
  agentCode: string;
  name: string;
};

type AgentMatchingFilters = {
  search?: string;
};

type AgentMatchingDto = {
  agentCodeRef?: string;
  agentNameRef?: string;
  agentId?: string;
  agentCode?: string;
};

type BookingDetailImportGroup = {
  references: Prisma.BookingReferenceCreateWithoutBookingInput[];
  ptyStartDate: Date | null;
  ptyEndDate: Date | null;
};

const IMPORT_MAIN_PREVIEW_COLUMNS = [
  'isDup',
  'Agent Code',
  'Agent Name',
  'Guide Name',
  'Tel Guide',
  'PartyCode',
  'Pax',
  'Car Code',
  'Arrive Date',
  'Departure Date',
  'Nation',
  'Order Date',
  'Fax No',
  'AgentCode Ref',
  'PartyCode Ref',
  'Remark Book',
  'Tel Driver',
];

const IMPORT_DETAIL_PREVIEW_COLUMNS = [
  'isDup',
  'Order Date',
  'Fax No',
  'Agent Code',
  'Code',
  'Place',
  'Start Date',
  'End Date',
];

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: BookingFilters = {}) {
    const and: Prisma.BookingWhereInput[] = [];

    if (filters.date) {
      const date = this.toDate(filters.date);
      and.push({
        OR: [{ docDate: date }, { arriveDate: date }, { departDate: date }],
      });
    }
    if (filters.agent) {
      and.push({
        OR: [
          { agentCode: { contains: filters.agent, mode: 'insensitive' } },
          { agentName: { contains: filters.agent, mode: 'insensitive' } },
        ],
      });
    }
    if (filters.nation) {
      and.push({ nation: { equals: filters.nation, mode: 'insensitive' } });
    }
    if (filters.status === 'complete') {
      and.push({ status: true });
    }
    if (filters.status === 'incomplete') {
      and.push({ status: false });
    }
    if (filters.upload === 'uploaded') {
      and.push({ upload: true });
    }
    if (filters.upload === 'not-uploaded') {
      and.push({ upload: false });
    }
    if (filters.search) {
      const contains = { contains: filters.search, mode: 'insensitive' as const };
      and.push({
        OR: [
          { agentName: contains },
          { agentCode: contains },
          { partyCode: contains },
          { guideName: contains },
          { guideCode: contains },
          { carCode: contains },
          { bookRemark: contains },
        ],
      });
    }
    const where: Prisma.BookingWhereInput = and.length ? { AND: and } : {};

    const rows = await this.prisma.booking.findMany({
      where,
      include: { references: { orderBy: { createdAt: 'asc' } } },
      orderBy: [{ docDate: 'desc' }, { docTime: 'asc' }, { agentName: 'asc' }],
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateBookingDto) {
    await this.attachAgentFromMappingOrCode(dto);
    const row = await this.prisma.booking.create({
      data: this.toCreateData(dto),
      include: { references: true },
    });
    return this.toResponse(row);
  }

  async update(id: string, dto: UpdateBookingDto) {
    await this.ensureExists(id);
    await this.attachAgentFromMappingOrCode(dto);
    const references = dto.references;
    const row = await this.prisma.booking.update({
      where: { id },
      data: {
        ...this.toUpdateData(dto),
        ...(references
          ? {
              references: {
                deleteMany: {},
                create: references.map((reference) => this.toReferenceData(reference)),
              },
            }
          : {}),
      },
      include: { references: true },
    });
    return this.toResponse(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.booking.delete({ where: { id } });
    return { message: 'Booking deleted successfully' };
  }

  async findAgentMatchings(filters: AgentMatchingFilters = {}) {
    const contains = filters.search?.trim()
      ? { contains: filters.search.trim(), mode: 'insensitive' as const }
      : null;
    const rows = await this.prisma.agentMatching.findMany({
      where: contains
        ? {
            OR: [
              { agentCodeRef: contains },
              { agentNameRef: contains },
              { agent: { agentCode: contains } },
              { agent: { name: contains } },
            ],
          }
        : {},
      include: { agent: { select: { id: true, agentCode: true, name: true } } },
      orderBy: [{ agentCodeRef: 'asc' }],
    });

    return rows.map((row) => this.toAgentMatchingResponse(row));
  }

  async createAgentMatching(dto: AgentMatchingDto) {
    const agentCodeRef = this.normalizeCode(dto.agentCodeRef);
    if (!agentCodeRef) {
      throw new BadRequestException('Agent Code Ref is required');
    }
    const agent = await this.resolveAgentForMatching(dto);
    const row = await this.prisma.agentMatching.create({
      data: {
        agentCodeRef,
        agentNameRef: dto.agentNameRef?.trim() ?? '',
        agent: { connect: { id: agent.id } },
      },
      include: { agent: { select: { id: true, agentCode: true, name: true } } },
    });
    return this.toAgentMatchingResponse(row);
  }

  async updateAgentMatching(id: string, dto: AgentMatchingDto) {
    const data: Prisma.AgentMatchingUpdateInput = {};
    if (dto.agentCodeRef !== undefined) {
      const agentCodeRef = this.normalizeCode(dto.agentCodeRef);
      if (!agentCodeRef) {
        throw new BadRequestException('Agent Code Ref is required');
      }
      data.agentCodeRef = agentCodeRef;
    }
    if (dto.agentNameRef !== undefined) {
      data.agentNameRef = dto.agentNameRef.trim();
    }
    if (dto.agentId || dto.agentCode) {
      const agent = await this.resolveAgentForMatching(dto);
      data.agent = { connect: { id: agent.id } };
    }

    const row = await this.prisma.agentMatching.update({
      where: { id },
      data,
      include: { agent: { select: { id: true, agentCode: true, name: true } } },
    });
    return this.toAgentMatchingResponse(row);
  }

  async removeAgentMatching(id: string) {
    await this.prisma.agentMatching.delete({ where: { id } });
    return { message: 'Agent matching deleted successfully' };
  }

  async importAgentMatchingSql(fileBase64: string) {
    if (!fileBase64) {
      throw new BadRequestException('agentMK.sql file is required');
    }
    const text = Buffer.from(fileBase64, 'base64').toString('utf8');
    const rows = this.parseAgentImportSql(text);
    const agents = await this.prisma.agent.findMany({
      select: { id: true, agentCode: true, name: true },
    });
    const agentByCode = new Map(agents.map((agent) => [agent.agentCode.toUpperCase(), agent]));
    const agentByNameEntries = agents
      .map((agent): [string, (typeof agents)[number]] => [this.normalizeMatchText(agent.name), agent])
      .filter(([name]) => Boolean(name));
    const agentByName = new Map(agentByNameEntries);

    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      const agent = this.resolveImportedAgent(row, agentByCode, agentByName);
      if (!agent) {
        skipped += row.refs.length;
        continue;
      }
      const mappedName = row.name || agent.name;
      for (const agentCodeRef of row.refs) {
        await this.prisma.agentMatching.upsert({
          where: { agentCodeRef },
          update: {
            agentNameRef: mappedName,
            agentId: agent.id,
          },
          create: {
            agentCodeRef,
            agentNameRef: mappedName,
            agentId: agent.id,
          },
        });
        imported += 1;
      }
    }

    return { imported, skipped, sourceRows: rows.length };
  }

  async importSeparateFiles(dto: ImportBookingFilesDto) {
    if (!dto.mainFileBase64) {
      throw new BadRequestException('Main file is required');
    }

    const mainRows = this.parseImportRows(Buffer.from(dto.mainFileBase64, 'base64'));
    const detailRows = dto.detailFileBase64
      ? this.parseImportRows(Buffer.from(dto.detailFileBase64, 'base64'))
      : [];

    const detailMap = this.mapDetailRows(detailRows);
    const importNow = this.clientDateTime(dto.clientImportedAt);
    const importDate = this.dateFromFileName(dto.mainFileName) ?? this.dateOnly(importNow);
    const agentMatchers = await this.loadAgentMatchers();
    const agentCodeRefMatchers = await this.loadAgentCodeRefMatchers();
    const bookingRows = this.mapMainRows(
      mainRows,
      detailMap,
      importDate,
      importNow,
      agentMatchers,
      agentCodeRefMatchers,
    );

    if (bookingRows.length === 0) {
      throw new BadRequestException('No booking rows found in import files');
    }

    let imported = 0;
    for (const booking of bookingRows) {
      await this.prisma.booking.upsert({
        where: { importKey: booking.importKey },
        update: {
          ...booking.data,
          references: {
            deleteMany: {},
            create: booking.references,
          },
        },
        create: {
          importKey: booking.importKey,
          ...booking.data,
          references: {
            create: booking.references,
          },
        },
      });
      imported += 1;
    }

    return { imported, skipped: Math.max(0, mainRows.length - 1 - imported) };
  }

  async previewImportFiles(dto: ImportBookingFilesDto) {
    if (!dto.mainFileBase64) {
      throw new BadRequestException('Main file is required');
    }

    const mainRows = this.parseImportRows(Buffer.from(dto.mainFileBase64, 'base64'));
    const detailRows = dto.detailFileBase64
      ? this.parseImportRows(Buffer.from(dto.detailFileBase64, 'base64'))
      : [];

    return {
      main: this.previewMainRows(
        mainRows,
        await this.loadAgentMatchers(),
        await this.loadAgentCodeRefMatchers(),
      ),
      detail: this.previewDetailRows(detailRows),
    };
  }

  async matchSelectedAgents(ids: string[]) {
    const uniqueIds = [...new Set(ids)].filter(Boolean);
    if (uniqueIds.length === 0) {
      throw new BadRequestException('Please select booking rows first');
    }

    const rows = await this.prisma.booking.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, agentName: true, agentCodeRef: true },
    });
    const agentMatchers = await this.loadAgentMatchers();
    let matched = 0;

    for (const row of rows) {
      const agent = await this.matchAgentFromRef(row.agentCodeRef);
      const fallbackAgent = agent ?? this.matchAgent(row.agentName, agentMatchers);
      if (!fallbackAgent) {
        continue;
      }
      await this.prisma.booking.update({
        where: { id: row.id },
        data: {
          agentId: fallbackAgent.id,
          agentCode: fallbackAgent.agentCode,
        },
      });
      matched += 1;
    }

    return {
      requested: uniqueIds.length,
      matched,
      unmatched: Math.max(0, uniqueIds.length - matched),
    };
  }

  async findAgentOptions(search = '') {
    const contains = search.trim()
      ? { contains: search.trim(), mode: 'insensitive' as const }
      : null;

    return this.prisma.agent.findMany({
      where: {
        active: true,
        ...(contains
          ? {
              OR: [
                { agentCode: contains },
                { name: contains },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        agentCode: true,
        name: true,
      },
      orderBy: [{ agentCode: 'asc' }],
      take: 500,
    });
  }

  async applyAgentCodeRefMapping(ids: string[]) {
    const uniqueIds = [...new Set(ids)].filter(Boolean);
    if (uniqueIds.length === 0) {
      throw new BadRequestException('Please select booking rows first');
    }

    const rows = await this.prisma.booking.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, agentCodeRef: true },
    });
    let matched = 0;
    for (const row of rows) {
      const agent = await this.matchAgentFromRef(row.agentCodeRef);
      if (!agent) {
        continue;
      }
      await this.prisma.booking.update({
        where: { id: row.id },
        data: {
          agentId: agent.id,
          agentCode: agent.agentCode,
        },
      });
      matched += 1;
    }

    return {
      requested: uniqueIds.length,
      matched,
      unmatched: Math.max(0, uniqueIds.length - matched),
    };
  }

  async createBonusCardsFromBookings(ids: string[]) {
    const uniqueIds = [...new Set(ids)].filter(Boolean);
    if (uniqueIds.length === 0) {
      throw new BadRequestException('Please select booking rows first');
    }

    const rows = await this.prisma.booking.findMany({
      where: { id: { in: uniqueIds } },
      orderBy: [{ arriveDate: 'asc' }, { agentName: 'asc' }, { partyCode: 'asc' }],
    });
    const nextBonusByDate = new Map<string, number>();
    let created = 0;

    for (const row of rows) {
      const workDate = row.arriveDate ?? row.docDate;
      const workDateKey = this.dateToInput(workDate) ?? this.dateKey(row.docDate);
      let nextBonus = nextBonusByDate.get(workDateKey);
      if (nextBonus === undefined) {
        nextBonus = await this.nextBonusNumber(workDateKey);
      }

      await this.prisma.bonusCard.create({
        data: {
          workDate,
          bonus: String(nextBonus),
          bonusName: row.guideName || row.partyCode,
          agentCode: row.agentCode,
          agentName: row.agentName,
          guide: row.guideCode,
          guideName: row.guideName,
          partyCode: row.partyCode,
          nation: row.nation,
          adult: row.pax,
          child: 0,
          tourLeader: 0,
          carCode: row.carCode,
          shop: row.shop,
          busType: 'BUSOA',
          comment: row.bookRemark,
        },
      });
      await this.prisma.booking.update({
        where: { id: row.id },
        data: { upload: true },
      });

      nextBonusByDate.set(workDateKey, nextBonus + 1);
      created += 1;
    }

    return {
      requested: uniqueIds.length,
      created,
      skipped: Math.max(0, uniqueIds.length - created),
    };
  }

  private findDuplicateKeys(keys: string[]) {
    const counts = new Map<string, number>();
    keys.forEach((key) => counts.set(key, (counts.get(key) ?? 0) + 1));
    return [...counts.entries()].filter(([, count]) => count > 1).map(([key]) => key);
  }

  private previewMainRows(
    rows: ParsedWorkbook,
    agentMatchers: AgentMatcher[],
    agentCodeRefMatchers: Map<string, AgentCodeRefMatcher>,
  ) {
    const dataRows = rows.slice(1);
    const keyFactory = (row: Array<string | number>) => {
      const faxNo = this.cellText(row[11]);
      const partyCode = this.cellText(row[4]) || this.cellText(row[13]);
      return faxNo || partyCode ? `${faxNo}|${partyCode}` : '';
    };
    const duplicateKeys = this.findDuplicateKeys(dataRows.map(keyFactory).filter(Boolean));
    const duplicateSet = new Set(duplicateKeys);

    return {
      rowCount: dataRows.length,
      duplicateCount: duplicateKeys.length,
      duplicateKeys,
      columns: IMPORT_MAIN_PREVIEW_COLUMNS,
      rows: dataRows.slice(0, 100).map((row) => {
        const agentName = this.cellText(row[1]);
        const agentCodeRef = this.cellText(row[12]);
        const matchedAgent =
          this.matchAgentFromRefMap(agentCodeRef, agentCodeRefMatchers) ??
          this.matchAgent(agentName, agentMatchers);
        return [
          duplicateSet.has(keyFactory(row)) ? 'Yes' : '',
          matchedAgent?.agentCode ?? '',
          agentName,
          this.cellText(row[2]),
          this.cellText(row[3]),
          this.cellText(row[4]),
          String(this.cellInt(row[5])),
          this.cellText(row[6]),
          this.dateToDisplay(this.cellDate(row[7])),
          this.dateToDisplay(this.cellDate(row[8])),
          this.cellText(row[9]),
          this.dateToDisplay(this.cellDate(row[10])),
          this.cellText(row[11]),
          agentCodeRef,
          this.cellText(row[13]),
          this.cellText(row[14]),
          this.cellText(row[15]),
        ];
      }),
    };
  }

  private previewDetailRows(rows: ParsedWorkbook) {
    const dataRows = rows.slice(1);
    const keyFactory = (row: Array<string | number>) => {
      const faxNo = this.cellText(row[1]);
      const code = this.cellText(row[3]);
      return faxNo || code ? `${faxNo}|${code}` : '';
    };
    const duplicateKeys = this.findDuplicateKeys(dataRows.map(keyFactory).filter(Boolean));
    const duplicateSet = new Set(duplicateKeys);

    return {
      rowCount: dataRows.length,
      duplicateCount: duplicateKeys.length,
      duplicateKeys,
      columns: IMPORT_DETAIL_PREVIEW_COLUMNS,
      rows: dataRows.slice(0, 100).map((row) => [
        duplicateSet.has(keyFactory(row)) ? 'Yes' : '',
        this.dateToDisplay(this.cellDate(row[0])),
        this.cellText(row[1]),
        this.cellText(row[2]),
        this.cellText(row[3]),
        this.cellText(row[4]),
        this.dateToDisplay(this.cellDate(row[5])),
        this.dateToDisplay(this.cellDate(row[6])),
      ]),
    };
  }

  private async loadAgentMatchers(): Promise<AgentMatcher[]> {
    return this.prisma.agent.findMany({
      where: {
        active: true,
      },
      select: {
        id: true,
        agentCode: true,
        name: true,
        aliases: {
          select: {
            pattern: true,
            matchType: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  private async loadAgentCodeRefMatchers() {
    const rows = await this.prisma.agentMatching.findMany({
      include: { agent: { select: { id: true, agentCode: true, name: true } } },
    });
    return new Map(
      rows.map((row) => [
        this.normalizeCode(row.agentCodeRef),
        {
          id: row.agent.id,
          agentCode: row.agent.agentCode,
          name: row.agent.name,
        },
      ]),
    );
  }

  private async nextBonusNumber(workDate: string) {
    const rows = await this.prisma.bonusCard.findMany({
      where: { workDate: this.toDate(workDate) },
      select: { bonus: true },
    });
    return Math.max(0, ...rows.map((row) => Number(row.bonus)).filter(Number.isFinite)) + 1;
  }

  private matchAgent(agentName: string, matchers: AgentMatcher[]) {
    const normalizedAgentName = this.normalizeMatchText(agentName);
    if (!normalizedAgentName) {
      return null;
    }

    const exactName = matchers.find(
      (matcher) => this.normalizeMatchText(matcher.name) === normalizedAgentName,
    );
    if (exactName) {
      return exactName;
    }

    const containsName = matchers.find((matcher) => {
      const normalizedName = this.normalizeMatchText(matcher.name);
      return (
        normalizedName &&
        (normalizedAgentName.includes(normalizedName) ||
          normalizedName.includes(normalizedAgentName))
      );
    });
    if (containsName) {
      return containsName;
    }

    return (
      matchers.find((matcher) =>
        matcher.aliases.some((alias) => {
          const normalizedPattern = this.normalizeMatchText(alias.pattern);
          return (
            alias.matchType === 'contains' &&
            normalizedPattern &&
            normalizedAgentName.includes(normalizedPattern)
          );
        }),
      ) ?? null
    );
  }

  private matchAgentFromRefMap(
    agentCodeRef: string,
    matchers: Map<string, AgentCodeRefMatcher>,
  ) {
    return matchers.get(this.normalizeCode(agentCodeRef)) ?? null;
  }

  private async matchAgentFromRef(agentCodeRef: string) {
    const normalizedRef = this.normalizeCode(agentCodeRef);
    if (!normalizedRef) {
      return null;
    }
    const row = await this.prisma.agentMatching.findUnique({
      where: { agentCodeRef: normalizedRef },
      include: { agent: { select: { id: true, agentCode: true, name: true } } },
    });
    return row?.agent ?? null;
  }

  private normalizeMatchText(value: string) {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  private normalizeCode(value?: string | null) {
    return (value ?? '').trim().toUpperCase();
  }

  private mapMainRows(
    rows: ParsedWorkbook,
    detailMap: Map<string, BookingDetailImportGroup>,
    importDate: Date,
    importNow: Date,
    agentMatchers: AgentMatcher[],
    agentCodeRefMatchers: Map<string, AgentCodeRefMatcher>,
  ) {
    return rows.slice(1).flatMap((row, index) => {
      const agentName = this.cellText(row[1]);
      const partyCode = this.cellText(row[4]);
      const faxNo = this.cellText(row[11]);
      const agentCodeRef = this.cellText(row[12]);
      const partyCodeRef = this.cellText(row[13]);

      if (!agentName && !partyCode) {
        return [];
      }

      const matchedAgent =
        this.matchAgentFromRefMap(agentCodeRef, agentCodeRefMatchers) ??
        this.matchAgent(agentName, agentMatchers);
      const importKey = [
        'booking-import',
        this.dateKey(importDate),
        faxNo || `row-${index + 1}`,
        partyCode || partyCodeRef || agentName,
      ].join('|');
      const detailGroup = this.findDetailGroup(detailMap, faxNo, [partyCode, partyCodeRef]);

      return [
        {
          importKey,
          data: {
            docDate: importDate,
            docTime: this.timeKey(importNow),
            docNo: this.docNoKey(importNow),
            agentId: matchedAgent?.id,
            agentCode: matchedAgent?.agentCode ?? '',
            agentName,
            guideCode: '',
            guideName: this.cellText(row[2]),
            telGuide: this.cellText(row[3]),
            partyCode,
            pax: this.cellInt(row[5]),
            carCode: this.cellText(row[6]),
            shop: 'G',
            arriveDate: this.cellDate(row[7]),
            departDate: this.cellDate(row[8]),
            nation: this.cellText(row[9]),
            dateBookJw: null,
            timeBookJw: '',
            ptyStartDate: detailGroup?.ptyStartDate ?? null,
            ptyEndDate: detailGroup?.ptyEndDate ?? null,
            faxNo,
            agentCodeRef,
            partyCodeRef,
            bookRemark: this.cellText(row[14]),
            telDriver: this.cellText(row[15]),
            status: false,
            upload: false,
          },
          references: detailGroup?.references ?? [],
        },
      ];
    });
  }

  private mapDetailRows(rows: ParsedWorkbook) {
    const detailMap = new Map<string, BookingDetailImportGroup>();

    rows.slice(1).forEach((row) => {
      const faxNo = this.cellText(row[1]);
      const code = this.cellText(row[3]);
      if (!faxNo && !code) {
        return;
      }

      const startDate = this.cellDate(row[5]);
      const endDate = this.cellDate(row[6]);
      const detail = this.toReferenceData({
        orderDate: this.dateToInput(this.cellDate(row[0])),
        faxNo,
        agentCode: this.cellText(row[2]),
        code,
        place: this.cellText(row[4]),
        startDate: this.dateToInput(startDate),
        endDate: this.dateToInput(endDate),
      });
      const key = this.referenceKey(faxNo, code);
      this.addDetailGroup(detailMap, key, detail, startDate, endDate);
    });

    return detailMap;
  }

  private addDetailGroup(
    detailMap: Map<string, BookingDetailImportGroup>,
    key: string,
    detail: Prisma.BookingReferenceCreateWithoutBookingInput,
    startDate: Date | null,
    endDate: Date | null,
  ) {
    const current = detailMap.get(key);
    detailMap.set(key, {
      references: [...(current?.references ?? []), detail],
      ptyStartDate: this.earliestDate(current?.ptyStartDate ?? null, startDate),
      ptyEndDate: this.latestDate(current?.ptyEndDate ?? null, endDate),
    });
  }

  private findDetailGroup(
    detailMap: Map<string, BookingDetailImportGroup>,
    faxNo: string,
    partyCodes: string[],
  ) {
    const keys = [
      ...partyCodes.filter(Boolean).map((partyCode) => this.referenceKey(faxNo, partyCode)),
    ];
    return keys.map((key) => detailMap.get(key)).find(Boolean);
  }

  private toCreateData(dto: CreateBookingDto): Prisma.BookingCreateInput {
    return {
      docDate: this.toDate(dto.docDate),
      docTime: dto.docTime ?? '',
      docNo: dto.docNo ?? '',
      agentCode: dto.agentCode ?? '',
      ...(dto.agentId ? { agent: { connect: { id: dto.agentId } } } : {}),
      agentName: dto.agentName,
      partyCode: dto.partyCode,
      nation: dto.nation ?? '',
      arriveDate: this.toOptionalDate(dto.arriveDate),
      departDate: this.toOptionalDate(dto.departDate),
      guideCode: dto.guideCode ?? '',
      guideName: dto.guideName ?? '',
      telGuide: dto.telGuide ?? '',
      telDriver: dto.telDriver ?? '',
      pax: dto.pax,
      carCode: dto.carCode ?? '',
      shop: dto.shop ?? 'G',
      bookRemark: dto.bookRemark ?? '',
      dateBookJw: this.toOptionalDate(dto.dateBookJw),
      timeBookJw: dto.timeBookJw ?? '',
      ptyStartDate: this.toOptionalDate(dto.ptyStartDate),
      ptyEndDate: this.toOptionalDate(dto.ptyEndDate),
      faxNo: dto.faxNo ?? '',
      agentCodeRef: dto.agentCodeRef ?? '',
      partyCodeRef: dto.partyCodeRef ?? '',
      status: dto.status,
      upload: dto.upload,
      references: {
        create: (dto.references ?? []).map((reference) => this.toReferenceData(reference)),
      },
    };
  }

  private toUpdateData(dto: UpdateBookingDto): Prisma.BookingUpdateInput {
    return {
      ...(dto.docDate ? { docDate: this.toDate(dto.docDate) } : {}),
      ...(dto.docTime !== undefined ? { docTime: dto.docTime } : {}),
      ...(dto.docNo !== undefined ? { docNo: dto.docNo } : {}),
      ...(dto.agentId !== undefined ? { agent: dto.agentId ? { connect: { id: dto.agentId } } : { disconnect: true } } : {}),
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode } : {}),
      ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
      ...(dto.partyCode !== undefined ? { partyCode: dto.partyCode } : {}),
      ...(dto.nation !== undefined ? { nation: dto.nation } : {}),
      ...(dto.arriveDate !== undefined ? { arriveDate: this.toOptionalDate(dto.arriveDate) } : {}),
      ...(dto.departDate !== undefined ? { departDate: this.toOptionalDate(dto.departDate) } : {}),
      ...(dto.guideCode !== undefined ? { guideCode: dto.guideCode } : {}),
      ...(dto.guideName !== undefined ? { guideName: dto.guideName } : {}),
      ...(dto.telGuide !== undefined ? { telGuide: dto.telGuide } : {}),
      ...(dto.telDriver !== undefined ? { telDriver: dto.telDriver } : {}),
      ...(dto.pax !== undefined ? { pax: dto.pax } : {}),
      ...(dto.carCode !== undefined ? { carCode: dto.carCode } : {}),
      ...(dto.shop !== undefined ? { shop: dto.shop } : {}),
      ...(dto.bookRemark !== undefined ? { bookRemark: dto.bookRemark } : {}),
      ...(dto.dateBookJw !== undefined ? { dateBookJw: this.toOptionalDate(dto.dateBookJw) } : {}),
      ...(dto.timeBookJw !== undefined ? { timeBookJw: dto.timeBookJw } : {}),
      ...(dto.ptyStartDate !== undefined ? { ptyStartDate: this.toOptionalDate(dto.ptyStartDate) } : {}),
      ...(dto.ptyEndDate !== undefined ? { ptyEndDate: this.toOptionalDate(dto.ptyEndDate) } : {}),
      ...(dto.faxNo !== undefined ? { faxNo: dto.faxNo } : {}),
      ...(dto.agentCodeRef !== undefined ? { agentCodeRef: dto.agentCodeRef } : {}),
      ...(dto.partyCodeRef !== undefined ? { partyCodeRef: dto.partyCodeRef } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.upload !== undefined ? { upload: dto.upload } : {}),
    };
  }

  private toReferenceData(
    dto: BookingReferenceDto,
  ): Prisma.BookingReferenceCreateWithoutBookingInput {
    return {
      orderDate: this.toOptionalDate(dto.orderDate),
      faxNo: dto.faxNo ?? '',
      agentCode: dto.agentCode ?? '',
      code: dto.code ?? '',
      place: dto.place ?? '',
      startDate: this.toOptionalDate(dto.startDate),
      endDate: this.toOptionalDate(dto.endDate),
    };
  }

  private async attachAgentFromMappingOrCode(dto: UpdateBookingDto) {
    if (dto.agentCodeRef && !dto.agentId) {
      const agent = await this.matchAgentFromRef(dto.agentCodeRef);
      if (agent) {
        dto.agentId = agent.id;
        dto.agentCode = agent.agentCode;
        if (!dto.agentName) {
          dto.agentName = agent.name;
        }
        return;
      }
    }

    if (!dto.agentCode || dto.agentId) {
      return;
    }

    const agent = await this.prisma.agent.findUnique({
      where: { agentCode: dto.agentCode },
      select: { id: true },
    });
    if (!agent) {
      return;
    }
    dto.agentId = agent.id;
  }

  private async resolveAgentForMatching(dto: AgentMatchingDto) {
    if (dto.agentId) {
      const agent = await this.prisma.agent.findUnique({
        where: { id: dto.agentId },
        select: { id: true, agentCode: true, name: true },
      });
      if (agent) {
        return agent;
      }
    }
    const agentCode = this.normalizeCode(dto.agentCode);
    if (agentCode) {
      const agent = await this.prisma.agent.findUnique({
        where: { agentCode },
        select: { id: true, agentCode: true, name: true },
      });
      if (agent) {
        return agent;
      }
    }
    throw new BadRequestException('Please select Agent Code');
  }

  private toAgentMatchingResponse(
    row: Prisma.AgentMatchingGetPayload<{
      include: { agent: { select: { id: true; agentCode: true; name: true } } };
    }>,
  ) {
    return {
      id: row.id,
      agentCodeRef: row.agentCodeRef,
      agentNameRef: row.agentNameRef,
      agentId: row.agent.id,
      agentCode: row.agent.agentCode,
      agentName: row.agent.name,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private parseAgentImportSql(text: string) {
    const bookingInfoRows = this.parseBookingInfoAgentSql(text);
    if (bookingInfoRows.length > 0) {
      return bookingInfoRows;
    }

    const valuesBlock = text.match(/INSERT INTO\s+"AgentImport"[\s\S]*?VALUES\s*([\s\S]*?);/i)?.[1];
    if (!valuesBlock) {
      return [];
    }
    const rowMatches = valuesBlock.matchAll(/\(([\s\S]*?)\)(?:,|$)/g);
    const rows: Array<{
      name: string;
      primaryCode: string;
      secondaryCodes: string[];
      refs: string[];
    }> = [];

    for (const match of rowMatches) {
      const cells = this.parseSqlTuple(match[1]);
      const name = cells[1] ?? '';
      const gei = this.normalizeSqlValue(cells[2]);
      const rth = this.normalizeSqlValue(cells[3]);
      const spl = this.normalizeSqlValue(cells[4]);
      const pgc = this.normalizeSqlValue(cells[5]);
      const refs = [gei, pgc].filter((value) => value && value !== '-');
      if (!name || refs.length === 0) {
        continue;
      }
      rows.push({
        name,
        primaryCode: rth,
        secondaryCodes: [spl, rth].filter((value) => value && value !== '-'),
        refs: [...new Set(refs.map((value) => this.normalizeCode(value)))],
      });
    }

    return rows;
  }

  private parseBookingInfoAgentSql(text: string) {
    const valuesBlock = text.match(/INSERT INTO\s+"BookingInfor_Agent"[\s\S]*?VALUES\s*([\s\S]*?);/i)?.[1];
    if (!valuesBlock) {
      return [];
    }

    const rowMatches = valuesBlock.matchAll(/\(([\s\S]*?)\)(?:,|$)/g);
    const rows: Array<{
      name: string;
      primaryCode: string;
      secondaryCodes: string[];
      refs: string[];
    }> = [];

    for (const match of rowMatches) {
      const cells = this.parseSqlTuple(match[1]);
      const agentCodeRef = this.normalizeCode(cells[0] ?? '');
      const agentCode = this.normalizeCode(cells[1] ?? '');
      if (!agentCodeRef || !agentCode || agentCode === '-') {
        continue;
      }
      rows.push({
        name: '',
        primaryCode: agentCode,
        secondaryCodes: [],
        refs: [agentCodeRef],
      });
    }

    return rows;
  }

  private parseSqlTuple(tuple: string) {
    const cells: string[] = [];
    let current = '';
    let inQuote = false;

    for (let index = 0; index < tuple.length; index += 1) {
      const char = tuple[index];
      const next = tuple[index + 1];
      if (char === "'" && next === "'") {
        current += "'";
        index += 1;
        continue;
      }
      if (char === "'") {
        inQuote = !inQuote;
        continue;
      }
      if (char === ',' && !inQuote) {
        cells.push(this.normalizeSqlValue(current));
        current = '';
        continue;
      }
      current += char;
    }
    cells.push(this.normalizeSqlValue(current));
    return cells;
  }

  private normalizeSqlValue(value: string) {
    const trimmed = value.trim();
    return /^null$/i.test(trimmed) ? '' : trimmed;
  }

  private resolveImportedAgent(
    row: {
      name: string;
      primaryCode: string;
      secondaryCodes: string[];
    },
    agentByCode: Map<string, { id: string; agentCode: string; name: string }>,
    agentByName: Map<string, { id: string; agentCode: string; name: string }>,
  ) {
    const codeCandidates = [
      row.primaryCode,
      `${row.primaryCode}R`,
      ...row.secondaryCodes,
      ...row.secondaryCodes.map((code) => `${code}R`),
    ]
      .map((code) => this.normalizeCode(code))
      .filter((code) => code && code !== '-');

    for (const code of codeCandidates) {
      const agent = agentByCode.get(code);
      if (agent) {
        return agent;
      }
    }

    const normalizedName = this.normalizeMatchText(row.name);
    return (
      agentByName.get(normalizedName) ??
      [...agentByName.entries()].find(
        ([name]) => name && (name.includes(normalizedName) || normalizedName.includes(name)),
      )?.[1] ??
      null
    );
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Booking "${id}" not found`);
    }
  }

  private parseImportRows(buffer: Buffer): ParsedWorkbook {
    if (buffer.subarray(0, 8).toString('hex') === 'd0cf11e0a1b11ae1') {
      return this.parseLegacyWorkbook(buffer);
    }

    return this.parseDelimitedText(buffer);
  }

  private parseDelimitedText(buffer: Buffer): ParsedWorkbook {
    const text = buffer.toString('utf8').replace(/^\uFEFF/, '');
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
    const delimiter = text.includes('\t') ? '\t' : text.includes('|') ? '|' : ',';

    return lines.map((line) =>
      line.split(delimiter).map((value) => {
        const trimmed = value.trim().replace(/^"|"$/g, '');
        const numeric = Number(trimmed);
        return trimmed !== '' && Number.isFinite(numeric) ? numeric : trimmed;
      }),
    );
  }

  private parseLegacyWorkbook(buffer: Buffer): ParsedWorkbook {
    const workbook = this.readOleWorkbookStream(buffer);
    const rows: ParsedWorkbook = [];

    for (let offset = 0; offset + 4 <= workbook.length; ) {
      const recordId = workbook.readUInt16LE(offset);
      const length = workbook.readUInt16LE(offset + 2);
      const data = workbook.subarray(offset + 4, offset + 4 + length);

      if (recordId === 0x0204) {
        const row = data.readUInt16LE(0);
        const column = data.readUInt16LE(2);
        const textLength = data.readUInt16LE(6);
        this.setCell(rows, row, column, this.decodeBiffLabel(data, 8, textLength));
      } else if (recordId === 0x0203) {
        this.setCell(rows, data.readUInt16LE(0), data.readUInt16LE(2), data.readDoubleLE(6));
      } else if (recordId === 0x027e) {
        this.setCell(rows, data.readUInt16LE(0), data.readUInt16LE(2), this.decodeRk(data.readUInt32LE(6)));
      } else if (recordId === 0x00bd) {
        const row = data.readUInt16LE(0);
        const firstColumn = data.readUInt16LE(2);
        const lastColumn = data.readUInt16LE(4);
        let cursor = 6;
        for (let column = firstColumn; column <= lastColumn; column += 1) {
          this.setCell(rows, row, column, this.decodeRk(data.readUInt32LE(cursor + 2)));
          cursor += 6;
        }
      }

      offset += 4 + length;
    }

    return rows.filter(Boolean);
  }

  private readOleWorkbookStream(buffer: Buffer) {
    if (buffer.subarray(0, 8).toString('hex') !== 'd0cf11e0a1b11ae1') {
      throw new BadRequestException('Import file must be legacy Excel format');
    }

    const sectorSize = 1 << buffer.readUInt16LE(30);
    const directoryStart = buffer.readUInt32LE(48);
    const fatSectorIds: number[] = [];

    for (let index = 0; index < 109; index += 1) {
      const sectorId = buffer.readUInt32LE(76 + index * 4);
      if (sectorId < 0xfffffff0) {
        fatSectorIds.push(sectorId);
      }
    }

    const fat: number[] = [];
    fatSectorIds.forEach((sectorId) => {
      const sector = this.readOleSector(buffer, sectorId, sectorSize);
      for (let offset = 0; offset < sector.length; offset += 4) {
        fat.push(sector.readUInt32LE(offset));
      }
    });

    const directory = this.readOleChain(buffer, directoryStart, fat, sectorSize);
    for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
      const nameLength = directory.readUInt16LE(offset + 64);
      if (!nameLength) {
        continue;
      }
      const name = directory.subarray(offset, offset + nameLength - 2).toString('utf16le');
      if (name === 'Workbook' || name === 'Book') {
        return this.readOleChain(
          buffer,
          directory.readUInt32LE(offset + 116),
          fat,
          sectorSize,
          Number(directory.readBigUInt64LE(offset + 120)),
        );
      }
    }

    throw new BadRequestException('Workbook stream not found');
  }

  private readOleSector(buffer: Buffer, sectorId: number, sectorSize: number) {
    const start = 512 + sectorId * sectorSize;
    return buffer.subarray(start, start + sectorSize);
  }

  private readOleChain(
    buffer: Buffer,
    startSector: number,
    fat: number[],
    sectorSize: number,
    size?: number,
  ) {
    const sectors: Buffer[] = [];
    let sectorId = startSector;
    let guard = 0;

    while (sectorId < 0xfffffff0 && guard < 10000) {
      sectors.push(this.readOleSector(buffer, sectorId, sectorSize));
      sectorId = fat[sectorId];
      guard += 1;
    }

    const chain = Buffer.concat(sectors);
    return size ? chain.subarray(0, size) : chain;
  }

  private decodeBiffLabel(data: Buffer, offset: number, charLength: number) {
    const option = data[offset];
    const start = offset + 1;
    const byteLength = option & 1 ? charLength * 2 : charLength;
    const raw = data.subarray(start, start + byteLength);
    return (option & 1 ? raw.toString('utf16le') : raw.toString('latin1')).trim();
  }

  private decodeRk(value: number) {
    let decoded: number;
    if (value & 2) {
      decoded = value >> 2;
    } else {
      const buffer = Buffer.alloc(8);
      buffer.writeUInt32LE(value & 0xfffffffc, 4);
      decoded = buffer.readDoubleLE(0);
    }
    return value & 1 ? decoded / 100 : decoded;
  }

  private setCell(rows: ParsedWorkbook, row: number, column: number, value: string | number) {
    rows[row] ??= [];
    rows[row][column] = value;
  }

  private cellText(value: string | number | undefined) {
    if (value === undefined || value === null) {
      return '';
    }
    return String(value).replace(/\u0000/g, '').trim();
  }

  private cellInt(value: string | number | undefined) {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? Math.max(0, Math.round(parsed)) : 0;
  }

  private cellDate(value: string | number | undefined) {
    if (typeof value === 'number' && value > 20000) {
      return new Date(Date.UTC(1899, 11, 30 + Math.round(value)));
    }
    if (typeof value === 'string' && value.trim()) {
      return this.toOptionalDate(value);
    }
    return null;
  }

  private toDate(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private toOptionalDate(value?: string | null) {
    if (!value) {
      return null;
    }
    const displayDate = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (displayDate) {
      const day = displayDate[1].padStart(2, '0');
      const month = displayDate[2].padStart(2, '0');
      return this.toDate(`${displayDate[3]}-${month}-${day}`);
    }
    return this.toDate(value);
  }

  private dateToInput(value: Date | null) {
    return value ? value.toISOString().slice(0, 10) : undefined;
  }

  private dateToDisplay(value: Date | null) {
    if (!value) {
      return '';
    }
    const day = String(value.getUTCDate()).padStart(2, '0');
    const month = String(value.getUTCMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${value.getUTCFullYear()}`;
  }

  private clientDateTime(value?: string) {
    const date = value ? new Date(value) : new Date();
    return Number.isNaN(date.getTime()) ? new Date() : date;
  }

  private dateOnly(value: Date) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }

  private earliestDate(current: Date | null, candidate: Date | null) {
    if (!current) {
      return candidate;
    }
    if (!candidate) {
      return current;
    }
    return candidate.getTime() < current.getTime() ? candidate : current;
  }

  private latestDate(current: Date | null, candidate: Date | null) {
    if (!current) {
      return candidate;
    }
    if (!candidate) {
      return current;
    }
    return candidate.getTime() > current.getTime() ? candidate : current;
  }

  private dateFromFileName(fileName: string) {
    const match = fileName.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? this.toDate(match[1]) : null;
  }

  private timeKey(value: Date) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }

  private docNoKey(value: Date) {
    return [
      value.getFullYear(),
      String(value.getMonth() + 1).padStart(2, '0'),
      String(value.getDate()).padStart(2, '0'),
      String(value.getHours()).padStart(2, '0'),
      String(value.getMinutes()).padStart(2, '0'),
      String(value.getSeconds()).padStart(2, '0'),
      String(value.getMilliseconds()).padStart(3, '0'),
    ].join('');
  }

  private dateKey(value: Date) {
    return value.toISOString().slice(0, 10);
  }

  private referenceKey(faxNo: string, code: string) {
    return `${faxNo.trim()}|${code.trim()}`;
  }

  private toResponse(row: Prisma.BookingGetPayload<{ include: { references: true } }>) {
    return {
      ...row,
      docDate: this.dateToInput(row.docDate),
      arriveDate: this.dateToInput(row.arriveDate),
      departDate: this.dateToInput(row.departDate),
      dateBookJw: this.dateToInput(row.dateBookJw),
      ptyStartDate: this.dateToInput(row.ptyStartDate),
      ptyEndDate: this.dateToInput(row.ptyEndDate),
      references: row.references.map((reference) => ({
        ...reference,
        orderDate: this.dateToInput(reference.orderDate),
        startDate: this.dateToInput(reference.startDate),
        endDate: this.dateToInput(reference.endDate),
      })),
    };
  }
}
