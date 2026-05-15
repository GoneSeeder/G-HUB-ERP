import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsString()
  @IsIn(['admin', 'user'])
  roleCode!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  appCodes?: string[];
}
