import { PasswordEntity } from './../passwords/password.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { IsEmail } from 'class-validator';

@Entity('user')
export class UserEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  salt: string;

  @Column()
  @IsEmail()
  email: string;

  @Column({ default: '' })
  bio: string;

  @Column({ default: '' })
  image: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  lastSuccessLogin: Date;

  @Column({ nullable: true })
  lastFailureLogin: Date;

  @Column({ nullable: true })
  numberOfWrongLogins: number;

  @Column({ nullable: true })
  blockDate: Date;

  @Column({ default: false, nullable: true })
  isBlocked: boolean;

  @OneToMany(type => PasswordEntity, password => password.author)
  passwords: PasswordEntity[];
}
