import { EmailVo } from '@lib/ddd';
import { ICreateUserPayload } from '../../interfaces';

export interface ICreateUserProps {
  email: string;
  password: string;
}

export class CreateUserCommand implements ICreateUserPayload {
  constructor(props: ICreateUserProps) {
    this.email = new EmailVo(props.email);
    this.password = props.password;
  }

  public readonly email: EmailVo;
  public readonly password: string;
}
