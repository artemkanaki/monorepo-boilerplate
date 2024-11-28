import { IdVo } from '@lib/ddd';

export interface IGetCurrentUserProps {
  userId: IdVo;
}

export class GetCurrentUserCommand {
  constructor(props: IGetCurrentUserProps) {
    this.userId = props.userId;
  }

  public readonly userId: IdVo;
}
