import { DateVo, IdVo } from '../value-objects';

export abstract class DomainEvent {
  public abstract readonly aggregateId: IdVo;

  public readonly dateOccurred = DateVo.now();

  public getName(): string {
    return this.constructor.name;
  }
}
