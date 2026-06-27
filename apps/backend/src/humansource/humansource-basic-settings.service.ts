import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateEmployeeDefaultsDto, CreateRunningNumberConfigDto, UpdateRunningNumberConfigDto } from './dto/basic-settings.dto';

const DEFAULTS_SINGLETON_ID = 'singleton';

@Injectable()
export class HumansourceBasicSettingsService {
  constructor(private prisma: PrismaService) {}

  // ── Employee defaults (singleton) ─────────────────────────────────────────
  getEmployeeDefaults() {
    return this.prisma.hrEmployeeDefaults.upsert({
      where: { id: DEFAULTS_SINGLETON_ID },
      create: { id: DEFAULTS_SINGLETON_ID },
      update: {},
    });
  }

  updateEmployeeDefaults(dto: UpdateEmployeeDefaultsDto) {
    return this.prisma.hrEmployeeDefaults.upsert({
      where: { id: DEFAULTS_SINGLETON_ID },
      create: { id: DEFAULTS_SINGLETON_ID, ...dto },
      update: dto,
    });
  }

  // ── Running number configs ─────────────────────────────────────────────────
  findAllRunningNumbers() {
    return this.prisma.hrRunningNumberConfig.findMany({ orderBy: { id: 'asc' } });
  }

  createRunningNumber(dto: CreateRunningNumberConfigDto) {
    return this.prisma.hrRunningNumberConfig.create({ data: dto });
  }

  async updateRunningNumber(id: string, dto: UpdateRunningNumberConfigDto) {
    const row = await this.prisma.hrRunningNumberConfig.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`RunningNumberConfig ${id} not found`);
    return this.prisma.hrRunningNumberConfig.update({ where: { id }, data: dto });
  }

  async removeRunningNumber(id: string) {
    const row = await this.prisma.hrRunningNumberConfig.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`RunningNumberConfig ${id} not found`);
    return this.prisma.hrRunningNumberConfig.delete({ where: { id } });
  }
}
