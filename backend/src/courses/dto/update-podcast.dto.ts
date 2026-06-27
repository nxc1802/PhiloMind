import { IsString, IsOptional } from 'class-validator';

export class UpdatePodcastDto {
  @IsString()
  @IsOptional()
  audioUrl?: string;

  @IsOptional()
  transcript?: any;
}
