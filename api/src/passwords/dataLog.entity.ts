import { ChangeTypeEnum } from './interfaces/changeType.enum';

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity({ name: 'data_log' })
export class DataLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(
    () => UserEntity,
    user => user.id,
    { eager: true },
  )
  user: number;

  @Column()
  date: Date;

  @Column()
  type: ChangeTypeEnum;

  @Column()
  passwordId: number;

  @Column({ nullable: true })
  oldUrl: string;

  @Column({ nullable: true })
  newUrl: string;

  @Column({ nullable: true })
  oldDescription: string;

  @Column({ nullable: true })
  newDescription: string;

  @Column({ nullable: true })
  oldUsername: string;

  @Column({ nullable: true })
  newUsername: string;

  @Column({ nullable: true })
  oldPassword: string;

  @Column({ nullable: true })
  newPassword: string;

  @Column({ nullable: true })
  hashedValue: string;

  @Column({ nullable: true })
  previousSalt: string;
}