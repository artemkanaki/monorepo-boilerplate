import { KycStatus } from '../../interfaces';
import { IdVo } from '@lib/ddd';

interface IChangeKycStatusProps {
  userId: IdVo;
  kycStatus: KycStatus;
}

export class ChangeKycStatusCommand {
  constructor(props: IChangeKycStatusProps) {
    this.userId = props.userId;
    this.kycStatus = props.kycStatus;
  }

  public readonly userId: IdVo;
  public readonly kycStatus: KycStatus;
}
