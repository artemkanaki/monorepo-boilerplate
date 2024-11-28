# Context

The context module provides a way to share data between components without having to pass it explicitly through the
component tree.

## Usage

### Creating a context using decorator

To create a context, build-in decorator can be used. Apply it to method. For example, it can be a rabbit mq consumer or
any method that requires some shared data.

```ts
import { ContextService } from '@libs/context';

export class SomeService {
  @ContextService.Wrap()
  public async someMethod() {
    const context = ContextService.getCurrentContext(); // returns current context IContext

    conslole.log(context.id); // prints context id
  }
}
```

### Creating a context inside a method

To create a context inside a method, use `ContextService.runInContext` method. It will create a new context, and it will
be available inside a handler

```ts
import { ContextService } from '@libs/context';

export class SomeService {
  public async someMethod() {
    await ContextService.runInContext(async () => {
      const context = ContextService.getCurrentContext(); // returns current context IContext

      conslole.log(context.id); // prints context id
    });
  }
}
```

