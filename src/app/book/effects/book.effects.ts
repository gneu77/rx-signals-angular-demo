import { Effect, ModelValidationResult, Store } from '@rx-signals/store';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Book, bookDefaultModel, PersistedBook } from '../model/book.model';
import { map, of } from 'rxjs';
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

const getEditBookEffect =
  (httpClient: HttpClient): Effect<number | null, Book> =>
  id =>
    id ? httpClient.get<PersistedBook>(`${baseUrl}/${id}`) : of(bookDefaultModel);

const getBookSaveEffect =
  (httpClient: HttpClient): Effect<Book, number> =>
  book =>
    ('id' in book
      ? httpClient.put<PersistedBook>(`${baseUrl}/${book.id}`, book)
      : httpClient.post<PersistedBook>(baseUrl, book)
    ).pipe(map(book => book.id));

const getBookValidationEffect = (): Effect<Book, ModelValidationResult<Book>> => book =>
  book.name.trim() ? of(null) : of({ name: 'Name is mandatory' });

export const setupBookEffects = (store: Store) => {
  const httpClient = inject(HttpClient);
  const location = inject(Location);

  store.addEffect(booklistSearchEffectId, getBooklistSearchEffect(httpClient));
  handleErrors(
    store.getEventStream(booklistSearchOutputSignals.errors),
    () => 'could not load books',
  );

  store.addEffect(bookEditEffectIds.load, getEditBookEffect(httpClient));
  handleErrors(
    store.getEventStream(bookEditOutputSignals.load.errors),
    id => `could not load book with id ${id}`,
  );

  store.addEffect(bookEditEffectIds.validation, getBookValidationEffect());

  store.addEffect(bookEditEffectIds.result, getBookSaveEffect(httpClient));
  handleErrors(
    store.getEventStream(bookEditOutputSignals.edit.resultErrors),
    () => 'could not save book',
  );

  store.getEventStream(bookEditOutputSignals.edit.resultSuccesses).subscribe(result => {
    if (result.result) {
      location.back();
    }
  });
};
