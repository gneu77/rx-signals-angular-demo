import {
  Effect,
  EffectResult,
  isCompletedResultEventInErrorState,
  isNotEffectError,
  ModelValidationResult,
  ModelWithDefault,
  Store,
  toEffectError,
} from '@rx-signals/store';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  Book,
  bookDefaultModel,
  bookWithDefaultNameLens,
  PersistedBook,
  validateBook,
} from '../model/book.model';
import { catchError, delay, filter, map, merge, Observable, of, startWith, switchMap } from 'rxjs';
import { booklistSearchEffectId, QueryInput } from '../signals/booklist-search.signals';
import { bookEditEffectIds, bookEditOutputSignals } from '../signals/book-edit.signals';
import { Location } from '@angular/common';

const baseUrl = '/api/books';

const getBooklistSearchEffect =
  (httpClient: HttpClient): Effect<QueryInput, PersistedBook[], string> =>
  query =>
    httpClient
      .get<EffectResult<PersistedBook[], string>>(
        baseUrl,
        query ? { params: { q: query } } : undefined,
      )
      .pipe(catchError(error => of(toEffectError(`could not load books: ${error.message}`))));

const getLoadBookEffect =
  (httpClient: HttpClient): Effect<{ id: number } | null, Book, string> =>
  input =>
    input?.id
      ? httpClient
          .get<PersistedBook>(`${baseUrl}/${input.id}`)
          .pipe(
            catchError(error =>
              of(toEffectError(`could not load book with id ${input.id}: ${error.message}`)),
            ),
          )
      : of(bookDefaultModel);

const getBookSaveEffect =
  (httpClient: HttpClient): Effect<Book, number, string> =>
  book =>
    ('id' in book
      ? httpClient.put<PersistedBook>(`${baseUrl}/${book.id}`, book)
      : httpClient.post<PersistedBook>(baseUrl, book)
    ).pipe(
      map(book => book.id),
      catchError(error => of(toEffectError(`could not save book: ${error.message}`))),
    );

const getBookIdByName = (httpClient: HttpClient, name: string): Observable<number | undefined> =>
  httpClient.get<PersistedBook[]>(baseUrl, { params: { name } }).pipe(map(books => books?.[0]?.id));

// We apply two-phase validation:
//   1.) initial validation result without delay, but also without uniqueness-check
//   2.) if necessary (name changed and name not empty), we apply a debounced uniqueness-check against the backend
const getBookValidationEffect =
  (httpClient: HttpClient): Effect<ModelWithDefault<Book>, ModelValidationResult<Book>, string> =>
  (bookWithDefault, { previousInput, previousResult }) =>
    of(null).pipe(
      delay(500), // debouncing the backend validation
      filter(() => bookWithDefault.model.name.trim() !== ''),
      filter(
        // no need to check uniqueness, if name matches name of loaded model
        () =>
          bookWithDefault.model.id === undefined ||
          bookWithDefault.model.name !== bookWithDefault.default.name,
      ),
      filter(() => bookWithDefaultNameLens.get(previousInput) !== bookWithDefault.model.name), // no need to check uniqueness, if name has not changed
      switchMap(() =>
        getBookIdByName(httpClient, bookWithDefault.model.name).pipe(
          map(id => validateBook(bookWithDefault, previousInput, previousResult, id)), // validate with uniqueness-check
        ),
      ),
      catchError(error => of(toEffectError(`could not validate book-name: ${error.message}`))),
      startWith(validateBook(bookWithDefault, previousInput, previousResult)), // initial validation without waiting for backend
    );

export const setupBookEffects = (store: Store) => {
  const httpClient = inject(HttpClient);
  const location = inject(Location);

  store.addEffect(booklistSearchEffectId, getBooklistSearchEffect(httpClient));
  store.addEffect(bookEditEffectIds.load, getLoadBookEffect(httpClient));
  store.addEffect(bookEditEffectIds.validation, getBookValidationEffect(httpClient));
  store.addEffect(bookEditEffectIds.save, getBookSaveEffect(httpClient));

  store
    .getEventStream(bookEditOutputSignals.edit.completedResults)
    .pipe(
      map(e => e.result),
      filter(isNotEffectError),
    )
    .subscribe(() => {
      location.back();
      return of(undefined);
    });
  merge(
    store
      .getEventStream(bookEditOutputSignals.load.completedResults)
      .pipe(filter(isCompletedResultEventInErrorState)),
    store
      .getEventStream(bookEditOutputSignals.edit.validationCompletedResults)
      .pipe(filter(isCompletedResultEventInErrorState)),
    store
      .getEventStream(bookEditOutputSignals.edit.completedResults)
      .pipe(filter(isCompletedResultEventInErrorState)),
  ).subscribe(e => alert(e.result.error));
};
