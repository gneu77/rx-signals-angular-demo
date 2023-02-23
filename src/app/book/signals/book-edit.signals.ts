import { getEntityEditSignalsFactory, Store } from '@rx-signals/store';
import { Book, bookDefaultModel } from '../model/book.model';
import { currentRouteState } from '../../navigation/signals/navigation.signals';
import { filter, map } from 'rxjs';
import { invalidateBooksEvent } from './invalidate-books.event';

const signals = getEntityEditSignalsFactory<Book, { id: number }, number>()
  .connectObservable(
    ({ store }) =>
      store.getBehavior(currentRouteState).pipe(
        filter(snapshot => snapshot.data['isBookNew'] || snapshot.data['isBookEdit']),
        map(snapshot => (snapshot.data['isBookEdit'] ? parseInt(snapshot.params['id'], 10) : null)),
        map(id => (id ? { id } : null)),
      ),
    'load',
    true,
  ) // retrieving the ID param from editBook route and connecting it to the load-effect input
  .build({
    defaultEntity: bookDefaultModel,
    onSaveCompletedEvent: invalidateBooksEvent,
  });

export const bookEditInputSignals = signals.input;
export const bookEditOutputSignals = signals.output;
export const bookEditEffectIds = signals.effects;

export const setupBookEditSignals = (store: Store) => {
  signals.setup(store);
};
