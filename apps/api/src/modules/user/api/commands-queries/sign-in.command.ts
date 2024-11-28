import { EmailVo } from '@lib/ddd';
import { Response } from 'express';

export interface ISignInProps {
  email: string;
  password: string;
  response: Response;
}

export class SignInCommand {
  constructor(props: ISignInProps) {
    this.email = new EmailVo(props.email);
    this.password = props.password;
    this.response = props.response;
  }

  public readonly email: EmailVo;
  public readonly password: string;
  public readonly response: Response;
}
