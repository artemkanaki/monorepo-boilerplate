import { EmailVo } from '@lib/ddd';

export interface ISendEmailVerificationRequestProps {
  email: string;
}

export class SendEmailVerificationRequestCommand {
  constructor(props: ISendEmailVerificationRequestProps) {
    this.email = new EmailVo(props.email);
  }

  public readonly email: EmailVo;
}
