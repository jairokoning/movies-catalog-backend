import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

const movieEntityList: Movie[] = [
  new Movie({
    id: '1481f13a-d0f6-476b-9535-a2f4a98e51a7',
    title: 'Mr Beans Holiday',
    description:
      'The hapless Mr. Bean takes a vacation on the French Riviera, where he becomes ensnared in an accidental kidnapping and a case of mistaken identity.',
    genre: 'Comedies',
    release: 2022,
  }),
  new Movie({
    id: 'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
    title: 'Saving Private Ryan',
    description:
      'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
    genre: 'Drama',
    release: 1998,
  }),
  new Movie({
    id: '3dc6e8a1-4486-4be5-9fae-ff3da31607b2',
    title: 'Race to the Summit',
    description:
      'Fearless alpine climbers Ueli Steck and Dani Arnold enter into a death-defying rivalry to set speed records on the Swiss Alps great north faces.',
    genre: 'Documentaries',
    release: 2023,
  }),
];

const updatedMovieEntity = new Movie({
  id: 'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
  title: 'Saving Private Ryan',
  description:
    'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
  genre: 'War | Drama',
  release: 1998,
});

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
            findOne: jest.fn().mockResolvedValue(movieEntityList[1]),
            update: jest.fn().mockResolvedValue(updatedMovieEntity),
            remove: jest.fn().mockResolvedValue(undefined),
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
    it('should return a movie entity list', async () => {
      const output = await moviesController.findAll();
      expect(output).toEqual(movieEntityList);
      expect(moviesService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('find one', () => {
    it('should return a single movie entity', async () => {
      const result = await moviesController.findOne(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
      );
      expect(result).toEqual(movieEntityList[1]);
      expect(moviesService.findOne).toHaveBeenCalledTimes(1);
      expect(moviesService.findOne).toHaveBeenCalledWith(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
      );
    });
  });

  describe('update', () => {
    it('should update a todo item successfully', async () => {
      const body: UpdateMovieDto = {
        title: 'Saving Private Ryan',
        description:
          'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
        genre: 'War | Drama',
        release: 1998,
      };
      const result = await moviesController.update(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
        body,
      );
      expect(result).toEqual(updatedMovieEntity);
      expect(moviesService.update).toHaveBeenCalledTimes(1);
      expect(moviesService.update).toHaveBeenCalledWith(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
        body,
      );
    });
  });

  describe('remove', () => {
    it('should delete a movie', async () => {
      await moviesController.remove('dbcf8192-3f8d-4381-9fdf-b05e9aaeda52');
      expect(moviesService.remove).toHaveBeenCalledTimes(1);
      expect(moviesService.remove).toHaveBeenCalledWith(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
      );
    });
  });
});
