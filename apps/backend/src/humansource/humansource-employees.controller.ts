import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { HumansourceEmployeesService } from './humansource-employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto';

// Slice 0: employee list + create/update. Currently unguarded — real HR auth guard comes in
// Slice 3 (HrAccount). See HR_BACKEND_PLAN.md.
@Controller('api/humansource/employees')
export class HumansourceEmployeesController {
  constructor(private readonly employees: HumansourceEmployeesService) {}

  @Get()
  findAll() {
    return this.employees.findAll();
  }

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employees.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employees.update(id, dto);
  }
}
