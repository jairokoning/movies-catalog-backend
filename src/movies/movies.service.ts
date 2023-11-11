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
    private moviesRepository: Repository<Movie>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const movieExists = await this.moviesRepository.findOne({
      where: { title: createMovieDto.title },
    });
    if (movieExists) {
      throw new ConflictException('Movie already exists');
    }
    return this.moviesRepository.save(
      this.moviesRepository.create(createMovieDto),
    );
  }

  findAll() {
    return this.moviesRepository.find();
  }

  async findOne(id: string) {
    try {
      return await this.moviesRepository.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Movie not found');
    }
  }

  async update(id: string, updateMovieDto: UpdateMovieDto) {
    const movieExists = await this.moviesRepository.findOne({
      where: { title: updateMovieDto.title, id: Not(id) },
    });
    if (movieExists) {
      throw new ConflictException('Already exists Movie with same Title');
    }
    return this.moviesRepository.update(id, updateMovieDto);
  }

  async remove(id: string) {
    const moviesExists = await this.moviesRepository.findOne({
      where: { id },
    });
    if (!moviesExists) {
      throw new NotFoundException('Movie not found');
    }
    await this.moviesRepository.softDelete(id);
  }
}
