import { IsString, IsOptional, IsBoolean, IsNumber, MinLength } from 'class-validator';

export class CreateShiftDto {
  @IsString() @MinLength(1) code!: string;
  @IsString() @MinLength(1) name!: string;
  @IsString() type!: string;
  @IsString() time!: string;
  @IsString() companyScope!: string;
  @IsString() groupKey!: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() attendanceRule?: string;
  @IsOptional() @IsBoolean() flexibleEntryEnabled?: boolean;
  @IsOptional() @IsNumber() flexibleMinutes?: number;
  @IsOptional() @IsNumber() minimumWorkHours?: number;
  @IsOptional() @IsBoolean() trackBreak?: boolean;
  @IsOptional() @IsBoolean() shiftAllowanceEnabled?: boolean;
  @IsOptional() @IsNumber() shiftAllowanceAmount?: number;
  @IsOptional() @IsBoolean() prorateShiftAllowance?: boolean;
  @IsOptional() @IsBoolean() holidayPremiumEnabled?: boolean;
  @IsOptional() @IsBoolean() overtimePremiumEnabled?: boolean;
  @IsOptional() @IsString() updatedBy?: string;
}

export class UpdateShiftDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() type?: string;
  @IsOptional() @IsString() time?: string;
  @IsOptional() @IsString() companyScope?: string;
  @IsOptional() @IsString() groupKey?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() attendanceRule?: string;
  @IsOptional() @IsBoolean() flexibleEntryEnabled?: boolean;
  @IsOptional() @IsNumber() flexibleMinutes?: number;
  @IsOptional() @IsNumber() minimumWorkHours?: number;
  @IsOptional() @IsBoolean() trackBreak?: boolean;
  @IsOptional() @IsBoolean() shiftAllowanceEnabled?: boolean;
  @IsOptional() @IsNumber() shiftAllowanceAmount?: number;
  @IsOptional() @IsBoolean() prorateShiftAllowance?: boolean;
  @IsOptional() @IsBoolean() holidayPremiumEnabled?: boolean;
  @IsOptional() @IsBoolean() overtimePremiumEnabled?: boolean;
  @IsOptional() @IsString() updatedBy?: string;
}
