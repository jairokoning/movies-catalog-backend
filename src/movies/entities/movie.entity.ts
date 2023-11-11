import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'movies' })
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column()
  genre: string;

  @Column({ type: 'int' })
  release: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamp' })
  deleted_at: Date;

  constructor(movie?: Partial<Movie>) {
    this.id = movie?.id;
    this.title = movie?.title;
    this.description = movie?.description;
    this.genre = movie?.genre;
    this.release = movie?.release;
    this.created_at = movie?.created_at;
    this.updated_at = movie?.updated_at;
    this.deleted_at = movie?.deleted_at;
  }
}
