import { IsOptional, IsString } from 'class-validator';

export class CreateMemberDto {
  @IsOptional()
  @IsString()
  guideCode?: string;

  @IsOptional()
  @IsString()
  titleTh?: string;

  @IsOptional()
  @IsString()
  firstNameTh?: string;

  @IsOptional()
  @IsString()
  lastNameTh?: string;

  @IsOptional()
  @IsString()
  titleEn?: string;

  @IsOptional()
  @IsString()
  firstNameEn?: string;

  @IsOptional()
  @IsString()
  lastNameEn?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  nickname?: string;

  @IsOptional()
  @IsString()
  birthDate?: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  cardIssueDate?: string;

  @IsOptional()
  @IsString()
  cardExpireDate?: string;

  @IsOptional()
  @IsString()
  guideType?: string;

  @IsOptional()
  @IsString()
  guideLicenseNo?: string;

  @IsOptional()
  @IsString()
  guideLicenseExpireDate?: string;

  @IsOptional()
  @IsString()
  passportNo?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsString()
  recorder?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  fullNameTh?: string;

  @IsOptional()
  @IsString()
  guideCardNo?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  guideHo?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}
