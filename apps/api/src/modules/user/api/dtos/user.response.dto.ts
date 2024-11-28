import { IUser } from '../../interfaces';

export class UserResponseDto {
  constructor(user: IUser) {
    this.id = user.id.value;
    this.email = user.email.value;
    this.kycStatus = user.kycStatus;
  }

  id: string;
  email: string;
  emailIsVerified: boolean;
  kycStatus: string;
}
