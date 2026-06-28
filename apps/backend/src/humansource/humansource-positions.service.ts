import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';

@Injectable()
export class HumansourcePositionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hrPosition.findMany({ orderBy: { id: 'asc' } });
  }

  async create(dto: CreatePositionDto) {
    const id = await this.nextId();
    return this.prisma.hrPosition.create({
      data: {
        id,
        code: dto.code,
        nameTh: dto.nameTh,
        nameEn: dto.nameEn,
        level: '',
        jobLevelId: dto.jobLevelId,
        companyId: dto.companyId ?? '',
        employeeTypes: dto.employeeTypes ?? [],
        employmentTypeIds: dto.employmentTypeIds ?? [],
        salaryMin: dto.salaryMin ?? 0,
        salaryMax: dto.salaryMax ?? 0,
        overview: dto.overview ?? '',
        responsibilities: dto.responsibilities ?? '',
        qualifications: dto.qualifications ?? '',
        hasBenefits: dto.hasBenefits ?? false,
        active: dto.active ?? true,
      },
    });
  }

  async update(id: string, dto: UpdatePositionDto) {
    await this.ensureExists(id);
    const { employeeTypes, employmentTypeIds, ...rest } = dto;
    return this.prisma.hrPosition.update({
      where: { id },
      data: {
        ...rest,
        ...(employeeTypes !== undefined && { employeeTypes }),
        ...(employmentTypeIds !== undefined && { employmentTypeIds }),
      },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    const activeEmployees = await this.prisma.hrEmployee.count({ where: { positionId: id, active: true } });
    if (activeEmployees > 0) {
      throw new BadRequestException('Cannot delete a position with active employees');
    }
    await this.prisma.hrPosition.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.hrPosition.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Position ${id} not found`);
  }

  private async nextId(): Promise<string> {
    const rows = await this.prisma.hrPosition.findMany({ select: { id: true } });
    const max = rows.reduce((acc, { id }) => {
      const n = Number(id.replace(/^P0*/, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `P${String(max + 1).padStart(3, '0')}`;
  }
}
