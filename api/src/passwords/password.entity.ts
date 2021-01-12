import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, BeforeUpdate } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('password')
export class PasswordEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column()
    username: string;

    @Column()
    description: string;

    @Column()
    password: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    created: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date;
    }

    @ManyToOne(type => UserEntity, user => user.passwords)
    author: UserEntity;
}

@Entity()
export class SharedPasswordEntity {
    @PrimaryGeneratedColumn()
    id: number;


    @Column()
    passwordId: number;

    @ManyToOne(
        () => PasswordEntity,
        password => password.id,
        { eager: true },
    )

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    created: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    updated: Date;

    @BeforeUpdate()
    updateTimestamp() {
        this.updated = new Date;
    }

    @ManyToOne(type => UserEntity, user => user.passwords)
    author: UserEntity;
}