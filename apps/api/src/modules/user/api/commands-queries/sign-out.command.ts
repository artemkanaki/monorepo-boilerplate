import { IdVo } from '@lib/ddd';
import { Response } from 'express';

export interface ISignOutProps {
  userId: IdVo;
  response: Response;
}

export class SignOutCommand {
  constructor(props: ISignOutProps) {
    this.userId = props.userId;
    this.response = props.response;
  }

  public readonly userId: IdVo;
  public readonly response: Response;
}
