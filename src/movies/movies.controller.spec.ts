import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

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

describe('MoviesController', () => {
  let moviesController: MoviesController;
  let moviesService: MoviesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        {
          provide: MoviesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue(movieEntityList),
            //create: jest.fn().mockResolvedValue(newMovieEntity),
            //findOneOrFail: jest.fn().mockResolvedValue(movieEntityList[0]),
            //update: jest.fn().mockResolvedValue(updatedMovieEntity),
            //deleteById: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    moviesController = module.get<MoviesController>(MoviesController);
    moviesService = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(moviesController).toBeDefined();
    expect(moviesService).toBeDefined();
  });

  describe('create', () => {
    it('should create new movie', async () => {
      const body: CreateMovieDto = {
        title: 'Mr Beans Holiday',
        description:
          'The hapless Mr. Bean takes a vacation on the French Riviera, where he becomes ensnared in an accidental kidnapping and a case of mistaken identity.',
        genre: 'Comedies',
        release: 2022,
      };
      const movieEntityMock = { ...body } as Movie;
      jest
        .spyOn(moviesService, 'create')
        .mockResolvedValueOnce(movieEntityMock);
      const output = await moviesController.create(body);
      expect(output).toBeDefined();
      expect(moviesService.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('find all', () => {
    it('should return a movie list entity', async () => {
      const output = await moviesController.findAll();
      expect(output).toEqual(movieEntityList);
      expect(moviesService.findAll).toHaveBeenCalledTimes(1);
    });
  });
});
