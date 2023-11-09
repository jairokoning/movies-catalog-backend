import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let movieRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    movieRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
    expect(movieRepository).toBeDefined();
  });

  it('should create and save new movie', async () => {
    const data: CreateMovieDto = {
      title: 'Nada de Novo no Front',
      description:
        'Convocado para a linha de frente da Primeira Guerra Mundial, o adolescente Paul encara a dura realidade da vida nas trincheiras',
      genre: 'Drama',
      release: 2022,
    };
    const movieEntityMock = { ...data } as Movie;
    jest.spyOn(movieRepository, 'create').mockReturnValueOnce(movieEntityMock);
    jest.spyOn(movieRepository, 'save').mockResolvedValueOnce(movieEntityMock);
    const output = await moviesService.create(data);

    expect(output).toBeDefined();
    expect(movieRepository.create).toHaveBeenCalledTimes(1);
    expect(movieRepository.save).toHaveBeenCalledTimes(1);
  });
});
