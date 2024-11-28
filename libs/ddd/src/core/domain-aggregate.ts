import { DomainEntity, DomainEntityProps } from './domain-entity';
import { DomainEvent } from './domain-event';

interface IEventEmitter {
  emitAsync(event: string, ...args: unknown[]): Promise<unknown>;
}

export abstract class DomainAggregate<EntityProps extends DomainEntityProps> extends DomainEntity<EntityProps> {
  private _domainEvents: DomainEvent[] = [];

  protected get domainEvents(): DomainEvent[] {
    return [...this._domainEvents];
  }

  public async publishEvents(eventEmitter: IEventEmitter): Promise<void> {
    await Promise.all(this.domainEvents.map((event) => eventEmitter.emitAsync(event.getName(), event)));

    this.clearEvents();
  }

  protected clearEvents(): void {
    this._domainEvents = [];
  }

  protected addEvent(domainEvent: DomainEvent): void {
    this._domainEvents.push(domainEvent);
  }
}
