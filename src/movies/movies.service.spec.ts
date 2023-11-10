import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import { ConflictException } from '@nestjs/common/exceptions';

const movieEntityList: Movie[] = [
  new Movie({
    title: 'Mr Beans Holiday',
    description:
      'The hapless Mr. Bean takes a vacation on the French Riviera, where he becomes ensnared in an accidental kidnapping and a case of mistaken identity.',
    genre: 'Comedies',
    release: 2022,
  }),
  new Movie({
    title: 'Saving Private Ryan',
    description:
      'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
    genre: 'Drama',
    release: 1998,
  }),
  new Movie({
    title: 'Race to the Summit',
    description:
      'Fearless alpine climbers Ueli Steck and Dani Arnold enter into a death-defying rivalry to set speed records on the Swiss Alps great north faces.',
    genre: 'Documentaries',
    release: 2023,
  }),
];

const updatedMovieEntityItem = new Movie({
  title: 'Saving Private Ryan',
  description:
    'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
  genre: 'War | Drama',
  release: 1998,
});

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
            // save: jest.fn(),
            // find: jest.fn(),
            // findOne: jest.fn(),
            // findOneOrFail: jest.fn(),
            //create: jest.fn().mockReturnValue(movieEntityList[0]),
            save: jest.fn().mockResolvedValue(movieEntityList[0]),
            find: jest.fn().mockResolvedValue(movieEntityList),
            findOne: jest.fn().mockResolvedValue(movieEntityList[0]),
            //findOneOrFail: jest.fn().mockResolvedValue(movieEntityList[0]),
            merge: jest.fn().mockReturnValue(updatedMovieEntityItem),
            softDelete: jest.fn().mockReturnValue(undefined),
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
    jest.spyOn(movieRepository, 'findOne').mockResolvedValueOnce(undefined);
    const output = await moviesService.create(data);
    expect(output).toBeDefined();
    expect(output).toEqual(data);
    expect(movieRepository.create).toHaveBeenCalledTimes(1);
    expect(movieRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw new error if movie already exists', async () => {
    const data: CreateMovieDto = {
      title: 'Mr Beans Holiday',
      description:
        'The hapless Mr. Bean takes a vacation on the French Riviera, where he becomes ensnared in an accidental kidnapping and a case of mistaken identity.',
      genre: 'Comedies',
      release: 2022,
    };
    await expect(moviesService.create(data)).rejects.toThrow(
      new ConflictException('Movie already exists'),
    );
  });
});
