import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class DebateMessageDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  message: string;
}
