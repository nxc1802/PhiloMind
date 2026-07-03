import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateComponentProgressDto {
  @IsString()
  @IsOptional()
  activeComponentId?: string;

  @IsNumber()
  @IsOptional()
  currentComponentIndex?: number;

  @IsArray()
  @IsOptional()
  completedComponentIds?: string[];

  @IsOptional()
  componentResult?: any;
}
