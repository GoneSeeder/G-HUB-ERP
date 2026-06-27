import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateApprovalConfigDto, UpsertPersonApproverDto } from './dto/approval.dto';

@Injectable()
export class HumansourceApprovalService {
  constructor(private prisma: PrismaService) {}

  findAllConfigs() {
    return this.prisma.hrDocumentApprovalConfig.findMany({ orderBy: { docType: 'asc' } });
  }

  async updateConfig(docType: string, dto: UpdateApprovalConfigDto) {
    const row = await this.prisma.hrDocumentApprovalConfig.findUnique({ where: { docType } });
    if (!row) throw new NotFoundException(`DocType ${docType} not found`);
    return this.prisma.hrDocumentApprovalConfig.update({ where: { docType }, data: dto });
  }

  findAllPersonApprovers() {
    return this.prisma.hrPersonApprover.findMany();
  }

  async upsertPersonApprover(dto: UpsertPersonApproverDto) {
    return this.prisma.hrPersonApprover.upsert({
      where: { employeeId: dto.employeeId },
      update: { approverId: dto.approverId ?? null },
      create: { employeeId: dto.employeeId, approverId: dto.approverId ?? null },
    });
  }

  async removePersonApprover(employeeId: string) {
    const row = await this.prisma.hrPersonApprover.findUnique({ where: { employeeId } });
    if (!row) throw new NotFoundException(`PersonApprover ${employeeId} not found`);
    return this.prisma.hrPersonApprover.delete({ where: { employeeId } });
  }
}
