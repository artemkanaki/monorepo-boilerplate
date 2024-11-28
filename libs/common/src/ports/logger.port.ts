export interface ILoggerPort {
  debug(message: string, ...meta: any[]): void;
  log(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  error(message: string, error: Error, ...meta: any[]): void;
  critical(message: string, error: Error, ...meta: any[]): void;
}
