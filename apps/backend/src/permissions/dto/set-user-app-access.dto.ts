import { IsBoolean } from 'class-validator';

export class SetUserAppAccessDto {
  @IsBoolean()
  canAccess!: boolean;
}
