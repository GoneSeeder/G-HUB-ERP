import {
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NameListItemDto } from './name-list-item.dto';

export class CreateNameListDto {
  @IsString()
  @MinLength(1)
  code!: string;

  @IsOptional()
  @IsString()
  partyCode?: string;

  @IsOptional()
  @IsString()
  arriveDate?: string;

  @IsOptional()
  @IsString()
  departDate?: string;

  @IsOptional()
  @IsString()
  agentCode?: string;

  @IsOptional()
  @IsString()
  agentName?: string;

  @IsOptional()
  @IsString()
  guideCode?: string;

  @IsOptional()
  @IsString()
  guideName?: string;

  @IsOptional()
  @IsString()
  nationCode?: string;

  @IsOptional()
  @IsString()
  nationName?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  busCode?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  pax?: number;

  @IsOptional()
  @IsString()
  sourceFile?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NameListItemDto)
  items?: NameListItemDto[];
}
