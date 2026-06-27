import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertAttendanceDto } from './dto/attendance.dto';

@Injectable()
export class HumansourceAttendanceService {
  constructor(private readonly prisma: PrismaService) {}

  listByMonth(employeeId: string, yearMonth: string) {
    return this.prisma.hrAttendanceRecord.findMany({
      where: { employeeId, date: { startsWith: yearMonth } },
    });
  }

  listByDateRange(startDate: string, endDate: string, employeeId?: string) {
    return this.prisma.hrAttendanceRecord.findMany({
      where: {
        date: { gte: startDate, lte: endDate },
        ...(employeeId ? { employeeId } : {}),
      },
    });
  }

  upsert(dto: UpsertAttendanceDto) {
    const { employeeId, date, ...rest } = dto;
    return this.prisma.hrAttendanceRecord.upsert({
      where: { employeeId_date: { employeeId, date } },
      create: { employeeId, date, ...rest },
      update: rest,
    });
  }

  remove(employeeId: string, date: string) {
    return this.prisma.hrAttendanceRecord.deleteMany({ where: { employeeId, date } });
  }
}
