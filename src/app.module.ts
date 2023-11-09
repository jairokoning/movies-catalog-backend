import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MoviesModule } from './movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        join(__dirname, '..', `.env.${process.env.NODE_ENV}`),
        join(__dirname, '..', '.env.dev'),
      ],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      database: process.env.DATABASE_NAME,
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASS,
      entities: [__dirname + '/**/*.entity{.js,.ts}'],
      synchronize: Boolean(parseInt(process.env.DATABASE_SYNC)),
    }),
    MoviesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
