import { isObject } from './is-object';

function convertToRaw(item: unknown): unknown {
  // avoid direct usage of ValueObject and DomainEntity classes to prevent circular dependencies
  if (isObject(item) && 'toObject' in item && typeof item.toObject === 'function') {
    return item.toObject();
  }

  return item;
}

/**
 * Converts Entity/Value Objects props to a plain object.
 * Useful for testing and debugging.
 * @param props
 */
export function convertPropsToObject(props: object): object {
  const propsCopy: Record<string, unknown> = { ...props };

  for (const prop in propsCopy) {
    if (Array.isArray(propsCopy[prop])) {
      propsCopy[prop] = (propsCopy[prop] as unknown[]).map((item) => {
        return convertToRaw(item);
      });
    }

    propsCopy[prop] = convertToRaw(propsCopy[prop]);
  }

  return propsCopy;
}
