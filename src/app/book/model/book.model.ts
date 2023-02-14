export type Book = {
  id?: number;
  name: string;
  isbn?: string;
};

export type PersistedBook = Book & {
  id: number;
};

export const bookDefaultModel: Book = {
  name: '',
};
