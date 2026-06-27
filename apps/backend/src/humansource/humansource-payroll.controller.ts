import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { HumansourcePayrollService } from './humansource-payroll.service';
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

@Controller('api/humansource/payroll')
export class HumansourcePayrollController {
  constructor(private svc: HumansourcePayrollService) {}

  // ── General config ──────────────────────────────────────────────────────
  @Get('general-config') getGeneralConfig() { return this.svc.getGeneralConfig(); }
  @Patch('general-config') updateGeneralConfig(@Body() dto: UpdatePayrollGeneralConfigDto) { return this.svc.updateGeneralConfig(dto); }

  // ── Employment types ────────────────────────────────────────────────────
  @Get('employment-types') findAllEmploymentTypes() { return this.svc.findAllEmploymentTypes(); }
  @Post('employment-types') createEmploymentType(@Body() dto: CreatePayrollEmploymentTypeDto) { return this.svc.createEmploymentType(dto); }
  @Patch('employment-types/:id') updateEmploymentType(@Param('id') id: string, @Body() dto: UpdatePayrollEmploymentTypeDto) { return this.svc.updateEmploymentType(id, dto); }
  @Delete('employment-types/:id') removeEmploymentType(@Param('id') id: string) { return this.svc.removeEmploymentType(id); }

  // ── Pay items ───────────────────────────────────────────────────────────
  @Get('pay-items') findAllPayItems(@Query('kind') kind?: string) { return this.svc.findAllPayItems(kind); }
  @Post('pay-items') createPayItem(@Body() dto: CreatePayItemDto) { return this.svc.createPayItem(dto); }
  @Patch('pay-items/:id') updatePayItem(@Param('id') id: string, @Body() dto: UpdatePayItemDto) { return this.svc.updatePayItem(id, dto); }
  @Delete('pay-items/:id') removePayItem(@Param('id') id: string) { return this.svc.removePayItem(id); }

  // ── Account categories ──────────────────────────────────────────────────
  @Get('account-categories') findAllAccountCategories() { return this.svc.findAllAccountCategories(); }
  @Post('account-categories') createAccountCategory(@Body() dto: CreateAccountCategoryDto) { return this.svc.createAccountCategory(dto); }
  @Patch('account-categories/:id') updateAccountCategory(@Param('id') id: string, @Body() dto: UpdateAccountCategoryDto) { return this.svc.updateAccountCategory(id, dto); }
  @Delete('account-categories/:id') removeAccountCategory(@Param('id') id: string) { return this.svc.removeAccountCategory(id); }

  // ── Pay period configs ──────────────────────────────────────────────────
  @Get('pay-period-configs') findAllPayPeriodConfigs() { return this.svc.findAllPayPeriodConfigs(); }
  @Post('pay-period-configs') createPayPeriodConfig(@Body() dto: CreatePayPeriodConfigDto) { return this.svc.createPayPeriodConfig(dto); }
  @Patch('pay-period-configs/:id') updatePayPeriodConfig(@Param('id') id: string, @Body() dto: UpdatePayPeriodConfigDto) { return this.svc.updatePayPeriodConfig(id, dto); }
  @Delete('pay-period-configs/:id') removePayPeriodConfig(@Param('id') id: string) { return this.svc.removePayPeriodConfig(id); }

  // ── Generated periods ───────────────────────────────────────────────────
  @Get('pay-period-configs/:configId/periods') findGeneratedPeriods(@Param('configId') configId: string) { return this.svc.findGeneratedPeriods(configId); }
  @Post('pay-period-configs/:configId/periods') saveGeneratedPeriods(@Param('configId') configId: string, @Body() periods: CreateGeneratedPeriodDto[]) { return this.svc.saveGeneratedPeriods(configId, periods); }
}
