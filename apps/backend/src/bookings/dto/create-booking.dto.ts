import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class BookingReferenceDto {
  @IsOptional()
  @IsString()
  orderDate?: string;

  @IsOptional()
  @IsString()
  faxNo?: string;

  @IsOptional()
  @IsString()
  agentCode?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  place?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}

export class CreateBookingDto {
  @IsString()
  @MinLength(1)
  docDate!: string;

  @IsOptional()
  @IsString()
  docTime?: string;

  @IsOptional()
  @IsString()
  docNo?: string;

  @IsOptional()
  @IsString()
  agentCode?: string;

  @IsOptional()
  @IsString()
  agentId?: string;

  @IsString()
  @MinLength(1)
  agentName!: string;

  @IsString()
  @MinLength(1)
  partyCode!: string;

  @IsOptional()
  @IsString()
  nation?: string;

  @IsOptional()
  @IsString()
  arriveDate?: string;

  @IsOptional()
  @IsString()
  departDate?: string;

  @IsOptional()
  @IsString()
  guideCode?: string;

  @IsOptional()
  @IsString()
  guideName?: string;

  @IsOptional()
  @IsString()
  telGuide?: string;

  @IsOptional()
  @IsString()
  telDriver?: string;

  @IsInt()
  @Min(0)
  pax!: number;

  @IsOptional()
  @IsString()
  carCode?: string;

  @IsOptional()
  @IsString()
  shop?: string;

  @IsOptional()
  @IsString()
  bookRemark?: string;

  @IsOptional()
  @IsString()
  dateBookJw?: string;

  @IsOptional()
  @IsString()
  timeBookJw?: string;

  @IsOptional()
  @IsString()
  ptyStartDate?: string;

  @IsOptional()
  @IsString()
  ptyEndDate?: string;

  @IsOptional()
  @IsString()
  faxNo?: string;

  @IsOptional()
  @IsString()
  agentCodeRef?: string;

  @IsOptional()
  @IsString()
  partyCodeRef?: string;

  @IsOptional()
  @IsString()
  bonusCode?: string;

  @IsBoolean()
  status!: boolean;

  @IsBoolean()
  upload!: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => BookingReferenceDto)
  references?: BookingReferenceDto[];
}
