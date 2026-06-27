import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEmployeeTypeDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  nameTh!: string;

  @IsString()
  nameEn!: string;

  @IsIn(['หัก ณ ที่จ่าย', 'ไม่หัก'])
  tax!: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateEmployeeTypeDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  code?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  nameTh?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsIn(['หัก ณ ที่จ่าย', 'ไม่หัก'])
  tax?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
