import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class AgentAliasDto {
  @IsString()
  @MinLength(1)
  pattern!: string;

  @IsOptional()
  @IsString()
  @IsIn(['contains'])
  matchType?: string;
}

export class CreateAgentDto {
  @IsString()
  @MinLength(1)
  agentCode!: string;

  @IsOptional()
  @IsString()
  codeCenter?: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  nation?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsString()
  contactPerson?: string;

  @IsOptional()
  @IsString()
  marketing?: string;

  @IsOptional()
  @IsString()
  agentHO?: string;

  @IsOptional()
  @IsString()
  typeCenter?: string;

  @IsOptional()
  @IsString()
  agentType?: string;

  @IsOptional()
  @IsString()
  typeGroup?: string;

  @IsOptional()
  @IsString()
  navCode?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsString()
  branch?: string;

  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  bankBranch?: string;

  @IsOptional()
  @IsString()
  bankAccount?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgentAliasDto)
  aliases?: AgentAliasDto[];
}
