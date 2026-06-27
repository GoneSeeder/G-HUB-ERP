import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Shape returned to the frontend — matches data/humansource/mock.ts `Employee` exactly
// (the frozen contract). DB-only columns (createdAt/updatedAt) are stripped.
export type EmployeeDto = {
  id: string;
  code: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  branch: string;
  empType: string;
  schedule: string;
  startDate: string;
  salary: number;
  status: string;
  active: boolean;
  companyId: string;
  branchNodeId: string;
  departmentNodeId: string;
  positionId: string;
  employeeTypeId: string;
};

@Injectable()
export class HumansourceEmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<EmployeeDto[]> {
    const rows = await this.prisma.hrEmployee.findMany({ orderBy: { code: 'asc' } });
    return rows.map(({ createdAt: _c, updatedAt: _u, ...e }) => e);
  }
}
