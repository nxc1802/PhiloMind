import {
  IsBoolean,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from "class-validator";

export class CreateNodeDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  summary: string;

  @IsString()
  @IsNotEmpty()
  originalText: string;

  @IsString()
  @IsNotEmpty()
  quickTake: string;

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
  @IsNotEmpty()
  orderIndex: number;

  @IsString()
  @IsNotEmpty()
  chapterId: string;

  @IsOptional()
  lessonType?: string;

  @IsOptional()
  lessonFlow?: any;

  @IsOptional()
  lessonMedia?: any;

  @IsBoolean()
  @IsOptional()
  contentReady?: boolean;

  @IsString()
  @IsOptional()
  lessonStatus?: string;
}
