import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { HumansourceShiftsService } from './humansource-shifts.service';
import { CreateShiftDto, UpdateShiftDto } from './dto/shift.dto';

@Controller('api/humansource/shifts')
export class HumansourceShiftsController {
  constructor(private svc: HumansourceShiftsService) {}

  @Get() findAll() { return this.svc.findAll(); }
  @Post() create(@Body() dto: CreateShiftDto) { return this.svc.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateShiftDto) { return this.svc.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.svc.remove(id); }
}
