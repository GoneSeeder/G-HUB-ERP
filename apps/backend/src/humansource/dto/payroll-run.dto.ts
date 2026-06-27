import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayrollRunDto {
  @IsString()
  periodId!: string;

  @IsOptional()
  @IsString()
  status?: string;
}

export class UpdatePayrollRunStatusDto {
  @IsString()
  status!: string;
}

export class UpsertPayslipDto {
  @IsString()
  runId!: string;

  @IsString()
  employeeId!: string;

  @IsOptional()
  @IsNumber()
  gross?: number;

  @IsOptional()
  @IsNumber()
  deductions?: number;

  @IsOptional()
  @IsNumber()
  net?: number;

  @IsOptional()
  @IsArray()
  lines?: unknown[];
}
