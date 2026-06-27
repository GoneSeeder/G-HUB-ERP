import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLeaveRequestDto, UpdateLeaveRequestStatusDto, UpsertLeaveBalanceDto } from './dto/leave-runtime.dto';

@Injectable()
export class HumansourceLeaveRuntimeService {
  constructor(private readonly prisma: PrismaService) {}

  // --- Leave Requests ---

  listRequests(employeeId?: string, status?: string) {
    return this.prisma.hrLeaveRequest.findMany({
      where: {
        ...(employeeId ? { employeeId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  getRequest(id: string) {
    return this.prisma.hrLeaveRequest.findUnique({ where: { id } });
  }

  createRequest(dto: CreateLeaveRequestDto) {
    return this.prisma.hrLeaveRequest.create({
      data: {
        ...dto,
        attachments: (dto.attachments ?? []) as object[],
      },
    });
  }

  updateRequestStatus(id: string, dto: UpdateLeaveRequestStatusDto) {
    return this.prisma.hrLeaveRequest.update({ where: { id }, data: { status: dto.status } });
  }

  deleteRequest(id: string) {
    return this.prisma.hrLeaveRequest.delete({ where: { id } });
  }

  // --- Leave Balances ---

  listBalances(employeeId: string, year: number) {
    return this.prisma.hrLeaveBalance.findMany({ where: { employeeId, year } });
  }

  upsertBalance(dto: UpsertLeaveBalanceDto) {
    const { employeeId, leaveTypeId, year, ...rest } = dto;
    return this.prisma.hrLeaveBalance.upsert({
      where: { employeeId_leaveTypeId_year: { employeeId, leaveTypeId, year } },
      create: { employeeId, leaveTypeId, year, ...rest },
      update: rest,
    });
  }
}
