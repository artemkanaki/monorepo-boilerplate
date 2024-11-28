export type Primitives = string | number | boolean;

export interface Constructable<T> {
  new (...args: Array<any>): T;
}
