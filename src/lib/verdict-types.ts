export type ParsedRows<T> = {
  rows: T[];
  rejected: number;
  duplicates: number;
  reasons: string[];
};
