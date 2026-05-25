import {
  ConflictException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as XLSX from 'xlsx';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNameListDto } from './dto/create-name-list.dto';
import { ImportNameListDto } from './dto/import-name-list.dto';
import { NameListItemDto } from './dto/name-list-item.dto';
import { UpdateNameListDto } from './dto/update-name-list.dto';

type NameListFilters = {
  search?: string;
  partyCode?: string;
  agentCode?: string;
  passport?: string;
  busCode?: string;
  arriveDate?: string;
  excludeLinked?: boolean;
  currentBonusCardId?: string;
};

type ColumnMap = Partial<Record<keyof NameListItemDto | 'englishName' | 'englishSurname' | 'englishGiven' | 'chineseName' | 'remark', number>>;

type ParsedNameList = {
  code: string;
  partyCode: string;
  arriveDate: string;
  agentCode: string;
  agentName: string;
  sourceFile: string;
  pax: number;
  items: NameListItemDto[];
  preview: {
    sheetName: string;
    headerRow: number;
    columnMap: Record<string, string>;
    sampleRows: NameListItemDto[];
    warnings: string[];
  };
};

@Injectable()
export class NameListsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: NameListFilters = {}) {
    const contains = filters.search?.trim();
    const andFilters: Prisma.NameListWhereInput[] = [];
    if (contains) {
      andFilters.push({
        OR: [
          { code: { contains, mode: 'insensitive' } },
          { partyCode: { contains, mode: 'insensitive' } },
          { agentCode: { contains, mode: 'insensitive' } },
          { agentName: { contains, mode: 'insensitive' } },
          { guideCode: { contains, mode: 'insensitive' } },
          { guideName: { contains, mode: 'insensitive' } },
          { nationCode: { contains, mode: 'insensitive' } },
          { nationName: { contains, mode: 'insensitive' } },
          { sourceFile: { contains, mode: 'insensitive' } },
          { busCode: { contains, mode: 'insensitive' } },
          { items: { some: { passportNo: { contains, mode: 'insensitive' } } } },
        ],
      });
    }
    if (filters.partyCode?.trim()) {
      andFilters.push({ partyCode: { contains: filters.partyCode.trim(), mode: 'insensitive' } });
    }
    if (filters.agentCode?.trim()) {
      andFilters.push({ agentCode: { contains: filters.agentCode.trim(), mode: 'insensitive' } });
    }
    if (filters.passport?.trim()) {
      andFilters.push({ items: { some: { passportNo: { contains: filters.passport.trim(), mode: 'insensitive' } } } });
    }
    if (filters.busCode?.trim()) {
      andFilters.push({ busCode: { contains: filters.busCode.trim(), mode: 'insensitive' } });
    }
    if (filters.arriveDate?.trim()) {
      andFilters.push({ arriveDate: this.toDateOrNull(filters.arriveDate.trim()) });
    }
    if (filters.excludeLinked) {
      const linkedRows = await this.prisma.bonusCard.findMany({
        where: {
          nameListCode: { not: '' },
          ...(filters.currentBonusCardId ? { id: { not: filters.currentBonusCardId } } : {}),
        },
        select: { nameListCode: true },
      });
      const linkedCodes = [...new Set(linkedRows.map((row) => row.nameListCode).filter(Boolean))];
      if (linkedCodes.length > 0) {
        andFilters.push({ code: { notIn: linkedCodes } });
      }
    }
    const rows = await this.prisma.nameList.findMany({
      where: andFilters.length ? { AND: andFilters } : undefined,
      include: {
        items: {
          orderBy: [{ itemNo: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [{ createdAt: 'desc' }, { code: 'asc' }],
      take: 500,
    });

    return rows.map((row) => this.toResponse(row));
  }

  async findOne(id: string) {
    const row = await this.prisma.nameList.findUnique({
      where: { id },
      include: {
        items: {
          orderBy: [{ itemNo: 'asc' }, { createdAt: 'asc' }],
        },
      },
    });
    if (!row) {
      throw new NotFoundException(`Name list "${id}" not found`);
    }
    return this.toResponse(row);
  }

  async nextCode(date = this.todayText()) {
    const year = date.slice(2, 4);
    const month = date.slice(5, 7);
    const prefix = `GEI-N-L${year}${month}`;
    const rows = await this.prisma.nameList.findMany({
      where: { code: { startsWith: prefix } },
      select: { code: true },
    });
    const used = new Set(
      rows
        .map((row) => Number(row.code.slice(prefix.length)))
        .filter((value) => Number.isInteger(value) && value >= 1 && value <= 9999),
    );
    for (let index = 1; index <= 9999; index += 1) {
      if (!used.has(index)) {
        return { code: `${prefix}${String(index).padStart(4, '0')}` };
      }
    }
    throw new BadRequestException(`Name list code sequence for ${year}/${month} is full`);
  }

  async create(dto: CreateNameListDto) {
    const code = dto.code.trim();
    const existing = await this.prisma.nameList.findUnique({
      where: { code },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException(`Name list code "${code}" already exists`);
    }

    const row = await this.prisma.nameList.create({
      data: this.toCreateData({ ...dto, code }),
      include: { items: { orderBy: [{ itemNo: 'asc' }, { createdAt: 'asc' }] } },
    });
    return this.toResponse(row);
  }

  async update(id: string, dto: UpdateNameListDto) {
    await this.ensureExists(id);
    const nextCode = dto.code?.trim();
    if (nextCode) {
      const existing = await this.prisma.nameList.findUnique({
        where: { code: nextCode },
        select: { id: true },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(`Name list code "${nextCode}" already exists`);
      }
    }

    const row = await this.prisma.nameList.update({
      where: { id },
      data: this.toUpdateData({ ...dto, ...(nextCode ? { code: nextCode } : {}) }),
      include: { items: { orderBy: [{ itemNo: 'asc' }, { createdAt: 'asc' }] } },
    });
    return this.toResponse(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.nameList.delete({ where: { id } });
    return { message: 'Name list deleted successfully' };
  }

  previewImport(dto: ImportNameListDto) {
    const parsed = this.parseImport(dto);
    return {
      ...parsed.preview,
      partyCode: parsed.partyCode,
      agentCode: parsed.agentCode,
      agentName: parsed.agentName,
      receivedDate: parsed.arriveDate,
      totalRows: parsed.items.length,
    };
  }

  async importExcel(dto: ImportNameListDto) {
    const parsed = this.parseImport(dto);
    const created = await this.create({
      code: parsed.code,
      partyCode: parsed.partyCode,
      arriveDate: parsed.arriveDate,
      agentCode: parsed.agentCode,
      agentName: parsed.agentName,
      pax: parsed.pax,
      sourceFile: parsed.sourceFile,
      items: parsed.items,
    });
    return {
      imported: parsed.items.length,
      nameList: created,
    };
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.nameList.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Name list "${id}" not found`);
    }
  }

  private toCreateData(dto: CreateNameListDto): Prisma.NameListCreateInput {
    const nationCode = this.resolveNationCode(dto.nationCode, dto.items);
    return {
      code: dto.code.trim(),
      partyCode: dto.partyCode ?? '',
      arriveDate: this.toDateOrNull(dto.arriveDate),
      departDate: this.toDateOrNull(dto.departDate),
      agentCode: dto.agentCode ?? '',
      agentName: dto.agentName ?? '',
      guideCode: dto.guideCode ?? '',
      guideName: dto.guideName ?? '',
      nationCode,
      nationName: dto.nationName ?? '',
      country: dto.country ?? '',
      province: dto.province ?? '',
      busCode: dto.busCode ?? '',
      pax: dto.pax ?? dto.items?.length ?? 0,
      sourceFile: dto.sourceFile ?? '',
      note: dto.note ?? '',
      items: {
        create: (dto.items ?? []).map((item, index) =>
          this.toItemCreateData(item, index),
        ),
      },
    };
  }

  private toUpdateData(dto: UpdateNameListDto): Prisma.NameListUpdateInput {
    const nationCode = this.resolveNationCode(dto.nationCode, dto.items);
    const update: Prisma.NameListUpdateInput = {
      ...(dto.code !== undefined ? { code: dto.code.trim() } : {}),
      ...(dto.partyCode !== undefined ? { partyCode: dto.partyCode } : {}),
      ...(dto.arriveDate !== undefined
        ? { arriveDate: this.toDateOrNull(dto.arriveDate) }
        : {}),
      ...(dto.departDate !== undefined
        ? { departDate: this.toDateOrNull(dto.departDate) }
        : {}),
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode } : {}),
      ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
      ...(dto.guideCode !== undefined ? { guideCode: dto.guideCode } : {}),
      ...(dto.guideName !== undefined ? { guideName: dto.guideName } : {}),
      ...(dto.nationCode !== undefined || (dto.items && nationCode)
        ? { nationCode }
        : {}),
      ...(dto.nationName !== undefined ? { nationName: dto.nationName } : {}),
      ...(dto.country !== undefined ? { country: dto.country } : {}),
      ...(dto.province !== undefined ? { province: dto.province } : {}),
      ...(dto.busCode !== undefined ? { busCode: dto.busCode } : {}),
      ...(dto.pax !== undefined ? { pax: dto.pax } : {}),
      ...(dto.sourceFile !== undefined ? { sourceFile: dto.sourceFile } : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
    };

    if (dto.items) {
      update.items = {
        deleteMany: {},
        create: dto.items.map((item, index) => this.toItemCreateData(item, index)),
      };
      if (dto.pax === undefined) {
        update.pax = dto.items.length;
      }
    }

    return update;
  }

  private toItemCreateData(
    item: NameListItemDto,
    index: number,
  ): Prisma.NameListItemCreateWithoutNameListInput {
    return {
      itemNo: item.itemNo ?? index + 1,
      isLeader: item.isLeader ?? false,
      agentCode: item.agentCode ?? '',
      code: item.code ?? '',
      guideCode: item.guideCode ?? '',
      guideName: item.guideName ?? '',
      arriveDate: this.toDateOrNull(item.arriveDate),
      passportNo: item.passportNo ?? '',
      firstName: item.firstName ?? '',
      lastName: item.lastName ?? '',
      birthDate: this.toDateOrNull(item.birthDate),
      age: item.age,
      gender: item.gender ?? '',
      nationCode: item.nationCode ?? '',
      province: item.province ?? '',
      location: item.location ?? '',
    };
  }

  private resolveNationCode(
    current?: string,
    items?: NameListItemDto[],
  ) {
    const trimmed = current?.trim();
    if (trimmed) {
      return trimmed;
    }

    const counts = new Map<string, number>();
    for (const item of items ?? []) {
      const code = item.nationCode?.trim();
      if (!code) continue;
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  }

  private toDateOrNull(value?: string | null) {
    if (!value) {
      return null;
    }
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private toDateText(value: Date | null) {
    return value ? value.toISOString().slice(0, 10) : '';
  }

  private parseImport(dto: ImportNameListDto): ParsedNameList {
    const fileBuffer = this.decodeBase64(dto.fileBase64);
    const workbook = XLSX.read(fileBuffer, { type: 'buffer', cellDates: false });
    const sheetIndex = Math.max((dto.sheetIndex ?? 1) - 1, 0);
    const sheetName = workbook.SheetNames[sheetIndex] ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) {
      throw new BadRequestException('Excel sheet not found');
    }

    const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
      header: 1,
      raw: false,
      defval: '',
    }) as string[][];
    const headerRowIndex = this.findHeaderRow(rows);
    if (headerRowIndex < 0) {
      throw new BadRequestException('Cannot detect passenger header row in this Excel file');
    }

    const headers = rows[headerRowIndex].map((cell: string) =>
      this.normalizeHeader(cell),
    );
    const columnMap = this.applyColumnOverrides(
      this.buildColumnMap(headers),
      dto.columnOverrides,
    );
    const warnings = this.validateColumnMap(columnMap);
    const hasItemNoColumn = columnMap.itemNo !== undefined;
    const dataRows = rows
      .slice(headerRowIndex + 1)
      .filter((row: string[]) =>
        this.isPassengerDataRow(row, columnMap, hasItemNoColumn),
      );
    const items = dataRows
      .map((row: string[], index: number) =>
        this.rowToItem(row, index, columnMap, dto),
      )
      .filter(
        (item: NameListItemDto) =>
          item.passportNo || item.firstName || item.lastName,
      );

    if (!items.length) {
      throw new BadRequestException('No passenger rows found in this Excel file');
    }

    const partyCode = dto.partyCode.trim() || this.partyCodeFromFileName(dto.fileName);
    return {
      code: partyCode,
      partyCode,
      arriveDate: this.parseDateInput(dto.receivedDate) || this.todayText(),
      agentCode: dto.agentCode.trim(),
      agentName: dto.agentName.trim(),
      sourceFile: dto.fileName,
      pax: items.length,
      items,
      preview: {
        sheetName,
        headerRow: headerRowIndex + 1,
        columnMap: this.toColumnMapResponse(columnMap),
        sampleRows: items,
        warnings,
      },
    };
  }

  private decodeBase64(fileBase64: string) {
    const payload = fileBase64.includes(',')
      ? fileBase64.split(',').pop() ?? ''
      : fileBase64;
    if (!payload) {
      throw new BadRequestException('Excel file is required');
    }
    return Buffer.from(payload, 'base64');
  }

  private findHeaderRow(rows: string[][]) {
    let best = { index: -1, score: 0 };
    rows.slice(0, 40).forEach((row, index) => {
      const normalized = row.map((cell) => this.normalizeHeader(cell));
      const score = normalized.reduce((sum, cell) => sum + this.headerScore(cell), 0);
      if (score > best.score) {
        best = { index, score };
      }
    });
    return best.score >= 5 ? best.index : -1;
  }

  private headerScore(header: string) {
    if (/(?:\u5e8f\u53f7|\u7f16\u53f7|no|item)/.test(header)) return 2;
    if (/(?:\u62a4\u7167|\u8b77\u7167|passport)/.test(header)) return 3;
    if (/(?:\u82f1\u6587|\u4e2d\u6587|\u59d3\u540d|name)/.test(header)) return 2;
    if (/(?:\u51fa\u751f|birth)/.test(header)) return 2;
    if (/(?:\u6027[\u522b\u5225]|gender|sex)/.test(header)) return 1;
    if (/(?:\u5e74\u9f84|\u5e74\u9f61|age)/.test(header)) return 1;
    if (!header) return 0;
    if (/序号|no|item/.test(header)) return 2;
    if (/护照|passport/.test(header)) return 3;
    if (/英文|姓名|name/.test(header)) return 2;
    if (/出生|birth/.test(header)) return 2;
    if (/性别|gender|sex/.test(header)) return 1;
    if (/年龄|age/.test(header)) return 1;
    return 0;
  }

  private buildColumnMap(headers: string[]): ColumnMap {
    const find = (...patterns: RegExp[]) => {
      const index = headers.findIndex((header) =>
        patterns.some((pattern) => pattern.test(header)),
      );
      return index === -1 ? undefined : index;
    };
    const map: ColumnMap = {};

    map.itemNo = find(/序号|^no\.?$|^item$/);
    map.chineseName = find(/中文名|客户姓名|姓名/);
    map.englishSurname = find(/英文姓|姓拼音|surname|last/);
    map.englishGiven =
      map.englishSurname === undefined
        ? undefined
        : find(/英文名$|名拼音|given|first/);
    map.englishName =
      map.englishSurname === undefined
        ? find(/英文名|英文姓名|english.*name|name/)
        : undefined;
    if (map.englishName === undefined && map.englishGiven === undefined) {
      map.englishName = find(/name.*surname|name.*surename|surename/);
    }
    map.birthDate = find(/出生日期|出生年月|birth/);
    map.age = find(/年龄|age/);
    map.gender = find(/性别|gender|sex/);
    map.location = find(/出生地|birth.*place/);
    map.passportNo = find(/护照号|passport/);
    map.province = find(/签发地|province/);
    map.remark = find(/备注|remark|note/);

    map.itemNo ??= find(/(?:\u5e8f\u53f7|\u7f16\u53f7)|^no\.?$|^item$/);
    map.chineseName ??= find(/(?:\u4e2d\u6587.*\u59d3\u540d|\u5ba2\u6237.*\u59d3\u540d|\u59d3\u540d)/);
    map.englishSurname ??= find(/(?:\u62a4\u7167)?\u82f1\u6587.*(?:\u59d3|surname)|surname|last/);
    map.englishGiven ??= find(/(?:\u62a4\u7167)?\u82f1\u6587.*(?:\u540d|given|first)|given|first/);
    if (map.englishSurname !== undefined && map.englishGiven === map.englishSurname) {
      map.englishGiven = undefined;
    }
    map.englishName ??= map.englishSurname === undefined
      ? find(/(?:\u62a4\u7167)?\u82f1\u6587.*\u59d3?\u540d|english.*name|name/)
      : undefined;
    map.birthDate ??= find(/(?:\u51fa\u751f.*(?:\u65e5\u671f|\u5e74|\u6708)|birth)/);
    map.age ??= find(/(?:\u5e74\u9f84|\u5e74\u9f61|age)/);
    map.gender ??= find(/(?:\u6027[\u522b\u5225]|gender|sex)/);
    map.location ??= find(/(?:\u51fa\u751f\u5730|birth.*place)/);
    map.passportNo ??= find(/(?:\u62a4\u7167.*(?:\u53f7\u7801|\u53f7)|\u8b77\u7167.*(?:\u865f\u78bc|\u865f)|passport)/);
    map.province ??= find(/(?:\u7b7e\u53d1\u5730|\u7c3d\u767c\u5730|province)/);
    map.remark ??= find(/(?:\u5907\u6ce8|\u5099\u8a3b|remark|note)/);

    return Object.fromEntries(
      Object.entries(map).filter(([, value]) => value !== undefined),
    ) as ColumnMap;
  }

  private validateColumnMap(map: ColumnMap) {
    const warnings: string[] = [];
    if (map.passportNo === undefined) warnings.push('Passport column was not detected.');
    if (
      map.englishName === undefined &&
      (map.englishGiven === undefined || map.englishSurname === undefined)
    ) {
      warnings.push('English name columns were not detected clearly.');
    }
    if (map.birthDate === undefined) warnings.push('Birth date column was not detected.');
    if (map.itemNo === undefined) {
      warnings.push('Sequence column was not detected; rows will be detected from passenger data.');
    }
    return warnings;
  }

  private applyColumnOverrides(
    detected: ColumnMap,
    overrides?: Record<string, string>,
  ) {
    if (!overrides) return detected;
    const next: ColumnMap = { ...detected };
    Object.entries(overrides).forEach(([key, value]) => {
      if (!this.isColumnKey(key)) return;
      const index = this.columnLetterToIndex(value);
      if (index === undefined) {
        delete next[key];
      } else {
        next[key] = index;
      }
    });
    return next;
  }

  private isColumnKey(key: string): key is keyof ColumnMap {
    return [
      'itemNo',
      'chineseName',
      'englishSurname',
      'englishGiven',
      'englishName',
      'birthDate',
      'age',
      'gender',
      'location',
      'passportNo',
      'province',
      'remark',
    ].includes(key);
  }

  private columnLetterToIndex(value: string) {
    const normalized = String(value ?? '').trim().toUpperCase();
    if (!normalized) return undefined;
    let index = 0;
    for (const char of normalized) {
      const code = char.charCodeAt(0) - 64;
      if (code < 1 || code > 26) return undefined;
      index = index * 26 + code;
    }
    return index - 1;
  }

  private rowToItem(
    row: string[],
    index: number,
    map: ColumnMap,
    dto: ImportNameListDto,
  ): NameListItemDto {
    const itemNo = this.toNumber(this.cell(row, map.itemNo)) ?? index + 1;
    const englishSurname = this.cell(row, map.englishSurname);
    const englishGiven = this.cell(row, map.englishGiven);
    const englishName = this.cell(row, map.englishName);
    const splitName = this.splitEnglishName(englishName);
    const remark = this.cell(row, map.remark);
    const birthDate = this.parseDateInput(this.cell(row, map.birthDate));
    const age = this.toNumber(this.cell(row, map.age)) ?? this.calculateAge(birthDate);

    return {
      itemNo,
      isLeader: /领队|leader/i.test(remark),
      agentCode: dto.agentCode.trim(),
      code: dto.partyCode.trim() || this.partyCodeFromFileName(dto.fileName),
      arriveDate: this.parseDateInput(dto.receivedDate) || this.todayText(),
      passportNo: this.cleanPassportNo(this.cell(row, map.passportNo)),
      firstName: englishGiven || splitName.firstName,
      lastName: englishSurname || splitName.lastName,
      birthDate,
      age,
      gender: this.normalizeGender(this.cell(row, map.gender)),
      nationCode: 'CN',
      province: this.cleanPlace(this.cell(row, map.province) || this.cell(row, map.location)),
      location: this.cleanPlace(this.cell(row, map.location)),
    };
  }

  private isPassengerDataRow(row: string[], map: ColumnMap, hasItemNoColumn: boolean) {
    const itemNo = this.toNumber(this.cell(row, map.itemNo));
    const hasNumberedItem = itemNo !== undefined;
    const hasPassport = Boolean(this.cell(row, map.passportNo));
    const hasName = Boolean(
      this.cell(row, map.englishGiven) ||
        this.cell(row, map.englishSurname) ||
        this.cell(row, map.englishName) ||
        this.cell(row, map.chineseName),
    );
    const hasBirthDate = Boolean(this.parseDateInput(this.cell(row, map.birthDate)));
    const hasGender = Boolean(this.normalizeGender(this.cell(row, map.gender)));
    const hasAge = this.toNumber(this.cell(row, map.age)) !== undefined;
    const hasPassengerIdentity =
      (hasPassport && hasName && (hasBirthDate || hasGender || hasAge)) ||
      (hasPassport && hasBirthDate && hasGender) ||
      (hasName && hasBirthDate && (hasGender || hasAge));

    if (hasItemNoColumn) {
      return hasNumberedItem && hasPassengerIdentity;
    }

    return hasPassengerIdentity;
  }

  private cell(row: string[], index?: number) {
    if (index === undefined || index < 0) return '';
    return String(row[index] ?? '').trim();
  }

  private normalizeHeader(value: string) {
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
  }

  private splitEnglishName(value: string) {
    const slashParts = value
      .trim()
      .replace(/\s+/g, ' ')
      .split('/')
      .map((part) => part.trim())
      .filter(Boolean);
    if (slashParts.length >= 2) {
      return { firstName: slashParts.slice(1).join(' '), lastName: slashParts[0] };
    }

    const parts = value.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
    if (!parts.length) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  private normalizeGender(value: string) {
    if (/^\u7537$/.test(value.trim())) return 'M';
    if (/^\u5973$/.test(value.trim())) return 'F';
    if (/^m$|男|male/i.test(value)) return 'M';
    if (/^f$|女|female/i.test(value)) return 'F';
    return value.trim();
  }

  private cleanPlace(value: string) {
    return value.split('/')[0]?.trim() ?? '';
  }

  private cleanPassportNo(value: string) {
    return value
      .trim()
      .replace(/^\$+\s*/, '')
      .replace(/\s+/g, ' ');
  }

  private toNumber(value: string) {
    const normalized = String(value ?? '').replace(/[^\d.-]/g, '');
    if (!normalized) return undefined;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : undefined;
  }

  private parseDateInput(value?: string | null) {
    if (!value) return '';
    const text = String(value).trim();
    const serial = Number(text);
    if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
      const parsed = XLSX.SSF.parse_date_code(serial);
      if (parsed) {
        return `${parsed.y}-${String(parsed.m).padStart(2, '0')}-${String(parsed.d).padStart(2, '0')}`;
      }
    }

    const dateOnly = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
    if (dateOnly) {
      return `${dateOnly[1]}-${dateOnly[2].padStart(2, '0')}-${dateOnly[3].padStart(2, '0')}`;
    }
    const dateTime = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})\s+\d{1,2}:\d{2}(?::\d{2})?/);
    if (dateTime) {
      return `${dateTime[1]}-${dateTime[2].padStart(2, '0')}-${dateTime[3].padStart(2, '0')}`;
    }
    const thaiStyle = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (thaiStyle) {
      return `${thaiStyle[3]}-${thaiStyle[2].padStart(2, '0')}-${thaiStyle[1].padStart(2, '0')}`;
    }
    const shortSlashDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2})$/);
    if (shortSlashDate) {
      const first = Number(shortSlashDate[1]);
      const second = Number(shortSlashDate[2]);
      const year = Number(shortSlashDate[3]);
      const fullYear = year >= 30 ? 1900 + year : 2000 + year;
      const month = first > 12 ? second : first;
      const day = first > 12 ? first : second;
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return `${fullYear}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      }
    }
    return '';
  }

  private calculateAge(birthDate: string) {
    if (!birthDate) return undefined;
    const match = birthDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return undefined;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const today = new Date();
    let age = today.getFullYear() - year;
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
      age -= 1;
    }

    return age >= 0 && age < 130 ? age : undefined;
  }

  private partyCodeFromFileName(fileName: string) {
    return fileName
      .replace(/\.[^.]+$/, '')
      .split(/[-\s]*名单/i)[0]
      .trim();
  }

  private todayText() {
    return new Date().toISOString().slice(0, 10);
  }

  private toColumnMapResponse(map: ColumnMap) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Object.fromEntries(
      Object.entries(map).map(([key, value]) => [
        key,
        value === undefined ? '' : letters[value] ?? String(value + 1),
      ]),
    );
  }

  private toResponse(
    row: Prisma.NameListGetPayload<{ include: { items: true } }>,
  ) {
    return {
      ...row,
      arriveDate: this.toDateText(row.arriveDate),
      departDate: this.toDateText(row.departDate),
      items: row.items.map((item) => ({
        ...item,
        arriveDate: this.toDateText(item.arriveDate),
        birthDate: this.toDateText(item.birthDate),
      })),
    };
  }
}
