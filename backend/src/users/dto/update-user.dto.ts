import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsNumber()
  @IsOptional()
  streak?: number;
}
