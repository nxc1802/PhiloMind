import { IsString, IsNotEmpty } from "class-validator";

export class SynthesizePodcastDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  scriptText: string;
}
