import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @IsNotEmpty()
  roomCode!: string;

  @IsString()
  @IsNotEmpty()
  roomName!: string;

  @IsInt()
  @Min(1)
  capacity!: number;
}

export class UpdateRoomDto {
  @IsString()
  @IsOptional()
  roomName?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  capacity?: number;
}
