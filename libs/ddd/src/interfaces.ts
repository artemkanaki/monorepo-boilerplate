export interface Constructable<T> {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  new (...args: any[]): T;
}
