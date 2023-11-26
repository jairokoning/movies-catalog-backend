import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { Repository } from 'typeorm';
import { CreateMovieDto } from './dto/create-movie.dto';
import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common/exceptions';
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

const updatedMovieEntityItem = new Movie({
  id: 'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
  title: 'Saving Private Ryan',
  description:
    'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
  genre: 'War | Drama',
  release: 1998,
});

describe('MoviesService', () => {
  let moviesService: MoviesService;
  let moviesRepository: Repository<Movie>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            create: jest.fn(),
            save: jest.fn().mockResolvedValue(movieEntityList[0]),
            find: jest.fn().mockResolvedValue(movieEntityList),
            findOne: jest.fn().mockResolvedValue(movieEntityList[0]),
            findOneOrFail: jest.fn().mockResolvedValue(movieEntityList[2]),
            update: jest.fn().mockReturnValue(updatedMovieEntityItem),
            softDelete: jest.fn().mockReturnValue(undefined),
          },
        },
      ],
    }).compile();

    moviesService = module.get<MoviesService>(MoviesService);
    moviesRepository = module.get<Repository<Movie>>(getRepositoryToken(Movie));
  });

  it('should be defined', () => {
    expect(moviesService).toBeDefined();
    expect(moviesRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save new movie', async () => {
      const data: CreateMovieDto = {
        title: 'All Quiet on the Western Front',
        description:
          'When 17-year-old Paul joins the Western Front in World War I, his initial excitement is soon shattered by the grim reality of life in the trenches.',
        genre: 'Drama',
        release: 2022,
      };
      const movieEntityMock = { ...data } as Movie;
      jest
        .spyOn(moviesRepository, 'create')
        .mockReturnValueOnce(movieEntityMock);
      jest
        .spyOn(moviesRepository, 'save')
        .mockResolvedValueOnce(movieEntityMock);
      jest.spyOn(moviesRepository, 'findOne').mockResolvedValueOnce(undefined);
      const output = await moviesService.create(data);
      expect(output).toBeDefined();
      expect(output).toEqual(data);
      expect(moviesRepository.create).toHaveBeenCalledTimes(1);
      expect(moviesRepository.save).toHaveBeenCalledTimes(1);
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

  describe('find all', () => {
    it('should return a movie entity list', async () => {
      const output = await moviesService.findAll();
      expect(output).toEqual(movieEntityList);
      expect(moviesRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('find one', () => {
    it('should return a single movie entity', async () => {
      const output = await moviesService.findOne(
        '3dc6e8a1-4486-4be5-9fae-ff3da31607b2',
      );
      expect(output).toEqual(movieEntityList[2]);
      expect(moviesRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });

    it('should throw not found exception if movie not exists', async () => {
      jest
        .spyOn(moviesRepository, 'findOneOrFail')
        .mockRejectedValueOnce(undefined);
      await expect(
        moviesService.findOne('2974ff12-e146-4d06-84ec-cf07a559fa1b'),
      ).rejects.toThrow(new NotFoundException('Movie not found'));
    });
  });

  describe('update', () => {
    it('should update a movie', async () => {
      const data: UpdateMovieDto = {
        title: 'Saving Private Ryan',
        description:
          'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
        genre: 'War | Drama',
        release: 1998,
      };
      jest.spyOn(moviesRepository, 'findOne').mockResolvedValueOnce(undefined);
      jest
        .spyOn(moviesRepository, 'save')
        .mockResolvedValueOnce(updatedMovieEntityItem);
      const output = await moviesService.update(
        'dbcf8192-3f8d-4381-9fdf-b05e9aaeda52',
        data,
      );
      expect(output).toEqual(updatedMovieEntityItem);
    });

    it('should throw exception if other movie already exists whith same title', async () => {
      const data: CreateMovieDto = {
        title: 'Mr Beans Holiday',
        description:
          'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
        genre: 'War | Drama',
        release: 1998,
      };
      await expect(
        moviesService.update('dbcf8192-3f8d-4381-9fdf-b05e9aaeda52', data),
      ).rejects.toThrow(
        new ConflictException('Already exists Movie with same Title'),
      );
    });
  });

  describe('delete', () => {
    it('should delete a movie', async () => {
      await moviesService.remove('dbcf8192-3f8d-4381-9fdf-b05e9aaeda52');
      expect(moviesRepository.findOne).toHaveBeenCalledTimes(1);
      expect(moviesRepository.softDelete).toHaveBeenCalledTimes(1);
    });

    it('should throw not found exception if movie not exists', async () => {
      jest.spyOn(moviesRepository, 'findOne').mockResolvedValueOnce(undefined);
      await expect(
        moviesService.remove('2974ff12-e146-4d06-84ec-cf07a559fa1b'),
      ).rejects.toThrow(new NotFoundException('Movie not found'));
    });
  });
});
