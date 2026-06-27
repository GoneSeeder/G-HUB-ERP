import { IsString, IsOptional, IsBoolean, IsNumber, IsInt, IsArray, MinLength } from 'class-validator';

// ── Payroll General Config ──────────────────────────────────────────────────
export class UpdatePayrollGeneralConfigDto {
  @IsOptional() @IsString() cycleStartDay?: string;
  @IsOptional() @IsString() cycleEndDay?: string;
  @IsOptional() @IsNumber() ssoEmployeeRate?: number;
  @IsOptional() @IsNumber() ssoEmployerRate?: number;
  @IsOptional() @IsNumber() ssoMonthlyWageFloor?: number;
  @IsOptional() @IsNumber() ssoMonthlyWageCap?: number;
  @IsOptional() @IsBoolean() ssoIncludeOT?: boolean;
  @IsOptional() @IsBoolean() ssoIncludeBonus?: boolean;
  @IsOptional() @IsBoolean() ssoIncludeWelfare?: boolean;
  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsString() moneyRounding?: string;
  @IsOptional() @IsBoolean() preventWrongOtType?: boolean;
}

// ── Payroll Employment Type ─────────────────────────────────────────────────
export class CreatePayrollEmploymentTypeDto {
  @IsString() @MinLength(1) code!: string;
  @IsString() @MinLength(1) nameTh!: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsString() payType!: string;
  @IsOptional() @IsBoolean() paidPublicHoliday?: boolean;
  @IsOptional() @IsBoolean() paidHourly?: boolean;
  @IsOptional() calcConditions?: unknown[];
  @IsOptional() @IsString() employeeTypeId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdatePayrollEmploymentTypeDto {
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() payType?: string;
  @IsOptional() @IsBoolean() paidPublicHoliday?: boolean;
  @IsOptional() @IsBoolean() paidHourly?: boolean;
  @IsOptional() calcConditions?: unknown[];
  @IsOptional() @IsString() employeeTypeId?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

// ── Pay Item ────────────────────────────────────────────────────────────────
export class CreatePayItemDto {
  @IsString() @MinLength(1) kind!: string;
  @IsString() @MinLength(1) code!: string;
  @IsString() @MinLength(1) nameTh!: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() revenueCategory?: string;
  @IsOptional() @IsString() rounding?: string;
  @IsOptional() @IsString() taxCalcMethod?: string;
  @IsOptional() @IsString() payoutScope?: string;
  @IsOptional() @IsBoolean() taxable?: boolean;
  @IsOptional() @IsBoolean() linkSSO?: boolean;
  @IsOptional() @IsBoolean() linkProvidentFund?: boolean;
  @IsOptional() @IsBoolean() offCycle?: boolean;
  @IsOptional() @IsBoolean() carryPrevPeriod?: boolean;
  @IsOptional() @IsBoolean() payOnce?: boolean;
  @IsOptional() @IsBoolean() calcByActualWorkdays?: boolean;
  @IsOptional() @IsBoolean() linkOvertime?: boolean;
  @IsOptional() @IsBoolean() linkLateAbsent?: boolean;
  @IsOptional() @IsBoolean() isWelfare?: boolean;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() accountMapping?: Record<string, string>;
}

export class UpdatePayItemDto {
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() revenueCategory?: string;
  @IsOptional() @IsString() rounding?: string;
  @IsOptional() @IsString() taxCalcMethod?: string;
  @IsOptional() @IsString() payoutScope?: string;
  @IsOptional() @IsBoolean() taxable?: boolean;
  @IsOptional() @IsBoolean() linkSSO?: boolean;
  @IsOptional() @IsBoolean() linkProvidentFund?: boolean;
  @IsOptional() @IsBoolean() offCycle?: boolean;
  @IsOptional() @IsBoolean() carryPrevPeriod?: boolean;
  @IsOptional() @IsBoolean() payOnce?: boolean;
  @IsOptional() @IsBoolean() calcByActualWorkdays?: boolean;
  @IsOptional() @IsBoolean() linkOvertime?: boolean;
  @IsOptional() @IsBoolean() linkLateAbsent?: boolean;
  @IsOptional() @IsBoolean() isWelfare?: boolean;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() accountMapping?: Record<string, string>;
}

// ── Account Category ────────────────────────────────────────────────────────
export class CreateAccountCategoryDto {
  @IsString() @MinLength(1) nameTh!: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

export class UpdateAccountCategoryDto {
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsBoolean() enabled?: boolean;
}

// ── Pay Period Config ───────────────────────────────────────────────────────
export class CreatePayPeriodConfigDto {
  @IsInt() year!: number;
  @IsOptional() @IsString() frequency?: string;
  @IsString() firstPeriodStart!: string;
  @IsOptional() @IsString() payDayOfMonth?: string;
  @IsOptional() @IsBoolean() payNextMonth?: boolean;
  @IsOptional() @IsBoolean() payBeforeIfHoliday?: boolean;
  @IsOptional() @IsBoolean() hasOffCycle?: boolean;
  @IsOptional() @IsString() offCycleStart?: string;
  @IsOptional() @IsArray() employmentTypeIds?: string[];
}

export class UpdatePayPeriodConfigDto {
  @IsOptional() @IsString() payDayOfMonth?: string;
  @IsOptional() @IsBoolean() payNextMonth?: boolean;
  @IsOptional() @IsBoolean() payBeforeIfHoliday?: boolean;
  @IsOptional() @IsBoolean() hasOffCycle?: boolean;
  @IsOptional() @IsString() offCycleStart?: string;
  @IsOptional() @IsArray() employmentTypeIds?: string[];
}

// ── Generated Period ────────────────────────────────────────────────────────
export class CreateGeneratedPeriodDto {
  @IsString() id!: string;
  @IsString() configId!: string;
  @IsInt() index!: number;
  @IsString() label!: string;
  @IsString() periodStart!: string;
  @IsString() periodEnd!: string;
  @IsString() payDate!: string;
}
