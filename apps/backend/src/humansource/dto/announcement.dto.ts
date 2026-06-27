import { IsString, IsOptional, IsBoolean, MinLength } from 'class-validator';

export class CreateAnnouncementCategoryDto {
  @IsString() @MinLength(1) nameTh!: string;
  @IsString() color!: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class UpdateAnnouncementCategoryDto {
  @IsOptional() @IsString() nameTh?: string;
  @IsOptional() @IsString() color?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}

export class CreateAnnouncementDto {
  @IsString() @MinLength(1) title!: string;
  @IsString() categoryId!: string;
  @IsOptional() @IsString() bodyMd?: string;
  @IsOptional() @IsString() imageBase64?: string;
  @IsOptional() attachments?: unknown[];
  @IsOptional() audience?: Record<string, unknown>;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() publishAt?: string;
  @IsOptional() @IsString() publishEnd?: string;
  @IsOptional() @IsBoolean() pinned?: boolean;
}

export class UpdateAnnouncementDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() bodyMd?: string;
  @IsOptional() @IsString() imageBase64?: string;
  @IsOptional() attachments?: unknown[];
  @IsOptional() audience?: Record<string, unknown>;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() publishAt?: string;
  @IsOptional() @IsString() publishEnd?: string;
  @IsOptional() @IsBoolean() pinned?: boolean;
}
