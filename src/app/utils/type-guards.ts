export const isNotNullish = <T>(value: T): value is NonNullable<T> => (value ?? null) !== null;
export const isNumber = (value: any): value is number =>
  (value ?? null) !== null && typeof value === 'number' && isFinite(value);
