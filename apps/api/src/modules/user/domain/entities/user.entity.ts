import {
  ArgumentMissingError,
  DomainAggregate,
  DomainEntityConstructorProps,
  DomainEntityProps,
  EmailVo,
} from '@lib/ddd';
import { IEmailVerificationPort, IUser, KycStatus } from '../../interfaces';
import { KycStatusVo } from '../value-objects';
import { KycApprovedEvent } from '../events';

export interface IUserProps extends DomainEntityProps {
  email: EmailVo;
  kycStatus: KycStatusVo;
}

export interface IUserConstructorProps extends DomainEntityProps {
  email: EmailVo;
  kycStatus: KycStatus;
}

export class UserEntity extends DomainAggregate<IUserProps> implements IUser {
  constructor(props: DomainEntityConstructorProps<IUserConstructorProps>) {
    super({
      ...props,
      kycStatus: new KycStatusVo(props.kycStatus),
    });
  }

  get email(): EmailVo {
    return this.props.email;
  }

  get kycStatus(): KycStatus {
    return this.props.kycStatus.value;
  }

  public static create(email: EmailVo) {
    return new UserEntity({
      email,
      kycStatus: KycStatus.PENDING,
    });
  }

  public async sendEmailVerification(verificationService: IEmailVerificationPort) {
    await verificationService.sendEmailVerification(this.props.email);
  }

  public setKycStatus(status: KycStatus) {
    this.props.kycStatus = new KycStatusVo(status);

    if (status === KycStatus.APPROVED) {
      this.addEvent(new KycApprovedEvent(this.id));
    }
  }

  protected validate(props: IUserProps) {
    if (!props.email) {
      throw new ArgumentMissingError('Email is required');
    }
    if (!props.kycStatus) {
      throw new ArgumentMissingError('KYC status is required');
    }
  }
}
