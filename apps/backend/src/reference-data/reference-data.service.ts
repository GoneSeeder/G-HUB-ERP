import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AuthUser } from '../auth/interfaces/auth-user.interface';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReferenceItemDto, UpdateReferenceItemDto } from './dto/reference-item.dto';

export type ReferenceType = 'nation' | 'province' | 'busType' | 'charterCode';

const referenceTypes: ReferenceType[] = ['nation', 'province', 'busType', 'charterCode'];

@Injectable()
export class ReferenceDataService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(type: string, filters: { search?: string; nationCode?: string }) {
    const referenceType = this.normalizeType(type);
    const search = filters.search?.trim();
    const nationCode = referenceType === 'province' ? this.normalizeCode(filters.nationCode ?? '') : undefined;

    const where: Prisma.ReferenceItemWhereInput = {
      type: referenceType,
      ...(referenceType === 'province' && nationCode ? { nationCode } : {}),
      ...(search
        ? {
            OR: [
              { code: { contains: search, mode: 'insensitive' } },
              { name: { contains: search, mode: 'insensitive' } },
              { secondaryName: { contains: search, mode: 'insensitive' } },
              { nationCode: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return this.prisma.referenceItem.findMany({
      where,
      orderBy: [{ code: 'asc' }, { name: 'asc' }],
    });
  }

  async create(type: string, dto: CreateReferenceItemDto, user: AuthUser) {
    const referenceType = this.normalizeType(type);
    this.ensureCanManage(referenceType, user);
    const data = this.normalizePayload(referenceType, dto);
    await this.ensureUnique(referenceType, data.code, data.nationCode);
    return this.prisma.referenceItem.create({
      data: {
        type: referenceType,
        code: data.code,
        name: data.name,
        secondaryName: data.secondaryName,
        nationCode: data.nationCode,
      },
    });
  }

  async update(type: string, id: string, dto: UpdateReferenceItemDto, user: AuthUser) {
    const referenceType = this.normalizeType(type);
    this.ensureCanManage(referenceType, user);
    const existing = await this.findOne(referenceType, id);
    const data = this.normalizePayload(referenceType, dto);
    if (existing.code !== data.code || existing.nationCode !== data.nationCode) {
      await this.ensureUnique(referenceType, data.code, data.nationCode, id);
    }
    return this.prisma.referenceItem.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        secondaryName: data.secondaryName,
        nationCode: data.nationCode,
      },
    });
  }

  async remove(type: string, id: string, user: AuthUser) {
    const referenceType = this.normalizeType(type);
    this.ensureCanManage(referenceType, user);
    await this.findOne(referenceType, id);
    await this.prisma.referenceItem.delete({ where: { id } });
    return { success: true };
  }

  private normalizeType(type: string): ReferenceType {
    if (!referenceTypes.includes(type as ReferenceType)) {
      throw new BadRequestException('Invalid reference type');
    }
    return type as ReferenceType;
  }

  private normalizePayload(type: ReferenceType, dto: CreateReferenceItemDto | UpdateReferenceItemDto) {
    const code = this.normalizeCode(dto.code);
    const name = dto.name.trim();
    const nationCode = type === 'province' ? this.normalizeCode(dto.nationCode ?? '') : '';
    if (!code) {
      throw new BadRequestException('Code is required');
    }
    if (!name) {
      throw new BadRequestException('Name is required');
    }
    const secondaryName = dto.secondaryName?.trim() ?? '';
    return { code, name, secondaryName, nationCode };
  }

  private normalizeCode(value: string) {
    return value.trim().toUpperCase();
  }

  private async findOne(type: ReferenceType, id: string) {
    const item = await this.prisma.referenceItem.findFirst({ where: { id, type } });
    if (!item) {
      throw new NotFoundException('Reference item not found');
    }
    return item;
  }

  private async ensureUnique(type: ReferenceType, code: string, nationCode: string, excludeId?: string) {
    const duplicate = await this.prisma.referenceItem.findFirst({
      where: {
        type,
        code,
        nationCode,
        ...(excludeId ? { id: { not: excludeId } } : {}),
      },
    });
    if (duplicate) {
      throw new ConflictException('Reference code already exists');
    }
  }

  private ensureCanManage(type: ReferenceType, user: AuthUser) {
    if (type === 'charterCode') {
      return;
    }
    if (!user.roles.includes('admin')) {
      throw new ForbiddenException('Admin permission is required');
    }
  }
}
