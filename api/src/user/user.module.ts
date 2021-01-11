import { forwardRef, MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';
import { AuthMiddleware } from './auth.middleware';
import { PasswordsModule } from '../passwords/passwords.module';
import { PasswordEntity } from '../passwords/password.entity';
import { AddressEntity } from './address.entity';
import { DataLogEntity } from '../passwords/dataLog.entity';

@Module({
  providers: [UserService],
  controllers: [
    UserController
  ],
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity]), TypeOrmModule.forFeature([PasswordEntity, DataLogEntity]), forwardRef(() => PasswordsModule)],
  exports: [UserService]
})
export class UserModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: 'user', method: RequestMethod.GET }, { path: 'user', method: RequestMethod.PUT });
  }
}
