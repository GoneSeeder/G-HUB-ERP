import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateEmployeeDefaultsDto {
  @IsOptional() @IsString()  codePrefix?: string;
  @IsOptional() @IsInt()     codePadding?: number;
  @IsOptional() @IsString()  defaultEmployeeTypeId?: string;
  @IsOptional() @IsString()  defaultStatus?: string;
  @IsOptional() @IsString()  startDateMode?: string;
}

export class CreateRunningNumberConfigDto {
  @IsString()  id!: string;
  @IsString()  docLabelTh!: string;
  @IsString()  prefix!: string;
  @IsOptional() @IsString()  dateToken?: string;
  @IsOptional() @IsInt()     padding?: number;
  @IsOptional() @IsInt()     nextNumber?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateRunningNumberConfigDto {
  @IsOptional() @IsString()  docLabelTh?: string;
  @IsOptional() @IsString()  prefix?: string;
  @IsOptional() @IsString()  dateToken?: string;
  @IsOptional() @IsInt()     padding?: number;
  @IsOptional() @IsInt()     nextNumber?: number;
  @IsOptional() @IsBoolean() active?: boolean;
}
