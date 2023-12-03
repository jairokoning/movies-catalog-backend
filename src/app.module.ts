import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import type { RedisClientOptions } from 'redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        join(__dirname, '..', `.env.${process.env.NODE_ENV}`),
        join(__dirname, '..', '.env.dev'),
      ],
    }),
    TypeOrmModule.forRoot({
      type: process.env.DATABASE_TYPE,
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: process.env.DATABASE_SYNC,
    } as unknown as TypeOrmModuleOptions),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      store: redisStore,
      socket: {
        host: process.env.REDIS_HOST ?? 'redis',
        port: parseInt(process.env.REDIS_PORT ?? '6379'),
      },
    }),
    MoviesModule,
    UsersModule,
    AuthModule,
    // CacheModule.registerAsync<RedisClientOptions>({
    //   imports: [ConfigModule],
    //   isGlobal: true,
    //   useFactory: async () => ({
    //     store: await redisStore({
    //       socket: {
    //         host: 'redis',
    //         port: 6379,
    //       },
    //     }),
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
