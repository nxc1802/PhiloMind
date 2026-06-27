import { IsString, IsNotEmpty } from 'class-validator';

export class SupabaseLoginDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}
