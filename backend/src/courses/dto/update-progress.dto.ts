import { IsString, IsOptional, IsBoolean } from "class-validator";

export class UpdateProgressDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsOptional()
  @IsBoolean()
  lessonCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  flashcardCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  podcastCompleted?: boolean;

  @IsOptional()
  @IsBoolean()
  quizCompleted?: boolean;
}
