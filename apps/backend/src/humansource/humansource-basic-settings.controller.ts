import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { HumansourceBasicSettingsService } from './humansource-basic-settings.service';
import { UpdateEmployeeDefaultsDto, CreateRunningNumberConfigDto, UpdateRunningNumberConfigDto } from './dto/basic-settings.dto';

@Controller('api/humansource/basic-settings')
export class HumansourceBasicSettingsController {
  constructor(private svc: HumansourceBasicSettingsService) {}

  @Get('employee-defaults')  getDefaults()  { return this.svc.getEmployeeDefaults(); }
  @Patch('employee-defaults') updateDefaults(@Body() dto: UpdateEmployeeDefaultsDto) { return this.svc.updateEmployeeDefaults(dto); }

  @Get('running-numbers')    findAll()      { return this.svc.findAllRunningNumbers(); }
  @Post('running-numbers')   create(@Body() dto: CreateRunningNumberConfigDto) { return this.svc.createRunningNumber(dto); }
  @Patch('running-numbers/:id') update(@Param('id') id: string, @Body() dto: UpdateRunningNumberConfigDto) { return this.svc.updateRunningNumber(id, dto); }
  @Delete('running-numbers/:id') remove(@Param('id') id: string) { return this.svc.removeRunningNumber(id); }
}
