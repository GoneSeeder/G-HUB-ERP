import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { HumansourceShiftAssignmentService } from './humansource-shift-assignment.service';
import { UpsertShiftAssignmentDto } from './dto/shift-assignment.dto';

@Controller('api/humansource/shift-assignments')
export class HumansourceShiftAssignmentController {
  constructor(private readonly service: HumansourceShiftAssignmentService) {}

  // GET /api/humansource/shift-assignments?employeeId=X&yearMonth=YYYY-MM
  // GET /api/humansource/shift-assignments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
  @Get()
  list(
    @Query('employeeId') employeeId?: string,
    @Query('yearMonth') yearMonth?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (employeeId && yearMonth) return this.service.listByMonth(employeeId, yearMonth);
    if (startDate && endDate) return this.service.listByDateRange(startDate, endDate);
    return [];
  }

  @Post()
  upsert(@Body() dto: UpsertShiftAssignmentDto) {
    return this.service.upsert(dto);
  }

  @Delete(':employeeId/:date')
  remove(@Param('employeeId') employeeId: string, @Param('date') date: string) {
    return this.service.remove(employeeId, date);
  }
}
