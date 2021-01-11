import { DataLogEntity } from './dataLog.entity';
import { AddressEntity } from './../user/address.entity';
import { UserEntity } from './../user/user.entity';
import { AuthMiddleware } from './../user/auth.middleware';
import { PasswordController } from './password.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordEntity, SharedPasswordEntity } from './password.entity';
import { UserModule } from './../user/user.module';
import { Module, MiddlewareConsumer, RequestMethod, forwardRef } from '@nestjs/common';
import { PasswordService } from './password.service';

@Module({
    providers: [PasswordService],
    controllers: [
        PasswordController
    ],
    exports: [PasswordService],
    imports: [TypeOrmModule.forFeature([SharedPasswordEntity, PasswordEntity, UserEntity, AddressEntity, DataLogEntity]), forwardRef(() => UserModule)]
})
export class PasswordsModule {
    public configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes({ path: 'password', method: RequestMethod.GET }, { path: 'password/update', method: RequestMethod.POST }, { path: 'password/create', method: RequestMethod.POST }, { path: 'password/get/*', method: RequestMethod.GET }, { path: 'password/passwordLog/*', method: RequestMethod.GET }, { path: 'password/passwordLog', method: RequestMethod.GET }, { path: 'password/delete/*', method: RequestMethod.DELETE }, { path: 'password/get/*', method: RequestMethod.GET }, { path: 'password/restore', method: RequestMethod.POST });
    }

}
