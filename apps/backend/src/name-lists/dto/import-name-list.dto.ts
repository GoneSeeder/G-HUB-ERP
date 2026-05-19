import { IsInt, IsObject, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ImportNameListDto {
  @IsString()
  fileBase64!: string;

  @IsString()
  fileName!: string;

  @IsString()
  partyCode!: string;

  @IsString()
  agentCode!: string;

  @IsString()
  agentName!: string;

  @IsString()
  receivedDate!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sheetIndex?: number;

  @IsOptional()
  @IsObject()
  columnOverrides?: Record<string, string>;
}
