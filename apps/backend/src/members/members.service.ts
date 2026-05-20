import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { existsSync, mkdirSync } from 'fs';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';

const PAGE_SIZE = 50;
const GUIDE_IMAGE_DIRECTORY = join(process.cwd(), 'uploads', 'guide-image');
const GUIDE_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
mkdirSync(GUIDE_IMAGE_DIRECTORY, { recursive: true });

@Injectable()
export class MembersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: { page?: string; search?: string }) {
    const page = Math.max(Number(filters.page) || 1, 1);
    const where = this.buildWhere(filters.search);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.member.count({ where }),
      this.prisma.member.findMany({
        where,
        orderBy: [{ guideCode: 'asc' }],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
    ]);

    return {
      items: rows.map((row) => this.toResponse(row)),
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    };
  }

  async nextGuideCode() {
    return { guideCode: await this.generateNextGuideCode() };
  }

  async create(dto: CreateMemberDto) {
    const guideCode = dto.guideCode?.trim() || (await this.generateNextGuideCode());
    this.validateMember({ ...dto, guideCode });
    const row = await this.prisma.member
      .create({
        data: this.toCreateData({ ...dto, guideCode }),
      })
      .catch((error) => this.handlePrismaError(error));
    return this.toResponse(row);
  }

  async update(id: string, dto: UpdateMemberDto) {
    const existing = await this.ensureExists(id);
    this.validateMember({
      guideCode: dto.guideCode ?? existing.guideCode,
      titleTh: dto.titleTh ?? existing.titleTh,
      firstNameTh: dto.firstNameTh ?? existing.firstNameTh,
      lastNameTh: dto.lastNameTh ?? existing.lastNameTh,
      titleEn: dto.titleEn ?? existing.titleEn,
      firstNameEn: dto.firstNameEn ?? existing.firstNameEn,
      lastNameEn: dto.lastNameEn ?? existing.lastNameEn,
      fullName: dto.fullName ?? existing.fullName,
      fullNameTh: dto.fullNameTh ?? existing.fullNameTh,
      nationalId: dto.nationalId ?? existing.nationalId,
      guideType: dto.guideType ?? existing.guideType,
    });
    const row = await this.prisma.member
      .update({
        where: { id },
        data: this.toUpdateData(dto),
      })
      .catch((error) => this.handlePrismaError(error));
    return this.toResponse(row);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.member.delete({ where: { id } });
    return { message: 'Member deleted successfully' };
  }

  async saveGuideImage(guideCode: string, contentType: string, body: Buffer) {
    const normalizedGuideCode = this.normalizeGuideCode(guideCode);
    if (!normalizedGuideCode) {
      throw new BadRequestException('Guide code is required');
    }
    if (body.length === 0) {
      throw new BadRequestException('Image file is required');
    }
    if (body.length > 5 * 1024 * 1024) {
      throw new BadRequestException('File too large');
    }

    const extension = this.imageExtensionFromContentType(contentType);
    const filename = `${normalizedGuideCode}.${extension}`;
    await writeFile(join(GUIDE_IMAGE_DIRECTORY, filename), body);
    const imageUrl = `/uploads/guide-image/${filename}`;

    await this.prisma.member
      .update({
        where: { guideCode: normalizedGuideCode },
        data: { imageUrl },
      })
      .catch((error) => {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          return null;
        }
        throw error;
      });

    return { imageUrl };
  }

  private buildWhere(search?: string): Prisma.MemberWhereInput {
    const keyword = search?.trim();
    if (!keyword) {
      return {};
    }

    return {
      OR: [
        { guideCode: { contains: keyword, mode: 'insensitive' } },
        { fullName: { contains: keyword, mode: 'insensitive' } },
        { fullNameTh: { contains: keyword, mode: 'insensitive' } },
        { phone: { contains: keyword, mode: 'insensitive' } },
        { nationalId: { contains: keyword, mode: 'insensitive' } },
        { passportNo: { contains: keyword, mode: 'insensitive' } },
        { guideLicenseNo: { contains: keyword, mode: 'insensitive' } },
      ],
    };
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.member.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundException(`Member "${id}" not found`);
    }
    return row;
  }

  private async generateNextGuideCode() {
    const year = String(new Date().getFullYear()).slice(-2);
    const prefix = `GE${year}`;
    const latest = await this.prisma.member.findFirst({
      where: { guideCode: { startsWith: prefix } },
      orderBy: { guideCode: 'desc' },
      select: { guideCode: true },
    });
    const nextNumber = latest
      ? Number(latest.guideCode.slice(prefix.length)) + 1
      : 1;
    return `${prefix}${String(nextNumber).padStart(4, '0')}`;
  }

  private toCreateData(dto: CreateMemberDto): Prisma.MemberCreateInput {
    return {
      guideCode: dto.guideCode ?? '',
      titleTh: dto.titleTh ?? '',
      firstNameTh: dto.firstNameTh ?? '',
      lastNameTh: dto.lastNameTh ?? '',
      titleEn: dto.titleEn ?? '',
      firstNameEn: dto.firstNameEn ?? '',
      lastNameEn: dto.lastNameEn ?? '',
      phone: dto.phone ?? '',
      nickname: dto.nickname ?? '',
      birthDate: this.toNullableDate(dto.birthDate),
      nationalId: dto.nationalId ?? '',
      cardIssueDate: this.toNullableDate(dto.cardIssueDate),
      cardExpireDate: this.toNullableDate(dto.cardExpireDate),
      guideType: dto.guideType ?? 'Guide',
      guideLicenseNo: dto.guideLicenseNo ?? '',
      guideLicenseExpireDate: this.toNullableDate(dto.guideLicenseExpireDate),
      passportNo: dto.passportNo ?? '',
      address: dto.address ?? '',
      province: dto.province ?? '',
      note: dto.note ?? '',
      recorder: dto.recorder ?? '',
      fullName: dto.fullName ?? '',
      fullNameTh: dto.fullNameTh ?? '',
      guideCardNo: dto.guideCardNo ?? '',
      company: dto.company ?? '',
      guideHo: dto.guideHo ?? '',
      imageUrl: dto.imageUrl || null,
    };
  }

  private toUpdateData(dto: UpdateMemberDto): Prisma.MemberUpdateInput {
    return {
      ...(dto.guideCode !== undefined ? { guideCode: dto.guideCode } : {}),
      ...(dto.titleTh !== undefined ? { titleTh: dto.titleTh } : {}),
      ...(dto.firstNameTh !== undefined ? { firstNameTh: dto.firstNameTh } : {}),
      ...(dto.lastNameTh !== undefined ? { lastNameTh: dto.lastNameTh } : {}),
      ...(dto.titleEn !== undefined ? { titleEn: dto.titleEn } : {}),
      ...(dto.firstNameEn !== undefined ? { firstNameEn: dto.firstNameEn } : {}),
      ...(dto.lastNameEn !== undefined ? { lastNameEn: dto.lastNameEn } : {}),
      ...(dto.phone !== undefined ? { phone: dto.phone } : {}),
      ...(dto.nickname !== undefined ? { nickname: dto.nickname } : {}),
      ...(dto.birthDate !== undefined ? { birthDate: this.toNullableDate(dto.birthDate) } : {}),
      ...(dto.nationalId !== undefined ? { nationalId: dto.nationalId } : {}),
      ...(dto.cardIssueDate !== undefined ? { cardIssueDate: this.toNullableDate(dto.cardIssueDate) } : {}),
      ...(dto.cardExpireDate !== undefined ? { cardExpireDate: this.toNullableDate(dto.cardExpireDate) } : {}),
      ...(dto.guideType !== undefined ? { guideType: dto.guideType } : {}),
      ...(dto.guideLicenseNo !== undefined ? { guideLicenseNo: dto.guideLicenseNo } : {}),
      ...(dto.guideLicenseExpireDate !== undefined
        ? { guideLicenseExpireDate: this.toNullableDate(dto.guideLicenseExpireDate) }
        : {}),
      ...(dto.passportNo !== undefined ? { passportNo: dto.passportNo } : {}),
      ...(dto.address !== undefined ? { address: dto.address } : {}),
      ...(dto.province !== undefined ? { province: dto.province } : {}),
      ...(dto.note !== undefined ? { note: dto.note } : {}),
      ...(dto.recorder !== undefined ? { recorder: dto.recorder } : {}),
      ...(dto.fullName !== undefined ? { fullName: dto.fullName } : {}),
      ...(dto.fullNameTh !== undefined ? { fullNameTh: dto.fullNameTh } : {}),
      ...(dto.guideCardNo !== undefined ? { guideCardNo: dto.guideCardNo } : {}),
      ...(dto.company !== undefined ? { company: dto.company } : {}),
      ...(dto.guideHo !== undefined ? { guideHo: dto.guideHo } : {}),
      ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl || null } : {}),
    };
  }

  private toNullableDate(value?: string) {
    if (!value) {
      return null;
    }
    return new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  }

  private validateMember(dto: Pick<
    CreateMemberDto,
    | 'guideCode'
    | 'titleTh'
    | 'firstNameTh'
    | 'lastNameTh'
    | 'titleEn'
    | 'firstNameEn'
    | 'lastNameEn'
    | 'fullName'
    | 'fullNameTh'
    | 'nationalId'
    | 'guideType'
  >) {
    const hasThaiName = Boolean(
      dto.fullNameTh?.trim() || (dto.firstNameTh?.trim() && dto.lastNameTh?.trim()),
    );
    const hasEnglishName = Boolean(
      dto.fullName?.trim() || (dto.firstNameEn?.trim() && dto.lastNameEn?.trim()),
    );
    const nationalId = dto.nationalId?.replace(/\D/g, '') ?? '';
    const guideType = dto.guideType || 'Guide';

    if (!dto.guideCode?.trim()) {
      throw new BadRequestException('Guide code is required');
    }
    if (nationalId && nationalId.length !== 13) {
      throw new BadRequestException('National ID must be 13 digits');
    }
    if (!hasThaiName && !hasEnglishName) {
      throw new BadRequestException('Thai name or English name is required');
    }
    if (!['Guide', 'Member'].includes(guideType)) {
      throw new BadRequestException('Type must be Guide or Member');
    }
  }

  private toResponse(row: Prisma.MemberGetPayload<object>) {
    return {
      ...row,
      birthDate: row.birthDate?.toISOString().slice(0, 10) ?? '',
      cardIssueDate: row.cardIssueDate?.toISOString().slice(0, 10) ?? '',
      cardExpireDate: row.cardExpireDate?.toISOString().slice(0, 10) ?? '',
      guideLicenseExpireDate: row.guideLicenseExpireDate?.toISOString().slice(0, 10) ?? '',
      imageUrl: row.imageUrl ?? this.findGuideImageUrl(row.guideCode),
    };
  }

  private normalizeGuideCode(value: string) {
    return value.trim().replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase();
  }

  private imageExtensionFromContentType(contentType: string) {
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('webp')) return 'webp';
    return 'jpg';
  }

  private findGuideImageUrl(guideCode: string) {
    const normalizedGuideCode = this.normalizeGuideCode(guideCode);
    if (!normalizedGuideCode) return '';
    for (const extension of GUIDE_IMAGE_EXTENSIONS) {
      const filename = `${normalizedGuideCode}.${extension}`;
      if (existsSync(join(GUIDE_IMAGE_DIRECTORY, filename))) {
        return `/uploads/guide-image/${filename}`;
      }
    }
    return '';
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException('Guide code already used');
    }
    throw error;
  }
}
