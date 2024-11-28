import { Module } from '@nestjs/common';
import { EmailVerificationService, UserRepository } from './infrustructure';
import { EMAIL_VERIFICATION_ADAPTER, USER_REPOSITORY, USER_SERVICE } from './user.di';
import { AuthController } from './api';
import { UserOrmEntity } from './infrustructure/db/user.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './domain/user.service';
import { AuthControllerService } from './api/auth.controller-service';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    {
      useClass: EmailVerificationService,
      provide: EMAIL_VERIFICATION_ADAPTER,
    },
    {
      useClass: UserRepository,
      provide: USER_REPOSITORY,
    },
    {
      useClass: UserService,
      provide: USER_SERVICE,
    },
    AuthControllerService,
  ],
  controllers: [AuthController],
})
export class UserModule {}
