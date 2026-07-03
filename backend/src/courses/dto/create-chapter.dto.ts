import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator";

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  orderIndex: number;

  @IsString()
  @IsNotEmpty()
  courseId: string;

  @IsString()
  @IsOptional()
  parentChapterId?: string;
}
