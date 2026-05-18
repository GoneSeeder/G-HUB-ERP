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
    const rows = await this.prisma.nameList.findMany({
      where: contains
        ? {
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
            ],
          }
        : undefined,
      include: {
        items: {
          orderBy: [{ itemNo: 'asc' }, { createdAt: 'asc' }],
        },
      },
      orderBy: [{ arriveDate: 'desc' }, { code: 'asc' }],
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
    return {
      code: dto.code.trim(),
      partyCode: dto.partyCode ?? '',
      arriveDate: this.toDateOrNull(dto.arriveDate),
      departDate: this.toDateOrNull(dto.departDate),
      agentCode: dto.agentCode ?? '',
      agentName: dto.agentName ?? '',
      guideCode: dto.guideCode ?? '',
      guideName: dto.guideName ?? '',
      nationCode: dto.nationCode ?? '',
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
      ...(dto.nationCode !== undefined ? { nationCode: dto.nationCode } : {}),
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
    });
    const headerRowIndex = this.findHeaderRow(rows);
    if (headerRowIndex < 0) {
      throw new BadRequestException('Cannot detect passenger header row in this Excel file');
    }

    const headers = rows[headerRowIndex].map((cell) => this.normalizeHeader(cell));
    const columnMap = this.buildColumnMap(headers);
    const warnings = this.validateColumnMap(columnMap);
    const items = rows
      .slice(headerRowIndex + 1)
      .map((row, index) => this.rowToItem(row, index, columnMap, dto))
      .filter((item) => item.passportNo || item.firstName || item.lastName);

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
        sampleRows: items.slice(0, 12),
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
    const find = (...patterns: RegExp[]) =>
      headers.findIndex((header) => patterns.some((pattern) => pattern.test(header)));
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
    map.birthDate = find(/出生日期|出生年月|birth/);
    map.age = find(/年龄|age/);
    map.gender = find(/性别|gender|sex/);
    map.location = find(/出生地|birth.*place/);
    map.passportNo = find(/护照号|passport/);
    map.province = find(/签发地|province/);
    map.remark = find(/备注|remark|note/);

    return Object.fromEntries(
      Object.entries(map).filter(([, value]) => value !== -1),
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
    return warnings;
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

    return {
      itemNo,
      isLeader: /领队|leader/i.test(remark),
      agentCode: dto.agentCode.trim(),
      code: dto.partyCode.trim() || this.partyCodeFromFileName(dto.fileName),
      arriveDate: this.parseDateInput(dto.receivedDate) || this.todayText(),
      passportNo: this.cell(row, map.passportNo),
      firstName: englishGiven || splitName.firstName,
      lastName: englishSurname || splitName.lastName,
      birthDate: this.parseDateInput(this.cell(row, map.birthDate)),
      age: this.toNumber(this.cell(row, map.age)),
      gender: this.normalizeGender(this.cell(row, map.gender)),
      nationCode: 'CN',
      province: this.cleanPlace(this.cell(row, map.province) || this.cell(row, map.location)),
      location: this.cleanPlace(this.cell(row, map.location)),
    };
  }

  private cell(row: string[], index?: number) {
    if (index === undefined || index < 0) return '';
    return String(row[index] ?? '').trim();
  }

  private normalizeHeader(value: string) {
    return String(value ?? '').trim().toLowerCase().replace(/\s+/g, '');
  }

  private splitEnglishName(value: string) {
    const parts = value.trim().replace(/\s+/g, ' ').split(' ').filter(Boolean);
    if (!parts.length) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: '' };
    return { firstName: parts[0], lastName: parts.slice(1).join(' ') };
  }

  private normalizeGender(value: string) {
    if (/^m$|男|male/i.test(value)) return 'M';
    if (/^f$|女|female/i.test(value)) return 'F';
    return value.trim();
  }

  private cleanPlace(value: string) {
    return value.split('/')[0]?.trim() ?? '';
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
    const thaiStyle = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
    if (thaiStyle) {
      return `${thaiStyle[3]}-${thaiStyle[2].padStart(2, '0')}-${thaiStyle[1].padStart(2, '0')}`;
    }
    return '';
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
