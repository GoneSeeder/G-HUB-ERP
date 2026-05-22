import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min, MinLength, ValidateNested } from 'class-validator';
import { BonusGuideDto, BonusNarratorDto } from './create-bonus-card.dto';

export class UpdateBonusCardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  workDate?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  bonus?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  bonusName?: string;

  @IsOptional()
  @IsString()
  agentCode?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  companyCode?: string;

  @IsOptional()
  @IsString()
  guide?: string;

  @IsOptional()
  @IsString()
  guideName?: string;

  @IsOptional()
  @IsString()
  memberCode?: string;

  @IsOptional()
  @IsString()
  supervisorCode?: string;

  @IsOptional()
  @IsString()
  partyCode?: string;

  @IsOptional()
  @IsString()
  nation?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  adult?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  child?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  tourLeader?: number;

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
