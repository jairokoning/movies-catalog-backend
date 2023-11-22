import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ConfigModule } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { LocalStrategy } from './strategies/local.strategy';
import { join } from 'path/posix';
import { JwtStrategy } from './strategies/jwt.strategy';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        join(__dirname, '../..', `.env.${process.env.NODE_ENV}`),
        join(__dirname, '../..', '.env.dev'),
      ],
    }),
    JwtModule.register({
      //privateKey: 'UpT6B4Jcm+/lTfZLPk/HLIyYDDj9loJwbXy6vkpmlsc=',
      privateKey: process.env.JWT_SECRET_TOKEN,
      signOptions: { expiresIn: '60s' },
    }),
    UsersModule,
    PassportModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
})
export class AuthModule {}
