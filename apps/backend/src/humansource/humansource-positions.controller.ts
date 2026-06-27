import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreatePositionDto, UpdatePositionDto } from './dto/position.dto';
import { HumansourcePositionsService } from './humansource-positions.service';

@Controller('api/humansource/positions')
export class HumansourcePositionsController {
  constructor(private readonly service: HumansourcePositionsService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreatePositionDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePositionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
