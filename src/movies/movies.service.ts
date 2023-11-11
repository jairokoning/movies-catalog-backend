import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { Not, Repository } from 'typeorm';

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

  async findOne(id: string) {
    try {
      return await this.movieRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Movie not found');
    }
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const movieExists = await this.movieRepository.findOne({
      where: { title: updateMovieDto.title, id: Not(id) },
    });
    if (movieExists) {
      console.log(movieExists);
      throw new ConflictException('Already exists Movie with same Title');
    }
    return this.movieRepository.update(id, updateMovieDto);
  }

  remove(id: string) {
    return `This action removes a #${id} movie`;
  }
}
