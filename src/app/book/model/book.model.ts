import { ModelValidationResult, ModelWithDefault, NoValueType, toGetter } from '@rx-signals/store';

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

// https://regex101.com/library/B7IVw2
const isbnRegex =
  /^(?:ISBN(?:-13)?:? )?(?<gs1>\d{3})(?:(?<number>\d{9})|(?=[\d -]{14}$)[ -](?<registrationGroup>\d{1,5})[ -](?<registrant>\d{1,7})[ -](?<publication>\d{1,6})[ -])(?<checkDigit>\d)$/gm;

export const validateBook = (
  m: ModelWithDefault<Book>,
  prevInput: NoValueType | ModelWithDefault<Book>,
  prevResult: NoValueType | ModelValidationResult<Book>,
  idOfBookWithSameName?: number,
): ModelValidationResult<Book> => ({
  name:
    toGetter(prevInput)('model')('name').get() === m.model.name
      ? toGetter(prevResult)('name').get() // same name as in previous validation => same result
      : m.model.name.trim() === ''
      ? 'Name is mandatory'
      : idOfBookWithSameName && idOfBookWithSameName !== m.model.id
      ? 'A book with this name already exists'
      : null,
  isbn:
    !!m.model.isbn && m.model.isbn.match(isbnRegex) === null
      ? 'No recognized ISBN-13 format'
      : null,
});
