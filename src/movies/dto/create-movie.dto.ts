import { IsInt, IsNotEmpty } from 'class-validator';

export class CreateMovieDto {
  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  genre: string;

  @IsNotEmpty()
  @IsInt()
  release: number;
}
