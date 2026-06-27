import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertShiftAssignmentDto } from './dto/shift-assignment.dto';

@Injectable()
export class HumansourceShiftAssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  listByMonth(employeeId: string, yearMonth: string) {
    return this.prisma.hrShiftAssignment.findMany({
      where: { employeeId, date: { startsWith: yearMonth } },
    });
  }

  listByDateRange(startDate: string, endDate: string) {
    return this.prisma.hrShiftAssignment.findMany({
      where: { date: { gte: startDate, lte: endDate } },
    });
  }

  upsert(dto: UpsertShiftAssignmentDto) {
    return this.prisma.hrShiftAssignment.upsert({
      where: { employeeId_date: { employeeId: dto.employeeId, date: dto.date } },
      create: { ...dto },
      update: { shiftId: dto.shiftId, isOff: dto.isOff, note: dto.note },
    });
  }

  remove(employeeId: string, date: string) {
    return this.prisma.hrShiftAssignment.deleteMany({
      where: { employeeId, date },
    });
  }
}
