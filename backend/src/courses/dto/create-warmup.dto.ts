import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWarmupDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsString()
  @IsOptional()
  blanks?: string;

  @IsString()
  @IsOptional()
  answer?: string;

  @IsString()
  @IsOptional()
  story?: string;

  @IsString()
  @IsOptional()
  question?: string;

  @IsOptional()
  options?: string[];

  @IsOptional()
  correctIndex?: number;

  @IsString()
  @IsNotEmpty()
  reveal: string;
}
