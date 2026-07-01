import { IsBoolean, IsInt, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

// Minimal DTO covering the fields humansource-employees.service.ts already reads.
// Deliberately permissive (almost everything optional) — this unblocks compilation for the
// Slice-0 denormalized hr_employee table. The full 40-field employee-wizard schema design is
// explicitly deferred per HR_BACKEND_PLAN.md §4 Slice 1, not attempted here.

export class CreateEmployeeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  // Display-label overrides (service falls back to resolving these from *Id refs when absent)
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  empType?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsString()
  @MinLength(1)
  companyId!: string;

  @IsString()
  @MinLength(1)
  branchNodeId!: string;

  @IsString()
  @MinLength(1)
  departmentNodeId!: string;

  @IsString()
  @MinLength(1)
  positionId!: string;

  @IsString()
  @MinLength(1)
  employeeTypeId!: string;

  @IsOptional()
  @IsString()
  payrollEmploymentTypeId?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsInt()
  salary?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  firstNameEn?: string;

  @IsOptional()
  @IsString()
  lastNameEn?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsObject()
  personalInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  addressInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  payrollInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  socialSecurityInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  taxInfo?: Record<string, unknown>;

  @IsOptional()
  documents?: unknown[];

  @IsOptional()
  workHistory?: unknown[];

  @IsOptional()
  educationHistory?: unknown[];

  @IsOptional()
  familyInfo?: unknown[];
}

export class UpdateEmployeeDto {
  @IsOptional()
  @IsString()
  employeeCode?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  empType?: string;

  @IsOptional()
  @IsString()
  schedule?: string;

  @IsOptional()
  @IsString()
  companyId?: string;

  @IsOptional()
  @IsString()
  branchNodeId?: string;

  @IsOptional()
  @IsString()
  departmentNodeId?: string;

  @IsOptional()
  @IsString()
  positionId?: string;

  @IsOptional()
  @IsString()
  employeeTypeId?: string;

  @IsOptional()
  @IsString()
  payrollEmploymentTypeId?: string;

  @IsOptional()
  @IsString()
  supervisorId?: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  personalEmail?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  mobile?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsInt()
  salary?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  firstNameEn?: string;

  @IsOptional()
  @IsString()
  lastNameEn?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @IsString()
  idNumber?: string;

  @IsOptional()
  @IsObject()
  personalInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  addressInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  payrollInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  socialSecurityInfo?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  taxInfo?: Record<string, unknown>;

  @IsOptional()
  documents?: unknown[];

  @IsOptional()
  workHistory?: unknown[];

  @IsOptional()
  educationHistory?: unknown[];

  @IsOptional()
  familyInfo?: unknown[];
}
