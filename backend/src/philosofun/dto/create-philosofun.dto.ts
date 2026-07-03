import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreatePhilosofunDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  videoUrl: string;
}
