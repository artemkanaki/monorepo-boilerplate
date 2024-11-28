import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY, USER_SERVICE } from '../user.di';
import {
  IUserRepositoryPort,
  IUserService,
} from '../interfaces';
import {
  ChangeKycStatusCommand,
  CreateUserCommand,
  GetCurrentUserCommand,
  SendEmailVerificationRequestCommand,
  SignInCommand,
  SignOutCommand,
  VerifyEmailCommand,
} from './commands-queries';
import { AuthService } from '../../auth';

@Injectable()
export class AuthControllerService {
  constructor(
    @Inject(USER_SERVICE) private readonly userService: IUserService,
    @Inject(USER_REPOSITORY) private readonly userRepo: IUserRepositoryPort,
    private readonly authService: AuthService,
  ) {}

  public async sendEmailVerificationRequest(command: SendEmailVerificationRequestCommand) {
    return this.userService.sendEmailVerificationRequest(command.email);
  }

  public async verifyEmail(command: VerifyEmailCommand) {
    return this.userService.verifyEmail(command);
  }

  public async createUser(command: CreateUserCommand) {
    return this.userService.createUser(command);
  }

  public async signIn(command: SignInCommand) {
    const user = await this.userRepo.findOneOrThrow({ email: command.email });

    this.authService.setAuthToken(command.response, user.id);

    return user;
  }

  public async getCurrentUser(command: GetCurrentUserCommand) {
    return this.userRepo.findOneOrThrow({ id: command.userId });
  }

  public async signOut(command: SignOutCommand) {
    this.authService.clearAuthToken(command.response);
  }

  public async changeKycStatus(command: ChangeKycStatusCommand) {
    const user = await this.userRepo.findOneByIdOrThrow(command.userId);

    user.setKycStatus(command.kycStatus);

    await this.userRepo.save(user);
  }
}
