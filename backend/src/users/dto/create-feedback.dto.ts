import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateFeedbackDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
