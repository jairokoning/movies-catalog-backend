import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';

// import { MoviesModule } from '../src/movies/movies.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Movie } from '../src/movies/entities/movie.entity';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe } from 'node:test';
//import { MoviesModule } from 'src/movies/movies.module';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    module = moduleFixture;
    const moviesRepository: Repository<Movie> = moduleFixture.get<
      Repository<Movie>
    >(getRepositoryToken(Movie));
    await moviesRepository.query(`DELETE FROM movies;`);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('Create | /movies (POST)', () => {
    it('should create new movie)', async () => {
      const movie = {
        title: 'The Secret Life of Pets',
        description:
          'After ending up in the outside world, two squabbling pet dogs find common ground against a gang of angry animals preparing an attack on humans.',
        genre: 'Kids',
        release: 2016,
      };
      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(201)
        .then((response) => {
          const data = response.body;
          expect(data).toHaveProperty('id');
          expect(data.title).toEqual(movie.title);
        });
    });

    it('should throw a exception if movie already exists)', async () => {
      const movie = {
        title: 'Unknown: The Lost Pyramid',
        description:
          'Egyptian archeologists dig into history, discovering tombs and artifacts over 4,000 years old as they search for a buried pyramid in this documentary.',
        genre: 'Documentaries',
        release: 2023,
      };
      const moviesRepository: Repository<Movie> = module.get<Repository<Movie>>(
        getRepositoryToken(Movie),
      );
      await moviesRepository.query(
        `INSERT INTO movies (id, title, description, genre, release) VALUES('1481f13a-d0f6-476b-9535-a2f4a98e51a7', $1, $2, $3, $4);`,
        [movie.title, movie.description, movie.genre, movie.release],
      );
      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(409)
        .then((response) => {
          expect(response.body.message).toBe('Movie already exists');
        });
    });

    it('should throw a exception if required props empty)', async () => {
      const movie = {
        title: '',
        description: '',
        genre: '',
        release: 2010,
      };
      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toEqual([
            'title should not be empty',
            'description should not be empty',
            'genre should not be empty',
          ]);
        });
    });

    it('should throw a exception if release not a number)', async () => {
      const movie = {
        title: 'King of Clones',
        description:
          'From groundbreaking human cloning research to a scandalous downfall, this documentary tells the captivating story of Koreas most notorious scientist.',
        genre: 'Documentaries',
        release: 'two thousand twenty-three',
      };
      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toEqual([
            'release must be an integer number',
          ]);
        });
    });
  });
});
