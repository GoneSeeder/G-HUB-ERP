import { IsBoolean, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateJobLevelDto {
  @IsString()
  @MinLength(1)
  nameTh!: string;

  @IsString()
  nameEn!: string;

  @IsInt()
  @Min(1)
  rank!: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateJobLevelDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nameTh?: string;

  @IsOptional()
  @IsString()
  nameEn?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  rank?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
