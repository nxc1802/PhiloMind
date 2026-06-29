import { IsBoolean, IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateNodeDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  originalText?: string;

  @IsString()
  @IsOptional()
  quickTake?: string;

  @IsString()
  @IsOptional()
  difficulty?: string;

  @IsString()
  @IsOptional()
  timeToRead?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  lessonType?: string;

  @IsOptional()
  lessonFlow?: any;

  @IsBoolean()
  @IsOptional()
  contentReady?: boolean;

  @IsString()
  @IsOptional()
  lessonStatus?: string;
}
