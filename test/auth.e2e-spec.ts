import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { hashSync } from 'bcrypt';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  const user = {
    email: 'jane.doe@example.com',
    password: '&jAnE1995%',
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    const usersRepository: Repository<User> = moduleFixture.get<
      Repository<User>
    >(getRepositoryToken(User));
    await usersRepository.query(`DELETE FROM users;`);
    await usersRepository.query(
      `INSERT INTO users(id, email, password, created_at) VALUES($1, $2, $3, $4);`,
      [
        '1e4bbe81-5c8f-4b6d-9f52-567ae1cfcec0',
        user.email,
        hashSync(user.password, 10),
        new Date(),
      ],
    );
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('auth | login/ (POST)', () => {
    it('should login)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(user)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('token');
          expect(response.body.token).toBeDefined();
        });
    });

    it('should throw exception if user not exists)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'doe.example.com', password: '7410xp!@#$F' })
        .expect(401)
        .then((response) => {
          expect(response.body.message).toEqual(
            'Email and/or password are invalid.',
          );
        });
    });

    it('should throw exception if invalid password)', async () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: user.email, password: user.password + 'AbC' })
        .expect(401)
        .then((response) => {
          expect(response.body.message).toEqual(
            'Email and/or password are invalid.',
          );
        });
    });
  });
});
