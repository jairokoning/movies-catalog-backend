import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { ConflictException } from '@nestjs/common/exceptions';

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
            findOne: jest.fn(),
            findOneOrFail: jest.fn(),
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
      title: 'All Quiet on the Western Front',
      description:
        'When 17-year-old Paul joins the Western Front in World War I, his initial excitement is soon shattered by the grim reality of life in the trenches.',
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

  it('should throw new error if movie already exists', async () => {
    const data: CreateMovieDto = {
      title: 'Saving Private Ryan',
      description:
        'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
      genre: 'Drama',
      release: 1998,
    };
    const movieEntityMock = { ...data } as unknown as Promise<Movie>;
    jest.spyOn(movieRepository, 'findOne').mockReturnValueOnce(movieEntityMock);
    await expect(moviesService.create(data)).rejects.toThrow(
      new ConflictException('Movie already exists'),
    );
  });
});
