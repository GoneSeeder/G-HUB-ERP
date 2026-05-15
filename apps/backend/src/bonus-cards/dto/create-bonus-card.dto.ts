import { IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

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

  @IsString()
  guide!: string;

  @IsString()
  guideName!: string;

  @IsString()
  partyCode!: string;

  @IsString()
  nation!: string;

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
