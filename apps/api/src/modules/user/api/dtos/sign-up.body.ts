import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpBody {
  @IsEmail()
  @ApiProperty({
    example: 'test@example.com',
    description: 'The email of the user account',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'password',
    description: 'The password of the user account',
  })
  password: string;
}
