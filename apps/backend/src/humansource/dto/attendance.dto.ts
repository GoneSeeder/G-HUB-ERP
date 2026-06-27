import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpsertAttendanceDto {
  @IsString()
  employeeId!: string;

  @IsString()
  date!: string;

  @IsOptional()
  @IsString()
  clockIn?: string;

  @IsOptional()
  @IsString()
  clockOut?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsString()
  note?: string;
}
