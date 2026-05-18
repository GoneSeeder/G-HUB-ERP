import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class NameListItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  itemNo?: number;

  @IsOptional()
  @IsBoolean()
  isLeader?: boolean;

  @IsOptional()
  @IsString()
  agentCode?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  arriveDate?: string;

  @IsOptional()
  @IsString()
  passportNo?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  age?: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  nationCode?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
