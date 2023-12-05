import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    const usersRepository: Repository<User> = moduleFixture.get<
      Repository<User>
    >(getRepositoryToken(User));
    await usersRepository.query(`DELETE FROM users;`);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('create | create/ (POST)', () => {
    it('should create new user)', async () => {
      const data = {
        email: 'john.doe@example.com',
        password: 'xPH8$2ç!',
      };
      return request(app.getHttpServer())
        .post('/users')
        .send(data)
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty('id');
          expect(response.body.email).toBe(data.email);
          expect(response.body.password).toBeDefined();
        });
    });

    it('should throw exception if user already exists)', async () => {
      const data = {
        email: 'john.doe@example.com',
        password: 'xPH8$2ç!',
      };
      await request(app.getHttpServer()).post('/users').send(data);
      return request(app.getHttpServer())
        .post('/users')
        .send(data)
        .expect(409)
        .then((response) => {
          expect(response.body.message).toEqual('User already exists');
        });
    });

    it('should throw exception if invalid params)', async () => {
      const data = {
        email: '',
        password: '',
      };
      return request(app.getHttpServer())
        .post('/users')
        .send(data)
        .expect(400)
        .then((response) => {
          expect(response.body.message).toEqual([
            'email must be an email',
            'email should not be empty',
            'The password must contain upper and lower case letters, numbers and special characters.',
            'password should not be empty',
          ]);
        });
    });
  });
});
