import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdatePayrollGeneralConfigDto,
  CreatePayrollEmploymentTypeDto,
  UpdatePayrollEmploymentTypeDto,
  CreatePayItemDto,
  UpdatePayItemDto,
  CreateAccountCategoryDto,
  UpdateAccountCategoryDto,
  CreatePayPeriodConfigDto,
  UpdatePayPeriodConfigDto,
  CreateGeneratedPeriodDto,
} from './dto/payroll.dto';

@Injectable()
export class HumansourcePayrollService {
  constructor(private prisma: PrismaService) {}

  // ── General config (singleton) ──────────────────────────────────────────
  async getGeneralConfig() {
    const row = await this.prisma.hrPayrollGeneralConfig.findFirst();
    if (!row) {
      return this.prisma.hrPayrollGeneralConfig.create({ data: { id: 'default' } });
    }
    return row;
  }

  async updateGeneralConfig(dto: UpdatePayrollGeneralConfigDto) {
    const row = await this.prisma.hrPayrollGeneralConfig.findFirst();
    const id = row?.id ?? 'default';
    return this.prisma.hrPayrollGeneralConfig.upsert({
      where: { id },
      update: dto,
      create: { id, ...dto },
    });
  }

  // ── Employment types ────────────────────────────────────────────────────
  findAllEmploymentTypes() {
    return this.prisma.hrPayrollEmploymentType.findMany({ orderBy: { id: 'asc' } });
  }

  async createEmploymentType(dto: CreatePayrollEmploymentTypeDto) {
    const id = await this.nextPetId();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayrollEmploymentType.create({ data: { id, ...dto, calcConditions: (dto.calcConditions ?? []) as any } });
  }

  async updateEmploymentType(id: string, dto: UpdatePayrollEmploymentTypeDto) {
    await this.ensurePetExists(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayrollEmploymentType.update({ where: { id }, data: { ...dto, ...(dto.calcConditions !== undefined && { calcConditions: dto.calcConditions as any }) } });
  }

  async removeEmploymentType(id: string) {
    await this.ensurePetExists(id);
    return this.prisma.hrPayrollEmploymentType.delete({ where: { id } });
  }

  private async ensurePetExists(id: string) {
    const row = await this.prisma.hrPayrollEmploymentType.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`PayrollEmploymentType ${id} not found`);
  }

  private async nextPetId(): Promise<string> {
    const rows = await this.prisma.hrPayrollEmploymentType.findMany({ select: { id: true } });
    const nums = rows.map((r) => r.id.match(/^PET-(\d+)$/)).filter(Boolean).map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `PET-${next}`;
  }

  // ── Pay items ───────────────────────────────────────────────────────────
  findAllPayItems(kind?: string) {
    return this.prisma.hrPayItem.findMany({
      where: kind ? { kind } : undefined,
      orderBy: { code: 'asc' },
    });
  }

  async createPayItem(dto: CreatePayItemDto) {
    const prefix = dto.kind === 'income' ? 'I' : 'D';
    const id = await this.nextPayItemId(prefix);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayItem.create({ data: { id, ...dto, accountMapping: (dto.accountMapping ?? {}) as any } });
  }

  async updatePayItem(id: string, dto: UpdatePayItemDto) {
    const row = await this.prisma.hrPayItem.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`PayItem ${id} not found`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayItem.update({ where: { id }, data: { ...dto, ...(dto.accountMapping !== undefined && { accountMapping: dto.accountMapping as any }) } });
  }

  async removePayItem(id: string) {
    const row = await this.prisma.hrPayItem.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`PayItem ${id} not found`);
    if (row.isSystem) throw new Error(`Cannot delete system pay item ${id}`);
    return this.prisma.hrPayItem.delete({ where: { id } });
  }

  private async nextPayItemId(prefix: string): Promise<string> {
    const rows = await this.prisma.hrPayItem.findMany({ where: { kind: prefix === 'I' ? 'income' : 'deduction' }, select: { id: true } });
    const nums = rows.map((r) => r.id.match(new RegExp(`^${prefix}(\\d+)$`))).filter(Boolean).map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `${prefix}${String(next).padStart(2, '0')}`;
  }

  // ── Account categories ──────────────────────────────────────────────────
  findAllAccountCategories() {
    return this.prisma.hrAccountCategory.findMany({ orderBy: { id: 'asc' } });
  }

  async createAccountCategory(dto: CreateAccountCategoryDto) {
    const id = await this.nextCatId();
    return this.prisma.hrAccountCategory.create({ data: { id, ...dto } });
  }

  async updateAccountCategory(id: string, dto: UpdateAccountCategoryDto) {
    const row = await this.prisma.hrAccountCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`AccountCategory ${id} not found`);
    return this.prisma.hrAccountCategory.update({ where: { id }, data: dto });
  }

  async removeAccountCategory(id: string) {
    const row = await this.prisma.hrAccountCategory.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`AccountCategory ${id} not found`);
    return this.prisma.hrAccountCategory.delete({ where: { id } });
  }

  private async nextCatId(): Promise<string> {
    const rows = await this.prisma.hrAccountCategory.findMany({ select: { id: true } });
    const nums = rows.map((r) => r.id.match(/^cat-(\d+)$/)).filter(Boolean).map((m) => parseInt(m![1], 10));
    const next = nums.length ? Math.max(...nums) + 1 : 1;
    return `cat-${next}`;
  }

  // ── Pay period configs ──────────────────────────────────────────────────
  findAllPayPeriodConfigs() {
    return this.prisma.hrPayPeriodConfig.findMany({ include: { generatedPeriods: true }, orderBy: { year: 'desc' } });
  }

  async createPayPeriodConfig(dto: CreatePayPeriodConfigDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayPeriodConfig.create({ data: { ...dto, employmentTypeIds: (dto.employmentTypeIds ?? []) as any } });
  }

  async updatePayPeriodConfig(id: string, dto: UpdatePayPeriodConfigDto) {
    const row = await this.prisma.hrPayPeriodConfig.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`PayPeriodConfig ${id} not found`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.prisma.hrPayPeriodConfig.update({ where: { id }, data: { ...dto, ...(dto.employmentTypeIds !== undefined && { employmentTypeIds: dto.employmentTypeIds as any }) } });
  }

  async removePayPeriodConfig(id: string) {
    const row = await this.prisma.hrPayPeriodConfig.findUnique({ where: { id } });
    if (!row) throw new NotFoundException(`PayPeriodConfig ${id} not found`);
    return this.prisma.hrPayPeriodConfig.delete({ where: { id } });
  }

  // ── Generated periods ───────────────────────────────────────────────────
  async saveGeneratedPeriods(configId: string, periods: CreateGeneratedPeriodDto[]) {
    await this.prisma.hrGeneratedPeriod.deleteMany({ where: { configId } });
    return this.prisma.hrGeneratedPeriod.createMany({ data: periods });
  }

  findGeneratedPeriods(configId: string) {
    return this.prisma.hrGeneratedPeriod.findMany({ where: { configId }, orderBy: { index: 'asc' } });
  }
}
