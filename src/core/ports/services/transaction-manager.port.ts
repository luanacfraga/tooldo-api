export interface TransactionManager {
  execute<T>(fn: (tx: unknown) => Promise<T>): Promise<T>;
}
