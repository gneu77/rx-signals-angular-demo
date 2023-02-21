import { Effect, ModelValidationResult, ModelWithDefault, Store } from '@rx-signals/store';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Book,
  bookDefaultModel,
  bookWithDefaultNameLens,
  PersistedBook,
  validateBook,
} from '../model/book.model';
import { delay, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import {
  booklistSearchEffectId,
  booklistSearchOutputSignals,
  QueryInput,
} from '../signals/booklist-search.signals';
import { bookEditEffectIds, bookEditOutputSignals } from '../signals/book-edit.signals';
import { Location } from '@angular/common';
import { handleErrors } from '../../utils/error-handler';

const baseUrl = '/api/books';

const getBooklistSearchEffect =
  (httpClient: HttpClient): Effect<QueryInput, PersistedBook[]> =>
  query =>
    httpClient.get<PersistedBook[]>(baseUrl, query ? { params: { q: query } } : undefined);

const getLoadBookEffect =
  (httpClient: HttpClient): Effect<{ id: number } | null, Book> =>
  input =>
    input?.id ? httpClient.get<PersistedBook>(`${baseUrl}/${input.id}`) : of(bookDefaultModel);

const getBookSaveEffect =
  (httpClient: HttpClient): Effect<Book, number> =>
  book =>
    ('id' in book
      ? httpClient.put<PersistedBook>(`${baseUrl}/${book.id}`, book)
      : httpClient.post<PersistedBook>(baseUrl, book)
    ).pipe(map(book => book.id));

const getBookIdByName = (httpClient: HttpClient, name: string): Observable<number | undefined> =>
  httpClient.get<PersistedBook[]>(baseUrl, { params: { name } }).pipe(map(books => books?.[0]?.id));

// We apply two-phase validation:
//   1.) initial validation result without delay, but also without uniqueness-check
//   2.) if necessary (name changed and name not empty), we apply a debounced uniqueness-check against the backend
const getBookValidationEffect =
  (httpClient: HttpClient): Effect<ModelWithDefault<Book>, ModelValidationResult<Book>> =>
  (bookWithDefault, _, prevInput, prevResult) =>
    of(null).pipe(
      delay(500), // debouncing the backend validation
      filter(() => bookWithDefault.model.name.trim() !== ''),
      filter(
        // no need to check uniqueness, if name matches name of loaded model
        () =>
          bookWithDefault.model.id === undefined ||
          bookWithDefault.model.name !== bookWithDefault.default.name,
      ),
      filter(() => bookWithDefaultNameLens.get(prevInput) !== bookWithDefault.model.name), // no need to check uniqueness, if name has not changed
      switchMap(() =>
        getBookIdByName(httpClient, bookWithDefault.model.name).pipe(
          map(id => validateBook(bookWithDefault, prevInput, prevResult, id)), // validate with uniqueness-check
        ),
      ),
      startWith(validateBook(bookWithDefault, prevInput, prevResult)), // initial validation without waiting for backend
    );

export const setupBookEffects = (store: Store) => {
  const httpClient = inject(HttpClient);
  const location = inject(Location);

  store.addEffect(booklistSearchEffectId, getBooklistSearchEffect(httpClient));
  handleErrors(
    store.getEventStream(booklistSearchOutputSignals.errors),
    () => 'could not load books',
  );

  store.addEffect(bookEditEffectIds.load, getLoadBookEffect(httpClient));
  handleErrors(
    store.getEventStream(bookEditOutputSignals.load.errors),
    id => `could not load book with id ${id}`,
  );

  store.addEffect(bookEditEffectIds.validation, getBookValidationEffect(httpClient));

  store.addEffect(bookEditEffectIds.save, getBookSaveEffect(httpClient));
  handleErrors(
    store.getEventStream(bookEditOutputSignals.edit.resultErrors),
    () => 'could not save book',
  );

  store.addEffect(bookEditEffectIds.afterSaveSuccess, () => {
    location.back();
    return of(undefined);
  });
};
