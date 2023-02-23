export const isNotNullish = <T>(value: T): value is NonNullable<T> => (value ?? null) !== null;
