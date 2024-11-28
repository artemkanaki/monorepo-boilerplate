import {
  DomainEvent,
  IdVo,
} from '@lib/ddd';

export class KycApprovedEvent extends DomainEvent {
  constructor(public readonly aggregateId: IdVo) {
    super();
  }
}
