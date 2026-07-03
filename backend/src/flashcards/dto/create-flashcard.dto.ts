import { IsString, IsNotEmpty } from "class-validator";

export class CreateFlashcardDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  tag: string;

  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
