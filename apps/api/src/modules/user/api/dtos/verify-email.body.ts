import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailBody {
  @IsEmail()
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user account',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'A code sent to the user email',
  })
  code: string;
}
