import { KycStatus } from '../../interfaces';
import { EnumVo } from '@lib/ddd';

export class KycStatusVo extends EnumVo<KycStatus> {
  constructor(status: KycStatus) {
    super(status, KycStatus);
  }
}
