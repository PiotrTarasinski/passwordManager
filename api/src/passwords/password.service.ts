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

    async findAll(user?: any): Promise<any[]> {

        if (!user) {
            throw new HttpException({ message: 'Could not find password owner.' }, HttpStatus.UNAUTHORIZED);
        }

        const author = user.id;
        const passwords = await this.passwordRepository.find({ where: { author } });
        const qb = await this.passwordRepository.createQueryBuilder();

        const sharedPasswords = await this.sharedPasswordRepository.find({ where: { author } });
        const ids = sharedPasswords.map((i) => i.passwordId);
        let sharedPasswordResults = ids.length ? await qb.whereInIds(ids).getMany() : [];
        let sharedPasswordsRes = sharedPasswordResults.map(el => ({ ...el, isShared: true }));

        return sharedPasswords ? [...passwords, ...sharedPasswordsRes] : [...passwords];

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

        log.oldPassword = CryptoAES.decrypt(log.oldPassword, log.hashedValue).toString(CryptoENC);
        log.newPassword = CryptoAES.decrypt(log.newPassword, log.hashedValue).toString(CryptoENC);
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

        const dataLogEntity = this.buildLogEntity(
            new Date(),
            password["PasswordEntity_id"],
            user,
            user.password,
            ChangeTypeEnum.DELETE_PASSWORD,
            password["PasswordEntity_url"],
            '',
            password["PasswordEntity_description"],
            '',
            password["PasswordEntity_username"],
            '',
            password["PasswordEntity_password"],
            ''
        );

        await this.dataLogRepository.save(dataLogEntity);

        if (res.affected === 0) {
            throw new HttpException({ message: 'Could not delete given record' }, HttpStatus.BAD_REQUEST);
        } else {
            return { message: 'Deletion OK' };
        }

    }

    async recoverLastState(logId: number, user?: any): Promise<any> {
        const log = await this.dataLogRepository.findOne({ where: { id: logId } });
        switch (log.type) {
            case ChangeTypeEnum.DELETE_PASSWORD: {
                let passwordEntity = new PasswordEntity();
                passwordEntity.author = user;
                passwordEntity.url = log.oldUrl;
                passwordEntity.description = log.oldDescription;
                passwordEntity.username = log.oldUsername;
                passwordEntity.password = CryptoAES.encrypt(CryptoAES.decrypt(log.oldPassword, log.hashedValue).toString(CryptoENC), user.password).toString();

                const savedPassword = await this.passwordRepository.save(passwordEntity);

                const dataLogEntity = this.buildLogEntity(
                    new Date(),
                    log.passwordId,
                    user,
                    log.hashedValue,
                    ChangeTypeEnum.RESTORE_STATE,
                    '',
                    savedPassword.url,
                    '',
                    savedPassword.description,
                    '',
                    savedPassword.username,
                    '',
                    log.newPassword
                );

                await this.dataLogRepository.save(dataLogEntity);

                return { message: 'Restoration OK' };
            }

            case ChangeTypeEnum.MODIFY_PASSWORD: {
                const password = await this.passwordRepository.findOne({ id: log.passwordId });
                const oldPassword = password;
                const decryptedPassword = CryptoAES.decrypt(log.oldPassword, log.hashedValue).toString(CryptoENC);
                password.url = log.oldUrl;
                password.description = log.oldDescription;
                password.username = log.oldUsername;
                password.password = CryptoAES.encrypt(decryptedPassword, user.password).toString();

                await this.passwordRepository.save(password);

                const dataLogEntity = this.buildLogEntity(
                    new Date(),
                    log.passwordId,
                    user,
                    user.password,
                    ChangeTypeEnum.RESTORE_STATE,
                    log.newUrl,
                    log.oldUrl,
                    log.newDescription,
                    log.oldDescription,
                    log.newUsername,
                    log.oldUsername,
                    log.newPassword,
                    oldPassword.password
                );

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

        const dataLogEntity = this.buildLogEntity(
            new Date(),
            savedPassword.id,
            user,
            user.password,
            ChangeTypeEnum.MODIFY_PASSWORD,
            toUpdate.url,
            savedPassword.url,
            toUpdate.description,
            savedPassword.description,
            toUpdate.username,
            savedPassword.username,
            toUpdate.password,
            passwordEntity.password
        );

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

        const dataLogEntity = this.buildLogEntity(
            new Date(),
            savedPassword.id,
            user,
            user.password,
            ChangeTypeEnum.ADD_PASSWORD,
            '',
            savedPassword.url,
            '',
            savedPassword.description,
            '',
            savedPassword.username,
            '',
            passwordEntity.password
        );

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

    private buildLogEntity(
        date, passwordId, user, hashedValue, type, oldUrl, newUrl, oldDescription, newDescription, oldUsername, newUsername, oldPassword, newPassword
    ) {
        const logEntity = new DataLogEntity();
        logEntity.date = date;
        logEntity.passwordId = passwordId;
        logEntity.user = user;
        logEntity.hashedValue = user.password;
        logEntity.hashedValue = hashedValue;
        logEntity.type = type;
        logEntity.oldUrl = oldUrl;
        logEntity.newUrl = newUrl;
        logEntity.oldDescription = oldDescription;
        logEntity.newDescription = newDescription;
        logEntity.oldUsername = oldUsername;
        logEntity.newUsername = newUsername;
        logEntity.oldPassword = oldPassword;
        logEntity.newPassword = newPassword;
        return logEntity;
    }

}
