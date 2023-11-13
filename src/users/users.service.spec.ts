import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { ConflictException } from '@nestjs/common';

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('create', () => {
    it('should create and save new user', async () => {
      const data: CreateUserDto = {
        email: 'john.doe@example.com',
        password: '123456',
      };
      const userEntityMock = { ...data } as User;
      jest.spyOn(usersRepository, 'create').mockReturnValueOnce(userEntityMock);
      jest.spyOn(usersRepository, 'save').mockResolvedValueOnce(userEntityMock);
      //jest.spyOn(usersRepository, 'findOne').mockResolvedValueOnce(undefined);
      const output = await usersService.create(data);
      expect(output).toBeDefined();
      expect(output).toEqual(data);
      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw exception if user already exists', async () => {
      const data: CreateUserDto = {
        email: 'john.doe@example.com',
        password: '123456',
      };
      const userEntityMock = {
        id: 'c4bf227d-8ab9-464c-a994-52c106eacba6',
        ...data,
      } as User;

      jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(userEntityMock);
      await expect(usersService.create(data)).rejects.toThrow(
        new ConflictException('User already exists'),
      );
    });
  });
});
