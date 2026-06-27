import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@Injectable()
export class HumansourceShiftsService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hrShift.findMany({ orderBy: { code: 'asc' } });
  }

  async create(dto: CreateShiftDto) {
    const id = await this.nextId();
    return this.prisma.hrShift.create({ data: { id, ...dto } });
  }

  async update(id: string, dto: UpdateShiftDto) {
    await this.ensureExists(id);
    return this.prisma.hrShift.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.hrShift.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.hrShift.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`Shift ${id} not found`);
  }

  private async nextId(): Promise<string> {
    const rows = await this.prisma.hrShift.findMany({ select: { id: true } });
    const nums = rows
      .map((r) => r.id.match(/^WC(\d+)$/))
      .filter(Boolean)
      .map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `WC${String(next).padStart(3, '0')}`;
  }
}
