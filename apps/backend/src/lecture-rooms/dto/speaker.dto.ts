import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSpeakerDto {
  @IsString()
  @IsNotEmpty()
  speakerCode!: string;

  @IsString()
  @IsNotEmpty()
  speakerName!: string;
}

export class UpdateSpeakerDto {
  @IsString()
  @IsOptional()
  speakerName?: string;

  @IsString()
  @IsIn(['available', 'inactive'])
  @IsOptional()
  status?: string;
}
