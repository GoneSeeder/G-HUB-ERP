import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonusCardDto } from './dto/create-bonus-card.dto';
import { UpdateBonusCardDto } from './dto/update-bonus-card.dto';

type BonusGuide = {
  code: string;
  name: string;
  phone: string;
};

type BonusNarrator = {
  code: string;
  name: string;
};

@Injectable()
export class BonusCardsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { workDate?: string; from?: string; to?: string } = {}) {
    const where: Prisma.BonusCardWhereInput = {};
    if (filters.from || filters.to) {
      where.workDate = {
        ...(filters.from ? { gte: this.toDate(filters.from) } : {}),
        ...(filters.to ? { lte: this.toDate(filters.to) } : {}),
      };
    } else if (filters.workDate) {
      where.workDate = this.toDate(filters.workDate);
    }
    const rows = await this.prisma.bonusCard.findMany({
      where,
      orderBy: [{ workDate: 'desc' }, { bonus: 'asc' }],
    });
    return rows.map((row) => this.toResponse(row));
  }

  async create(dto: CreateBonusCardDto) {
    const row = await this.prisma.bonusCard.create({
      data: this.toCreateData(dto),
    });
    return this.toResponse(row);
  }

  async update(id: string, dto: UpdateBonusCardDto) {
    await this.ensureExists(id);
    const row = await this.prisma.bonusCard.update({
      where: { id },
      data: this.toUpdateData(dto),
    });
    return this.toResponse(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.bonusCard.delete({ where: { id } });
    return { message: 'Bonus card deleted successfully' };
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.bonusCard.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Bonus card "${id}" not found`);
    }
  }

  private toCreateData(dto: CreateBonusCardDto): Prisma.BonusCardCreateInput {
    return {
      workDate: this.toDate(dto.workDate),
      bonus: dto.bonus,
      bonusName: dto.bonusName,
      agentCode: dto.agentCode,
      agentName: dto.agentName,
      companyCode: dto.companyCode ?? '',
      guide: dto.guide,
      guideName: dto.guideName,
      memberCode: dto.memberCode ?? '',
      supervisorCode: dto.supervisorCode ?? '',
      partyCode: dto.partyCode,
      nation: dto.nation,
      province: dto.province ?? '',
      adult: dto.adult,
      child: dto.child,
      tourLeader: dto.tourLeader,
      student: dto.student ?? 0,
      carCode: dto.carCode ?? '',
      shop: dto.shop ?? '',
      charterCode: dto.charterCode ?? '',
      hotel: dto.hotel ?? '',
      comeFrom: dto.comeFrom ?? '',
      busType: dto.busType ?? '',
      tourIn: dto.tourIn ?? '',
      tourOut: dto.tourOut ?? '',
      comment: dto.comment ?? '',
      imageUrl: dto.imageUrl,
      nameListCode: dto.nameListCode ?? '',
      extraGuides: this.sanitizeGuides(dto.extraGuides),
      narratorGroup: dto.narratorGroup ?? '',
      narratorPax: dto.narratorPax ?? 0,
      narrators: this.sanitizeNarrators(dto.narrators),
    };
  }

  private toUpdateData(dto: UpdateBonusCardDto): Prisma.BonusCardUpdateInput {
    return {
      ...(dto.workDate ? { workDate: this.toDate(dto.workDate) } : {}),
      ...(dto.bonus !== undefined ? { bonus: dto.bonus } : {}),
      ...(dto.bonusName !== undefined ? { bonusName: dto.bonusName } : {}),
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode } : {}),
      ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
      ...(dto.companyCode !== undefined ? { companyCode: dto.companyCode } : {}),
      ...(dto.guide !== undefined ? { guide: dto.guide } : {}),
      ...(dto.guideName !== undefined ? { guideName: dto.guideName } : {}),
      ...(dto.memberCode !== undefined ? { memberCode: dto.memberCode } : {}),
      ...(dto.supervisorCode !== undefined ? { supervisorCode: dto.supervisorCode } : {}),
      ...(dto.partyCode !== undefined ? { partyCode: dto.partyCode } : {}),
      ...(dto.nation !== undefined ? { nation: dto.nation } : {}),
      ...(dto.province !== undefined ? { province: dto.province } : {}),
      ...(dto.adult !== undefined ? { adult: dto.adult } : {}),
      ...(dto.child !== undefined ? { child: dto.child } : {}),
      ...(dto.tourLeader !== undefined ? { tourLeader: dto.tourLeader } : {}),
      ...(dto.student !== undefined ? { student: dto.student } : {}),
      ...(dto.carCode !== undefined ? { carCode: dto.carCode } : {}),
      ...(dto.shop !== undefined ? { shop: dto.shop } : {}),
      ...(dto.charterCode !== undefined ? { charterCode: dto.charterCode } : {}),
      ...(dto.hotel !== undefined ? { hotel: dto.hotel } : {}),
      ...(dto.comeFrom !== undefined ? { comeFrom: dto.comeFrom } : {}),
      ...(dto.busType !== undefined ? { busType: dto.busType } : {}),
      ...(dto.tourIn !== undefined ? { tourIn: dto.tourIn } : {}),
      ...(dto.tourOut !== undefined ? { tourOut: dto.tourOut } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.nameListCode !== undefined ? { nameListCode: dto.nameListCode } : {}),
      ...(dto.extraGuides !== undefined ? { extraGuides: this.sanitizeGuides(dto.extraGuides) } : {}),
      ...(dto.narratorGroup !== undefined ? { narratorGroup: dto.narratorGroup } : {}),
      ...(dto.narratorPax !== undefined ? { narratorPax: dto.narratorPax } : {}),
      ...(dto.narrators !== undefined ? { narrators: this.sanitizeNarrators(dto.narrators) } : {}),
    };
  }

  private toDate(value: string) {
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private toResponse(row: {
    id: string;
    workDate: Date;
    bonus: string;
    bonusName: string;
    agentCode: string;
    agentName: string;
    companyCode: string;
    guide: string;
    guideName: string;
    memberCode: string;
    supervisorCode: string;
    partyCode: string;
    nation: string;
    province: string;
    adult: number;
    child: number;
    tourLeader: number;
    student: number;
    carCode: string;
    shop: string;
    charterCode: string;
    hotel: string;
    comeFrom: string;
    busType: string;
    tourIn: string;
    tourOut: string;
    comment: string;
    imageUrl: string | null;
    nameListCode: string;
    extraGuides: Prisma.JsonValue;
    narratorGroup: string;
    narratorPax: number;
    narrators: Prisma.JsonValue;
  }) {
    return {
      ...row,
      workDate: row.workDate.toISOString().slice(0, 10),
      imageUrl: row.imageUrl ?? '',
      extraGuides: this.normalizeGuides(row.extraGuides),
      narrators: this.normalizeNarrators(row.narrators),
    };
  }

  private sanitizeGuides(value: CreateBonusCardDto['extraGuides']): Prisma.InputJsonValue {
    return (value ?? [])
      .map((guide) => ({
        code: String(guide.code ?? '').trim(),
        name: String(guide.name ?? '').trim(),
        phone: String(guide.phone ?? '').trim(),
      }))
      .filter((guide) => guide.code || guide.name || guide.phone);
  }

  private sanitizeNarrators(value: CreateBonusCardDto['narrators']): Prisma.InputJsonValue {
    return (value ?? [])
      .map((narrator) => ({
        code: String(narrator.code ?? '').trim(),
        name: String(narrator.name ?? '').trim(),
      }))
      .filter((narrator) => narrator.code || narrator.name);
  }

  private normalizeGuides(value: Prisma.JsonValue): BonusGuide[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const guide = item as Record<string, unknown>;
        return {
          code: String(guide.code ?? '').trim(),
          name: String(guide.name ?? '').trim(),
          phone: String(guide.phone ?? '').trim(),
        };
      })
      .filter((guide): guide is BonusGuide => Boolean(guide && (guide.code || guide.name || guide.phone)));
  }

  private normalizeNarrators(value: Prisma.JsonValue): BonusNarrator[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
        const narrator = item as Record<string, unknown>;
        return {
          code: String(narrator.code ?? '').trim(),
          name: String(narrator.name ?? '').trim(),
        };
      })
      .filter((narrator): narrator is BonusNarrator => Boolean(narrator && (narrator.code || narrator.name)));
  }
}
