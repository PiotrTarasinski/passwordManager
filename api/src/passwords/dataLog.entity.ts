import { ChangeTypeEnum } from './interfaces/changeType.enum';

import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity({name: 'data_log'})
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
  InitializeDate: Date;

  @Column()
  functionType: ChangeTypeEnum;

  @Column()
  recordId: number;

  @Column({ nullable: true })
  previousValue: string;

  @Column({ nullable: true })
  presentValue: string;

  @Column({ nullable: true })
  hashedValue: string;

  @Column({ nullable: true })
  previousSalt: string;

  @Column({ nullable: true })
  previousDescription: string;

  @Column({ nullable: true })
  presentDescription: string;
}