import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { describe } from 'node:test';
import { hashSync } from 'bcrypt';
import { User } from '../src/users/entities/user.entity';
import { AuthController } from '../src/auth/auth.controller';

const moviesListEntity = [
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

const user = {
  id: '1e4bbe81-5c8f-4b6d-9f52-567ae1cfcec0',
  email: 'jane.doe@example.com',
  password: '&jAnE1995%',
};

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  let module: TestingModule;
  let authController: AuthController;
  let jwt = { token: '' };

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
    await moviesRepository.query(
      `INSERT INTO movies (id, title, description, genre, release) VALUES($1, $2, $3, $4, $5);`,
      [
        moviesListEntity[0].id,
        moviesListEntity[0].title,
        moviesListEntity[0].description,
        moviesListEntity[0].genre,
        moviesListEntity[0].release,
      ],
    );
    await moviesRepository.query(
      `INSERT INTO movies (id, title, description, genre, release) VALUES($1, $2, $3, $4, $5);`,
      [
        moviesListEntity[1].id,
        moviesListEntity[1].title,
        moviesListEntity[1].description,
        moviesListEntity[1].genre,
        moviesListEntity[1].release,
      ],
    );
    await moviesRepository.query(
      `INSERT INTO movies (id, title, description, genre, release) VALUES($1, $2, $3, $4, $5);`,
      [
        moviesListEntity[2].id,
        moviesListEntity[2].title,
        moviesListEntity[2].description,
        moviesListEntity[2].genre,
        moviesListEntity[2].release,
      ],
    );
    const usersRepository: Repository<User> = moduleFixture.get<
      Repository<User>
    >(getRepositoryToken(Movie));
    await usersRepository.query(`DELETE FROM users;`);
    await usersRepository.query(
      `INSERT INTO users(id, email, password, created_at) VALUES($1, $2, $3, $4);`,
      [user.id, user.email, hashSync(user.password, 10), new Date()],
    );

    authController = module.get<AuthController>(AuthController);
    jwt = await authController.login({ user: user });

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
        .post('/movies') //  .auth(user.email, user.password) .set('Authorization', `Bearer ${jwt.token}`)
        .send(movie)
        .set({ Authorization: `Bearer ${jwt.token}` })
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
        `INSERT INTO movies (id, title, description, genre, release) VALUES('82c5b383-9dc1-4a35-b480-a6beb0d3b45e', $1, $2, $3, $4);`,
        [movie.title, movie.description, movie.genre, movie.release],
      );
      return request(app.getHttpServer())
        .post('/movies')
        .send(movie)
        .set({ Authorization: `Bearer ${jwt.token}` })
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
        .set({ Authorization: `Bearer ${jwt.token}` })
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
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toEqual([
            'release must be an integer number',
          ]);
        });
    });

    it('should list all movies)', async () => {
      return request(app.getHttpServer())
        .get('/movies')
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveLength(3);
        });
    });

    it('should show a single movie)', async () => {
      return request(app.getHttpServer())
        .get('/movies/3dc6e8a1-4486-4be5-9fae-ff3da31607b2')
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(200)
        .then((response) => {
          expect(response.body.id).toEqual(moviesListEntity[2].id);
        });
    });

    it('should throw not found exception if movie not exists)', async () => {
      return request(app.getHttpServer())
        .get('/movies/2974ff12-e146-4d06-84ec-cf07a559fa1b')
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(404)
        .then((response) => {
          expect(response.body.message).toEqual('Movie not found');
        });
    });

    it('should update movie)', async () => {
      return request(app.getHttpServer())
        .put('/movies/dbcf8192-3f8d-4381-9fdf-b05e9aaeda52')
        .send({
          title: 'Saving Private Ryan',
          description:
            'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
          genre: 'War | Drama',
          release: 1998,
        })
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(200);
    });

    it('should throw exception if other movie already exists whith same title)', async () => {
      return request(app.getHttpServer())
        .put('/movies/dbcf8192-3f8d-4381-9fdf-b05e9aaeda52')
        .send({
          title: 'Mr Beans Holiday',
          description:
            'After braving D-Day, Capt. John Miller leads a band of soldiers behind enemy lines to find a paratrooper whose three brothers have been killed in action.',
          genre: 'Drama',
          release: 1998,
        })
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(409);
    });

    it('should throw a exception if required props empty)', async () => {
      const movie = {
        title: '',
        description: '',
        genre: '',
        release: '',
      };
      return request(app.getHttpServer())
        .put('/movies/dbcf8192-3f8d-4381-9fdf-b05e9aaeda52')
        .send(movie)
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toEqual([
            'title should not be empty',
            'description should not be empty',
            'genre should not be empty',
            'release must be an integer number',
            'release should not be empty',
          ]);
        });
    });

    it('should delete a movie)', async () => {
      return request(app.getHttpServer())
        .delete('/movies/dbcf8192-3f8d-4381-9fdf-b05e9aaeda52')
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(200);
    });

    it('should throw not found exception if movie not exists)', async () => {
      return request(app.getHttpServer())
        .delete('/movies/2974ff12-e146-4d06-84ec-cf07a559fa1b')
        .set({ Authorization: `Bearer ${jwt.token}` })
        .expect(404)
        .then((response) => {
          expect(response.body.message).toEqual('Movie not found');
        });
    });
  });
});
