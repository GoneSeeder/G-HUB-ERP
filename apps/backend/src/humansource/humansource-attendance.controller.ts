import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { HumansourceAttendanceService } from './humansource-attendance.service';
import { UpsertAttendanceDto } from './dto/attendance.dto';

@Controller('api/humansource/attendance')
export class HumansourceAttendanceController {
  constructor(private readonly service: HumansourceAttendanceService) {}

  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('yearMonth') yearMonth?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (employeeId && yearMonth) return this.service.listByMonth(employeeId, yearMonth);
    if (startDate && endDate) return this.service.listByDateRange(startDate, endDate, employeeId);
    return [];
  }

  @Post()
  upsert(@Body() dto: UpsertAttendanceDto) {
    return this.service.upsert(dto);
  }

  @Delete(':employeeId/:date')
  remove(@Param('employeeId') employeeId: string, @Param('date') date: string) {
    return this.service.remove(employeeId, date);
  }
}
