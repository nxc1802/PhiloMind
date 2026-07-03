import { IsString, IsNotEmpty } from "class-validator";

export class CreateDebateTopicDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  initialPrompt: string;
}
