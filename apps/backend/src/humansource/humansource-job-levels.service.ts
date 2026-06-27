import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateJobLevelDto, UpdateJobLevelDto } from './dto/job-level.dto';

@Injectable()
export class HumansourceJobLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hrJobLevel.findMany({ orderBy: { rank: 'asc' } });
  }

  async create(dto: CreateJobLevelDto) {
    const id = await this.nextId();
    return this.prisma.hrJobLevel.create({
      data: { id, nameTh: dto.nameTh, nameEn: dto.nameEn, rank: dto.rank, active: dto.active ?? true },
    });
  }

  async update(id: string, dto: UpdateJobLevelDto) {
    await this.ensureExists(id);
    return this.prisma.hrJobLevel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.hrJobLevel.delete({ where: { id } });
    return { id };
  }

  private async ensureExists(id: string) {
    const found = await this.prisma.hrJobLevel.findUnique({ where: { id } });
    if (!found) throw new NotFoundException(`Job level ${id} not found`);
  }

  private async nextId(): Promise<string> {
    const rows = await this.prisma.hrJobLevel.findMany({ select: { id: true } });
    const max = rows.reduce((acc, { id }) => {
      const n = Number(id.replace(/^JL-?0*/, '').replace(/[^0-9]/g, ''));
      return Number.isFinite(n) && n > acc ? n : acc;
    }, 0);
    return `JL${String(max + 1).padStart(3, '0')}`;
  }
}
