import { Controller, Get } from '@nestjs/common';
import { HumansourceEmployeesService } from './humansource-employees.service';

// Slice 0: read-only employee list. Currently unguarded — real HR auth guard comes in
// Slice 3 (HrAccount). See HR_BACKEND_PLAN.md.
@Controller('api/humansource/employees')
export class HumansourceEmployeesController {
  constructor(private readonly employees: HumansourceEmployeesService) {}

  @Get()
  findAll() {
    return this.employees.findAll();
  }
}
