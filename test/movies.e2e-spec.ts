import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';

// import { MoviesModule } from '../src/movies/movies.module';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { Movie } from '../src/movies/entities/movie.entity';
import { AppModule } from '../src/app.module';
import { Repository } from 'typeorm';
import { Movie } from '../src/movies/entities/movie.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
//import { MoviesModule } from 'src/movies/movies.module';

describe('MoviesController (e2e)', () => {
  let app: INestApplication;
  // let module: TestingModule;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    const moviesRepository: Repository<Movie> = moduleFixture.get<
      Repository<Movie>
    >(getRepositoryToken(Movie));
    await moviesRepository.query(`DELETE FROM movies;`);

    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/movies (POST)', async () => {
    const movie = {
      title: 'Castelo de Areia',
      description:
        'Após a invasão do Iraque em 2003, um pelotão é enviado em uma perigosa missão para reparar o fornecimento de água de uma vila hostil.',
      genre: 'Ação',
      release: 2017,
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
});
