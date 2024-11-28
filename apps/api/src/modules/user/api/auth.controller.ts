import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Response,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  SendEmailVerificationRequestBody,
  SignUpBody,
  VerifyEmailBody,
  UserResponseDto,
  SignInBody,
  ChangeKycStatusBody,
} from './dtos';
import { AuthControllerService } from './auth.controller-service';
import {
  ChangeKycStatusCommand,
  CreateUserCommand,
  GetCurrentUserCommand,
  SendEmailVerificationRequestCommand,
  SignInCommand,
  SignOutCommand,
  VerifyEmailCommand,
} from './commands-queries';
import { Response as ExpressResponse } from 'express';
import { AuthGuard, UserId } from '../../auth';
import { IdVo } from '@lib/ddd';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthControllerService) {}

  @Post('send-email-verification-request')
  @HttpCode(204)
  public async sendVerifyEmailRequest(@Body() body: SendEmailVerificationRequestBody) {
    const command = new SendEmailVerificationRequestCommand({
      email: body.email,
    });

    await this.service.sendEmailVerificationRequest(command);
  }

  @Post('verify-email')
  @HttpCode(204)
  async verifyEmail(@Body() body: VerifyEmailBody) {
    const command = new VerifyEmailCommand({
      email: body.email,
      code: body.code,
    });

    await this.service.verifyEmail(command);
  }

  @Post('sign-up')
  @HttpCode(201)
  async createUser(@Body() body: SignUpBody) {
    const command = new CreateUserCommand({
      email: body.email,
      password: body.password,
    });

    const user = await this.service.createUser(command);

    return new UserResponseDto(user);
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() body: SignInBody, @Response({ passthrough: true }) response: ExpressResponse) {
    const command = new SignInCommand({
      email: body.email,
      password: body.password,
      response,
    });

    const user = await this.service.signIn(command);

    return new UserResponseDto(user);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  public async getCurrentUser(@UserId() userId: IdVo) {
    const command = new GetCurrentUserCommand({
      userId,
    });

    const user = await this.service.getCurrentUser(command);

    return new UserResponseDto(user);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async signOut(@Response({ passthrough: true }) response: ExpressResponse, @UserId() userId: IdVo) {
    const command = new SignOutCommand({
      userId,
      response,
    });

    await this.service.signOut(command);
  }

  @Patch('kyc-status')
  @UseGuards(AuthGuard)
  @HttpCode(204)
  async changeKycStatus(@Body() body: ChangeKycStatusBody, @UserId() userId: IdVo) {
    const command = new ChangeKycStatusCommand({
      userId,
      kycStatus: body.kycStatus,
    });

    await this.service.changeKycStatus(command);
  }
}
