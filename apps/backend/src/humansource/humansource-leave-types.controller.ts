import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { HumansourceLeaveTypesService } from './humansource-leave-types.service';
import { CreateLeaveTypeDto, UpdateLeaveTypeDto } from './dto/leave-type.dto';

@Controller('api/humansource/leave-types')
export class HumansourceLeaveTypesController {
  constructor(private svc: HumansourceLeaveTypesService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Post() create(@Body() dto: CreateLeaveTypeDto) { return this.svc.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateLeaveTypeDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
