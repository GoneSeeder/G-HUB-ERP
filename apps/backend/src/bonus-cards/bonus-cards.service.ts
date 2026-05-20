import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBonusCardDto } from './dto/create-bonus-card.dto';
import { UpdateBonusCardDto } from './dto/update-bonus-card.dto';

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
      guide: dto.guide,
      guideName: dto.guideName,
      partyCode: dto.partyCode,
      nation: dto.nation,
      adult: dto.adult,
      child: dto.child,
      tourLeader: dto.tourLeader,
      carCode: dto.carCode ?? '',
      shop: dto.shop ?? '',
      hotel: dto.hotel ?? '',
      comeFrom: dto.comeFrom ?? '',
      busType: dto.busType ?? '',
      tourIn: dto.tourIn ?? '',
      tourOut: dto.tourOut ?? '',
      comment: dto.comment ?? '',
      imageUrl: dto.imageUrl,
      nameListCode: dto.nameListCode ?? '',
      guide2: dto.guide2 ?? '',
      guide2Name: dto.guide2Name ?? '',
      guide2Phone: dto.guide2Phone ?? '',
      guide3: dto.guide3 ?? '',
      guide3Name: dto.guide3Name ?? '',
      guide3Phone: dto.guide3Phone ?? '',
      narratorCode: dto.narratorCode ?? '',
      narratorName: dto.narratorName ?? '',
      narratorPhone: dto.narratorPhone ?? '',
    };
  }

  private toUpdateData(dto: UpdateBonusCardDto): Prisma.BonusCardUpdateInput {
    return {
      ...(dto.workDate ? { workDate: this.toDate(dto.workDate) } : {}),
      ...(dto.bonus !== undefined ? { bonus: dto.bonus } : {}),
      ...(dto.bonusName !== undefined ? { bonusName: dto.bonusName } : {}),
      ...(dto.agentCode !== undefined ? { agentCode: dto.agentCode } : {}),
      ...(dto.agentName !== undefined ? { agentName: dto.agentName } : {}),
      ...(dto.guide !== undefined ? { guide: dto.guide } : {}),
      ...(dto.guideName !== undefined ? { guideName: dto.guideName } : {}),
      ...(dto.partyCode !== undefined ? { partyCode: dto.partyCode } : {}),
      ...(dto.nation !== undefined ? { nation: dto.nation } : {}),
      ...(dto.adult !== undefined ? { adult: dto.adult } : {}),
      ...(dto.child !== undefined ? { child: dto.child } : {}),
      ...(dto.tourLeader !== undefined ? { tourLeader: dto.tourLeader } : {}),
      ...(dto.carCode !== undefined ? { carCode: dto.carCode } : {}),
      ...(dto.shop !== undefined ? { shop: dto.shop } : {}),
      ...(dto.hotel !== undefined ? { hotel: dto.hotel } : {}),
      ...(dto.comeFrom !== undefined ? { comeFrom: dto.comeFrom } : {}),
      ...(dto.busType !== undefined ? { busType: dto.busType } : {}),
      ...(dto.tourIn !== undefined ? { tourIn: dto.tourIn } : {}),
      ...(dto.tourOut !== undefined ? { tourOut: dto.tourOut } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
      ...(dto.nameListCode !== undefined ? { nameListCode: dto.nameListCode } : {}),
      ...(dto.guide2 !== undefined ? { guide2: dto.guide2 } : {}),
      ...(dto.guide2Name !== undefined ? { guide2Name: dto.guide2Name } : {}),
      ...(dto.guide2Phone !== undefined ? { guide2Phone: dto.guide2Phone } : {}),
      ...(dto.guide3 !== undefined ? { guide3: dto.guide3 } : {}),
      ...(dto.guide3Name !== undefined ? { guide3Name: dto.guide3Name } : {}),
      ...(dto.guide3Phone !== undefined ? { guide3Phone: dto.guide3Phone } : {}),
      ...(dto.narratorCode !== undefined ? { narratorCode: dto.narratorCode } : {}),
      ...(dto.narratorName !== undefined ? { narratorName: dto.narratorName } : {}),
      ...(dto.narratorPhone !== undefined ? { narratorPhone: dto.narratorPhone } : {}),
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
    guide: string;
    guideName: string;
    partyCode: string;
    nation: string;
    adult: number;
    child: number;
    tourLeader: number;
    carCode: string;
    shop: string;
    hotel: string;
    comeFrom: string;
    busType: string;
    tourIn: string;
    tourOut: string;
    comment: string;
    imageUrl: string | null;
    nameListCode: string;
    guide2: string;
    guide2Name: string;
    guide2Phone: string;
    guide3: string;
    guide3Name: string;
    guide3Phone: string;
    narratorCode: string;
    narratorName: string;
    narratorPhone: string;
  }) {
    return {
      ...row,
      workDate: row.workDate.toISOString().slice(0, 10),
      imageUrl: row.imageUrl ?? '',
    };
  }
}
