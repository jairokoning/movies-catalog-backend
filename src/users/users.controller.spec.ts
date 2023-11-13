import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('create', () => {
    it('should create new user', async () => {
      const body: CreateUserDto = {
        email: 'joe.doe@example.com',
        password: '123456',
      };
      const userEntityMock = { ...body } as User;
      jest.spyOn(usersService, 'create').mockResolvedValueOnce(userEntityMock);
      const output = await usersController.create(body);
      expect(output).toBeDefined();
      expect(usersService.create).toHaveBeenCalledTimes(1);
    });
  });
});
