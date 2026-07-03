import {
  IsString,
  IsNotEmpty,
  IsNumber,
  Min,
  Max,
  IsOptional,
} from "class-validator";

export class ReviewCardDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsNotEmpty()
  flashcardId: string;

  @IsNumber()
  @Min(1)
  @Max(4)
  ease: number;
}
