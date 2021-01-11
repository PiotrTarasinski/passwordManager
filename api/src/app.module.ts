import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { PasswordsModule } from './passwords/passwords.module';
import { PasswordController } from './passwords/password.controller';
import { SessionModule } from 'nestjs-session';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    SessionModule.forRoot({
      session: { secret: 'someveryelaboratesecretkey' },
    }),
    UserModule,
    PasswordsModule
  ],
  controllers: [
    AppController,
    PasswordController,
  ],
  providers: []
})
export class ApplicationModule {
  constructor(private readonly connection: Connection) { }
}
