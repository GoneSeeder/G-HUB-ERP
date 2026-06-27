import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { HumansourcePayrollRunService } from './humansource-payroll-run.service';
import { CreatePayrollRunDto, UpdatePayrollRunStatusDto, UpsertPayslipDto } from './dto/payroll-run.dto';

@Controller('api/humansource/payroll-runs')
export class HumansourcePayrollRunController {
  constructor(private readonly service: HumansourcePayrollRunService) {}

  @Get()
  list(@Query('periodId') periodId?: string) {
    return this.service.listRuns(periodId);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return this.service.getRun(id);
  }

  @Post()
  create(@Body() dto: CreatePayrollRunDto) {
    return this.service.createRun(dto);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdatePayrollRunStatusDto) {
    return this.service.updateRunStatus(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.deleteRun(id);
  }

  @Get(':id/payslips')
  listPayslips(@Param('id') id: string) {
    return this.service.listPayslips(id);
  }

  @Post('payslips')
  upsertPayslip(@Body() dto: UpsertPayslipDto) {
    return this.service.upsertPayslip(dto);
  }
}
