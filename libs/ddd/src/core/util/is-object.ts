import BigNumber from 'bignumber.js';

export const isObject = (item: unknown): item is object => {
  return item === Object(item) && !Array.isArray(item) && !(item instanceof BigNumber);
};
