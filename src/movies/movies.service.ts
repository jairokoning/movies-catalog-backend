import { ConflictException, Injectable } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movieExists = await this.movieRepository.findOne({
      where: { title: createMovieDto.title },
    });
    if (movieExists) {
      throw new ConflictException('Movie already exists');
    }
    return this.movieRepository.save(
      this.movieRepository.create(createMovieDto),
    );
  }

  findAll() {
    return this.movieRepository.find();
  }

  findOne(id: string) {
    return this.movieRepository.findOneOrFail({
      where: { id },
    });
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return this.movieRepository.update(id, updateMovieDto);
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
