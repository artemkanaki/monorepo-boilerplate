import { AsyncLocalStorage } from 'async_hooks';
import { EntityManager } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import { ContextMissingError } from './context-missing.error';
import { TransactionOverrideError } from './transaction-override.error';
import { IdVo } from '@lib/ddd';

interface IContext {
  id: string;
  path?: string;
  pathMask?: string;
  method?: string;
  ip?: string;
  controllerName?: string;
  handlerName?: string;
  transactionManager?: EntityManager;
  userId?: IdVo;
}

export class ContextService {
  private static context = new AsyncLocalStorage<IContext>();

  public static Wrap(): MethodDecorator {
    return (_target: unknown, _propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
      const originalMethod = descriptor.value;

      descriptor.value = function (...args: unknown[]) {
        return ContextService.context.run(
          {
            id: uuidV4(),
            transactionManager: undefined,
          },
          () => {
            return originalMethod.apply(this, args);
          },
        );
      };

      return descriptor;
    };
  }

  public static runInContext<T>(fn: () => T, context: Partial<IContext> = {}): T {
    return ContextService.context.run(
      {
        id: uuidV4(),
        transactionManager: undefined,
        ...context,
      },
      fn,
    );
  }

  public static getCurrentContext(): IContext | undefined {
    return ContextService.context.getStore();
  }

  public static getContextId(): string | undefined {
    return ContextService.getCurrentContext()?.id;
  }

  public static hasContext(): boolean {
    return !!ContextService.getCurrentContext();
  }

  public static setTransactionManager(transactionManager: EntityManager): void {
    const context = ContextService.getCurrentContext();
    if (!context || !context.id) {
      throw new ContextMissingError('Cannot set transaction manager');
    }
    if (context.transactionManager) {
      throw new TransactionOverrideError();
    }

    context.transactionManager = transactionManager;
  }

  public static getTransactionManager(): EntityManager | undefined {
    const context = ContextService.getCurrentContext();

    if (!context || !context.id) {
      throw new ContextMissingError('Cannot get transaction manager');
    }

    return context?.transactionManager;
  }

  public static clearTransactionManager(): void {
    const context = ContextService.getCurrentContext();

    if (!context || !context.id) {
      throw new ContextMissingError('Cannot clear transaction manager');
    }

    context.transactionManager = undefined;
  }

  public static setControllerName(controllerName: string): void {
    const context = ContextService.getCurrentContext();
    if (!context || !context.id) {
      throw new ContextMissingError('Cannot set controller name');
    }

    context.controllerName = controllerName;
  }

  public static setHandlerName(handlerName: string): void {
    const context = ContextService.getCurrentContext();
    if (!context || !context.id) {
      throw new ContextMissingError('Cannot set handler name');
    }

    context.handlerName = handlerName;
  }

  public static setUserId(userId: IdVo): void {
    const context = ContextService.getCurrentContext();
    if (!context || !context.id) {
      throw new ContextMissingError('Cannot set user id');
    }

    context.userId = userId;
  }

  public static getUserId(): IdVo | undefined {
    const context = ContextService.getCurrentContext();
    if (!context || !context.id) {
      throw new ContextMissingError('Cannot get user id');
    }

    return context.userId;
  }

  public static getRaw(): Record<string, string | number | boolean | null> {
    const context = ContextService.getCurrentContext();

    return {
      contextId: context?.id ?? null,
      path: context?.path ?? null,
      method: context?.method ?? null,
      ip: context?.ip ?? null,
      controllerName: context?.controllerName ?? null,
      handlerName: context?.handlerName ?? null,
      inTransaction: !!context?.transactionManager,
    };
  }
}
