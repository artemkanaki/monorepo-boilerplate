import { EmailVo } from '@lib/ddd';
import { IVerifyEmailPayload } from '../../interfaces';

export interface IVerifyEmailProps {
  email: string;
  code: string;
}

export class VerifyEmailCommand implements IVerifyEmailPayload {
  constructor(props: IVerifyEmailProps) {
    this.email = new EmailVo(props.email);
    this.code = props.code;
  }

  public readonly email: EmailVo;
  public readonly code: string;
}
