import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePayrollRunDto, UpdatePayrollRunStatusDto, UpsertPayslipDto } from './dto/payroll-run.dto';

@Injectable()
export class HumansourcePayrollRunService {
  constructor(private readonly prisma: PrismaService) {}

  listRuns(periodId?: string) {
    return this.prisma.hrPayrollRun.findMany({
      where: periodId ? { periodId } : {},
      include: { payslips: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getRun(id: string) {
    return this.prisma.hrPayrollRun.findUnique({ where: { id }, include: { payslips: true } });
  }

  createRun(dto: CreatePayrollRunDto) {
    return this.prisma.hrPayrollRun.create({ data: dto });
  }

  updateRunStatus(id: string, dto: UpdatePayrollRunStatusDto) {
    return this.prisma.hrPayrollRun.update({ where: { id }, data: { status: dto.status } });
  }

  deleteRun(id: string) {
    return this.prisma.hrPayrollRun.delete({ where: { id } });
  }

  upsertPayslip(dto: UpsertPayslipDto) {
    const { runId, employeeId, lines, ...rest } = dto;
    const safeLines = (lines ?? []) as object[];
    return this.prisma.hrPayslip.upsert({
      where: { runId_employeeId: { runId, employeeId } },
      create: { runId, employeeId, lines: safeLines, ...rest },
      update: { lines: safeLines, ...rest },
    });
  }

  listPayslips(runId: string) {
    return this.prisma.hrPayslip.findMany({ where: { runId } });
  }
}
