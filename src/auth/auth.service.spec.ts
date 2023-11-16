import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: Repository<User>;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOneOrFail: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  it('should login', async () => {
    const tokenJwt =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NzJlMmExNi1hNjY3LTQ5NzQtYjExYy1iYmQyZTllNzQzYWUiLCJlbWFpbCI6ImpvaG4uZG9lQGV4YW1wbGUuY29tIiwiaWF0IjoxNjk5OTk1OTU3LCJleHAiOjE3MDAwMDE5NTd9.Q-vJh9q-CA0jhLx7_1SJgwysgrBfcDPqLnr_cekTEuY';
    jest.spyOn(jwtService, 'sign').mockReturnValue(tokenJwt);
    const ouput = await authService.login({
      email: 'john.doe@example.com',
      password: '$Doe82#_!',
    });
    expect(ouput.token).toBe(tokenJwt);
  });

  it('should validate user', async () => {
    const mockedUserEntity = {
      email: 'john.doe@example.com',
      password: '$2y$10$YuHHCg8exrIG6KqlWqL1leAfgU9OLRH66ZEIvVydqQRniWfN2t3fq',
    } as unknown as Promise<User>;
    jest
      .spyOn(usersRepository, 'findOneOrFail')
      .mockReturnValueOnce(mockedUserEntity);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);
    const ouput = await authService.validateUser(
      'john.doe@example.com',
      '$Doe82#_!',
    );
    expect(ouput).toBe(mockedUserEntity);
  });

  it('should return null if user not found', async () => {
    jest
      .spyOn(usersRepository, 'findOneOrFail')
      .mockRejectedValueOnce(undefined);
    //jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(true);
    const output = await authService.validateUser(
      'john.doe@example.com',
      '$Doe82#_!',
    );
    expect(output).toBe(null);
  });

  it('should return null if invalid password', async () => {
    const mockedUserEntity = {
      email: 'john.doe@example.com',
      password: '$2y$10$YuHHCg8exrIG6KqlWqL1leAfgU9OLRH66ZEIvVydqQRniWfN2t3fq',
    } as unknown as Promise<User>;
    jest
      .spyOn(usersRepository, 'findOneOrFail')
      .mockReturnValueOnce(mockedUserEntity);
    jest.spyOn(bcrypt, 'compareSync').mockReturnValueOnce(false);
    const output = await authService.validateUser(
      'john.doe@example.com',
      '123456',
    );
    expect(output).toBe(null);
  });
});
