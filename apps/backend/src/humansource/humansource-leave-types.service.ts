import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';

@Injectable()
export class HumansourceLeaveTypesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.hrLeaveType.findMany({ orderBy: { id: 'asc' } });
  }

  async create(dto: CreateLeaveTypeDto) {
    const id = await this.nextId();
    return this.prisma.hrLeaveType.create({
      data: {
        id,
        ...dto,
        rules: (dto.rules ?? {}) as never,
        eligibility: (dto.eligibility ?? {}) as never,
        quota: (dto.quota ?? {}) as never,
        approval: (dto.approval ?? {}) as never,
      },
    });
  }

  async update(id: string, dto: UpdateLeaveTypeDto) {
    await this.ensureExists(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = { ...dto };
    return this.prisma.hrLeaveType.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    return this.prisma.hrLeaveType.delete({ where: { id } });
  }

  private async ensureExists(id: string) {
    const row = await this.prisma.hrLeaveType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`LeaveType ${id} not found`);
  }

  private async nextId(): Promise<string> {
    const rows = await this.prisma.hrLeaveType.findMany({ select: { id: true } });
    const nums = rows
      .map((r) => r.id.match(/^leave-custom-(\d+)$/))
      .filter(Boolean)
      .map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `leave-custom-${next}`;
  }
}
