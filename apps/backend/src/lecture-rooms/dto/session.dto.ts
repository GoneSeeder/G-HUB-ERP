import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class AssignSessionDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  speakerId!: string;

  @IsString()
  @IsOptional()
  speaker2Id?: string;

  @IsString()
  @IsOptional()
  bonusCardId?: string;

  @IsString()
  @IsNotEmpty()
  partyCode!: string;

  @IsInt()
  @Min(0)
  attendeeCount!: number;
}

export class UpdateLectureHistoryDto {
  @IsString()
  @IsOptional()
  partyCode?: string;

  @IsString()
  @IsOptional()
  roomCode?: string;

  @IsString()
  @IsOptional()
  roomName?: string;

  @IsString()
  @IsOptional()
  speakerCode?: string;

  @IsString()
  @IsOptional()
  speakerName?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  attendeeCount?: number;
}

export class CloseSaleDto {
  @IsString()
  @IsNotEmpty()
  cashierCode!: string;

  @IsNumber()
  @Min(0)
  salesAmount!: number;
}
