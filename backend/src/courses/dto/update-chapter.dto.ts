import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsString()
  @IsOptional()
  parentChapterId?: string;
}
