import { UpdatePasswordDto } from './dto/update-password.dto';
import { UserService } from './../user/user.service';
import { UserEntity } from './../user/user.entity';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { PasswordEntity, SharedPasswordEntity } from './password.entity';
import { Injectable, HttpStatus, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePasswordDto } from './dto';
import * as CryptoAES from 'crypto-js/aes';
import * as CryptoENC from 'crypto-js/enc-utf8';
import { CreatePasswordResponse } from './dto/create-password-response';
import { DataLogEntity } from './dataLog.entity';
import { ChangeTypeEnum } from './interfaces/changeType.enum';

@Injectable()
export class PasswordService {


    constructor(
        @InjectRepository(PasswordEntity)
        private readonly passwordRepository: Repository<PasswordEntity>,
        @InjectRepository(SharedPasswordEntity)
        private sharedPasswordRepository: Repository<SharedPasswordEntity>,
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
        @Inject(forwardRef(() => UserService))
        private userService: UserService,
        @InjectRepository(DataLogEntity)
        private dataLogRepository: Repository<DataLogEntity>
    ) { }

    async findAll(user?: any): Promise<PasswordEntity[]> {

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }

        const author = user.id;
        const passwords = await this.passwordRepository.find({ where: { author } });
        const qb = await this.passwordRepository.createQueryBuilder();

        const sharedPasswords = await this.sharedPasswordRepository.find({ where: { author } });
        const ids = sharedPasswords.map((i) => i.passwordId);
        let sharedPasswordResults = ids.length ? await qb.whereInIds(ids).getMany() : [];

        return sharedPasswords ? [...passwords, ...sharedPasswordResults] : [...passwords];

    }

    async findOne(id: string, session: { password: string }, user?: any): Promise<PasswordEntity> {

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }

        if (!session.password) {
            throw new HttpException({ message: 'Validation failed. Please log out.' }, HttpStatus.UNAUTHORIZED);
        }

        const pass = await this.passwordRepository.createQueryBuilder().where({ id }).getRawOne();
        const password = pass["PasswordEntity_password"];
        if (pass["PasswordEntity_authorId"] !== user.id) {
            const author = await this.userRepository.findOne({ id: pass["PasswordEntity_authorId"] });
            pass.password = CryptoAES.decrypt(password, author.password).toString(CryptoENC);
        } else {
            pass.password = CryptoAES.decrypt(password, user.password).toString(CryptoENC);
        }

        const newPass = {};

        Object.keys(pass).forEach(function (key) {
            if (key !== 'password') {
                newPass[key.split("_")[1]] = pass[key];
            } else {
                newPass[key] = pass[key];
            }
        });

        return newPass as PasswordEntity;

    }

    async findOneById(passwordId: number): Promise<PasswordEntity> {
        return await this.passwordRepository.findOne(passwordId);
    }

    async findOnePasswordLog(id: number, user: any): Promise<DataLogEntity> {
        const log = await this.dataLogRepository.findOne({ where: { id: Number(id) } });

        if (log.userId !== user.id) {
            throw new HttpException({ message: 'Unauthorized.' }, HttpStatus.UNAUTHORIZED);
        }

        log.previousValue = CryptoAES.decrypt(log.previousValue, log.hashedValue).toString(CryptoENC);
        log.presentValue = CryptoAES.decrypt(log.presentValue, log.hashedValue).toString(CryptoENC);
        return log;
    }

    async delete(id: string, user?: any) {

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }

        if (!id) {
            throw new HttpException({ message: 'No id was provided' }, HttpStatus.BAD_REQUEST);
        }

        const password = await this.passwordRepository.createQueryBuilder().where({ id }).getRawOne();

        if (password["PasswordEntity_authorId"] !== user.id) {
            throw new HttpException({ message: 'You have to be owner to delete this password.' }, HttpStatus.BAD_REQUEST);
        }

        const author = user.id;
        const res = await this.passwordRepository.delete({ id: id as unknown as number, author });

        const dataLogEntity = this.buildLogEntity(new Date(), password["PasswordEntity_password"], "", password["PasswordEntity_id"], user, user.password, null, password["PasswordEntity_description"], ChangeTypeEnum.DELETE_PASSWORD);

        await this.dataLogRepository.save(dataLogEntity);

        if (res.affected === 0) {
            throw new HttpException({ message: 'Could not delete given record' }, HttpStatus.BAD_REQUEST);
        } else {
            return { message: 'Deletion OK' };
        }

    }

    async recoverLastState(logId: number, user?: any): Promise<any> {
        const log = await this.dataLogRepository.findOne({ where: { id: logId } });
        switch (log.functionType) {
            case ChangeTypeEnum.DELETE_PASSWORD: {
                let passwordEntity = new PasswordEntity();
                passwordEntity.password = CryptoAES.encrypt(CryptoAES.decrypt(log.previousValue, log.hashedValue).toString(CryptoENC), user.password).toString();
                passwordEntity.description = log.previousValue;
                passwordEntity.author = user;

                const savedPassword = await this.passwordRepository.save(passwordEntity);

                const dataLogEntity = this.buildLogEntity(new Date(), null, log.presentValue, log.recordId, user, log.hashedValue, log.presentDescription, null, ChangeTypeEnum.RESTORE_STATE);

                await this.dataLogRepository.save(dataLogEntity);

                return { message: 'Restoration OK' };
            }

            case ChangeTypeEnum.MODIFY_PASSWORD: {
                const password = await this.passwordRepository.findOne({ id: log.recordId });
                const oldPassword = password;
                const decryptedPassword = CryptoAES.decrypt(log.previousValue, log.hashedValue).toString(CryptoENC);
                password.password = CryptoAES.encrypt(decryptedPassword, user.password).toString();
                password.description = log.previousDescription;

                await this.passwordRepository.save(password);

                const dataLogEntity = this.buildLogEntity(new Date(), log.presentValue, oldPassword.password, log.recordId, user, user.password, password.description, log.presentDescription, ChangeTypeEnum.RESTORE_STATE);

                await this.dataLogRepository.save(dataLogEntity);

                return { message: 'Restoration OK' };
            }
        }
    }

    async getPasswordLog(id: string): Promise<any> {
        const logs = await this.dataLogRepository.find({ where: { recordId: Number(id) } });
        return logs;
    }

    async getPasswordLogs(id: string): Promise<any> {
        const logs = await this.dataLogRepository.find({ where: { userId: Number(id) } });
        return logs;
    }

    async update(dto: UpdatePasswordDto, session: { password: string }, user?: any): Promise<CreatePasswordResponse> {
        const { id, url, username, description, password } = dto;
        let toUpdate = await this.passwordRepository.findOne(id);

        if (!session.password) {
            throw new HttpException({ message: 'Validation failed. Please log out.' }, HttpStatus.UNAUTHORIZED);
        }

        if (!dto.password || dto.password == '') {
            throw new HttpException({ message: 'Password was not provided' }, HttpStatus.BAD_REQUEST);
        }

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }



        let passwordEntity = new PasswordEntity();
        passwordEntity.id = toUpdate.id;
        passwordEntity.url = url;
        passwordEntity.description = description;
        passwordEntity.username = username;
        passwordEntity.password = password ? CryptoAES.encrypt(password, user.password).toString() : null;


        const savedPassword = await this.passwordRepository.save(passwordEntity);

        const dataLogEntity = this.buildLogEntity(new Date(), toUpdate.password, passwordEntity.password, savedPassword.id, user, user.password, toUpdate.description, savedPassword.description, ChangeTypeEnum.MODIFY_PASSWORD);

        await this.dataLogRepository.save(dataLogEntity);

        return this.buildPasswordRO(savedPassword);

    }

    async create(dto: CreatePasswordDto, session: { password: string }, user?: any): Promise<CreatePasswordResponse> {

        const { url, username, description, password } = dto;
        if (!session.password) {
            throw new HttpException({ message: 'Validation failed. Please log out.' }, HttpStatus.UNAUTHORIZED);
        }

        if (!dto.password || dto.password == '') {
            throw new HttpException({ message: 'Password was not provided' }, HttpStatus.BAD_REQUEST);
        }

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }

        let passwordEntity = new PasswordEntity();
        passwordEntity.author = user;
        passwordEntity.url = url;
        passwordEntity.description = description;
        passwordEntity.username = username;
        passwordEntity.password = CryptoAES.encrypt(password, user.password).toString();

        const savedPassword = await this.passwordRepository.save(passwordEntity);

        const dataLogEntity = this.buildLogEntity(new Date(), "", passwordEntity.password, savedPassword.id, user, user.password, null, savedPassword.description, ChangeTypeEnum.ADD_PASSWORD);

        await this.dataLogRepository.save(dataLogEntity);

        return this.buildPasswordRO(savedPassword);

    }

    async sharePassword({
        email,
        passwordId,
    }: any): Promise<any> {
        const userSearchResult = await this.userService.findRawByEmail(email);
        const passwordSearchResult = await this.findOneById(passwordId);

        let insertResult = null;



        if (userSearchResult && passwordSearchResult) {
            this.sharedPasswordRepository.insert({ author: userSearchResult, passwordId: passwordId })
        } else {
            throw new HttpException(
                {
                    status: HttpStatus.NOT_FOUND,
                    error: `${userSearchResult ? 'User' : 'Password'} not found.`,
                },
                HttpStatus.NOT_FOUND,
            );
        }

        return insertResult;
    }

    public buildPasswordRO(password: PasswordEntity): CreatePasswordResponse {
        const passwordRO = {
            id: password.id,
            password: password.password,
            description: password.description,
            created: password.created
        };

        return { passwordRO };
    }

    private buildLogEntity(initializeDate, previousValue, presentValue, recordId, user, hashedValue, previousDescription, presentDescription, functionType) {
        const logEntity = new DataLogEntity();
        logEntity.InitializeDate = initializeDate;
        logEntity.previousValue = previousValue;
        logEntity.presentValue = presentValue;
        logEntity.recordId = recordId;
        logEntity.user = user;
        logEntity.hashedValue = user.password;
        logEntity.previousDescription = previousDescription;
        logEntity.presentDescription = presentDescription;
        logEntity.hashedValue = hashedValue;
        logEntity.functionType = functionType;
        return logEntity;
    }

}
