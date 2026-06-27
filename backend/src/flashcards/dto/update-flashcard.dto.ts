import { IsString, IsOptional } from 'class-validator';

export class UpdateFlashcardDto {
  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsString()
  @IsOptional()
  answer?: string;
}
