import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateReferenceItemDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  secondaryName?: string;

  @IsOptional()
  @IsString()
  nationCode?: string;
}

export class UpdateReferenceItemDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  secondaryName?: string;

  @IsOptional()
  @IsString()
  nationCode?: string;
}
