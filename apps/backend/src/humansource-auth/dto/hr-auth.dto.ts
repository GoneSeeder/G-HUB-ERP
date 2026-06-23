import { IsEmail, IsString, MinLength } from 'class-validator';

export class HrRegisterDto {
  @IsString()
  @MinLength(1)
  displayName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class HrLoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}

export class HrLinkCodeDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  code!: string;
}
