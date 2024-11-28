import { IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailVerificationRequestBody {
  @IsEmail()
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user account',
  })
  email: string;
}
