import { IsString, IsOptional } from 'class-validator';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  nodeId?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  questions?: any;
}
