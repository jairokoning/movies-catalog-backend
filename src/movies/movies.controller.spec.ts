import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';

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
        title: 'Nada de Novo no Front',
        description:
          'Convocado para a linha de frente da Primeira Guerra Mundial, o adolescente Paul encara a dura realidade da vida nas trincheiras',
        genre: 'Drama',
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
});
