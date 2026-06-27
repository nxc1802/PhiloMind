import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateQuizDto {
  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNotEmpty()
  questions: any;
}
