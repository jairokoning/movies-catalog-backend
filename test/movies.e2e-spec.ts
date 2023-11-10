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

    it('should list all movies)', async () => {
      const movies = [
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
      const moviesRepository: Repository<Movie> = module.get<Repository<Movie>>(
        getRepositoryToken(Movie),
      );
      await moviesRepository.query(
        `INSERT INTO movies (id, title, description, genre, release) VALUES('1481f13a-d0f6-476b-9535-a2f4a98e51a7', $1, $2, $3, $4);`,
        [
          movies[0].title,
          movies[0].description,
          movies[0].genre,
          movies[0].release,
        ],
      );
      await moviesRepository.query(
        `INSERT INTO movies (id, title, description, genre, release) VALUES('dbcf8192-3f8d-4381-9fdf-b05e9aaeda52', $1, $2, $3, $4);`,
        [
          movies[1].title,
          movies[1].description,
          movies[1].genre,
          movies[1].release,
        ],
      );
      await moviesRepository.query(
        `INSERT INTO movies (id, title, description, genre, release) VALUES('3dc6e8a1-4486-4be5-9fae-ff3da31607b2', $1, $2, $3, $4);`,
        [
          movies[2].title,
          movies[2].description,
          movies[2].genre,
          movies[2].release,
        ],
      );
      return request(app.getHttpServer())
        .get('/movies')
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveLength(3);
        });
    });
  });
});
