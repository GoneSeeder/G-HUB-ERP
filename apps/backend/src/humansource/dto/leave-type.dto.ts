import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateLeaveTypeDto {
  @IsString() @MinLength(1) code!: string;
  @IsString() @MinLength(1) nameTh!: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsBoolean() statutory?: boolean;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() rules?: Record<string, unknown>;
  @IsOptional() eligibility?: Record<string, unknown>;
  @IsOptional() quota?: Record<string, unknown>;
  @IsOptional() approval?: Record<string, unknown>;
}

export class UpdateLeaveTypeDto {
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() nameEn?: string;
  @IsOptional() @IsString() tag?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsString() unit?: string;
  @IsOptional() @IsBoolean() statutory?: boolean;
  @IsOptional() @IsBoolean() enabled?: boolean;
  @IsOptional() rules?: Record<string, unknown>;
  @IsOptional() eligibility?: Record<string, unknown>;
  @IsOptional() quota?: Record<string, unknown>;
  @IsOptional() approval?: Record<string, unknown>;
}
