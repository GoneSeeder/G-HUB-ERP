import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class AssignSessionDto {
  @IsString()
  @IsNotEmpty()
  roomId!: string;

  @IsString()
  @IsNotEmpty()
  speakerId!: string;

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
