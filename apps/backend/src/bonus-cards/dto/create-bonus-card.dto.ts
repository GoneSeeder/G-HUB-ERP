import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';

export class BonusGuideDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class BonusNarratorDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;
}

export class CreateBonusCardDto {
  @IsString()
  @MinLength(1)
  workDate!: string;

  @IsString()
  @MinLength(1)
  bonus!: string;

  @IsString()
  @MinLength(1)
  bonusName!: string;

  @IsString()
  agentCode!: string;

  @IsString()
  agentName!: string;

  @IsOptional()
  @IsString()
  companyCode?: string;

  @IsString()
  guide!: string;

  @IsString()
  guideName!: string;

  @IsOptional()
  @IsString()
  memberCode?: string;

  @IsOptional()
  @IsString()
  supervisorCode?: string;

  @IsOptional()
  @IsString()
  tourLeaderName?: string;

  @IsOptional()
  @IsString()
  tourLeaderPassport?: string;

  @IsString()
  partyCode!: string;

  @IsString()
  nation!: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsInt()
  @Min(0)
  adult!: number;

  @IsInt()
  @Min(0)
  child!: number;

  @IsInt()
  @Min(0)
  tourLeader!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  student?: number;

  @IsOptional()
  @IsString()
  carCode?: string;

  @IsOptional()
  @IsString()
  shop?: string;

  @IsOptional()
  @IsString()
  charterCode?: string;

  @IsOptional()
  @IsString()
  hotel?: string;

  @IsOptional()
  @IsString()
  comeFrom?: string;

  @IsOptional()
  @IsString()
  busType?: string;

  @IsOptional()
  @IsString()
  tourIn?: string;

  @IsOptional()
  @IsString()
  tourOut?: string;

  @IsOptional()
  @IsString()
  recorder?: string;

  @IsOptional()
  @IsString()
  recorderTime?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  nameListCode?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusGuideDto)
  extraGuides?: BonusGuideDto[];

  @IsOptional()
  @IsString()
  narratorGroup?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  narratorPax?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BonusNarratorDto)
  narrators?: BonusNarratorDto[];
}
