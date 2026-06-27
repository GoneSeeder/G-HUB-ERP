import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CreateEmployeeTypeDto, UpdateEmployeeTypeDto } from './dto/employee-type.dto';
import { HumansourceEmployeeTypesService } from './humansource-employee-types.service';

// Slice 1 (first master-data CRUD). Unguarded for now — real HR auth = Slice 3.
@Controller('api/humansource/employee-types')
export class HumansourceEmployeeTypesController {
  constructor(private readonly service: HumansourceEmployeeTypesService) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateEmployeeTypeDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeTypeDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
