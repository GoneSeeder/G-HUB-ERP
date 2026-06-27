import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateApprovalConfigDto {
  @IsOptional() @IsString() mechanism?: string;
  @IsOptional() @IsString() steps?: string;
}

export class UpsertPersonApproverDto {
  @IsString() @MinLength(1) employeeId!: string;
  @IsOptional() @IsString() approverId?: string;
}
