import { IsString, IsNotEmpty } from 'class-validator';

export class UploadDocDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
