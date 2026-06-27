import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpsertShiftAssignmentDto {
  @IsString()
  employeeId!: string;

  @IsString()
  date!: string;

  @IsOptional()
  @IsString()
  shiftId?: string;

  @IsOptional()
  @IsBoolean()
  isOff?: boolean;

  @IsOptional()
  @IsString()
  note?: string;
}
