import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePodcastDto {
  @IsString()
  @IsNotEmpty()
  nodeId: string;

  @IsString()
  @IsNotEmpty()
  audioUrl: string;

  @IsNotEmpty()
  transcript: any;
}
