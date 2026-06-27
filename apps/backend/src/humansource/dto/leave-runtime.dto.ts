import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLeaveRequestDto {
  @IsString()
  employeeId!: string;

  @IsString()
  leaveTypeId!: string;

  @IsString()
  startDate!: string;

  @IsString()
  endDate!: string;

  @IsNumber()
  unitCount!: number;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsArray()
  attachments?: unknown[];
}

export class UpdateLeaveRequestStatusDto {
  @IsString()
  status!: string;
}

export class UpsertLeaveBalanceDto {
  @IsString()
  employeeId!: string;

  @IsString()
  leaveTypeId!: string;

  @IsNumber()
  year!: number;

  @IsOptional()
  @IsNumber()
  entitled?: number;

  @IsOptional()
  @IsNumber()
  used?: number;

  @IsOptional()
  @IsNumber()
  carriedOver?: number;
}
