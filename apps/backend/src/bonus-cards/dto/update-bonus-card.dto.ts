import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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
  guide?: string;

  @IsOptional()
  @IsString()
  guideName?: string;

  @IsOptional()
  @IsString()
  partyCode?: string;

  @IsOptional()
  @IsString()
  nation?: string;

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
  @IsString()
  carCode?: string;

  @IsOptional()
  @IsString()
  shop?: string;

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
}
