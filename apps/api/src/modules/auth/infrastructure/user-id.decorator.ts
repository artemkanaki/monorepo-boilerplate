import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ContextService } from '@lib/context';

export const UserId = createParamDecorator((_field: never, _ctx: ExecutionContext) => {
  return ContextService.getUserId();
});
