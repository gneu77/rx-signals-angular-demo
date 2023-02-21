import {
  EffectCompletedSuccess,
  getEntityEditSignalsFactory,
  getVoidEffectSignalsFactory,
  ModelWithDefault,
  Store,
} from '@rx-signals/store';
import { Book, bookDefaultModel } from '../model/book.model';
import { currentRouteState } from '../../navigation/signals/navigation.signals';
import { filter, map } from 'rxjs';
import { invalidateBooksEvent } from './invalidate-books.event';

const signals = getEntityEditSignalsFactory<Book, { id: number }, number>()
  .connectObservable(
    store =>
      store.getBehavior(currentRouteState).pipe(
        filter(snapshot => snapshot.data['isBookNew'] || snapshot.data['isBookEdit']),
        map(snapshot => (snapshot.data['isBookEdit'] ? parseInt(snapshot.params['id'], 10) : null)),
        map(id => (id ? { id } : null)),
      ),
    'load',
    false,
  ) // retrieving the ID param from editBook route and connecting it to the load-effect input
  .compose(getVoidEffectSignalsFactory<EffectCompletedSuccess<ModelWithDefault<Book>, number>>()) // for an effect we want to execute after successful save
  .renameEffectId('voidEffect', 'afterSaveSuccess')
  .connectObservable(
    (store, output) => store.getEventStream(output.edit.resultCompletedSuccesses),
    'inputEvent',
    false,
  ) // connecting the resultCompletedSuccess event with the input for our afterSaveSuccess effect
  .build({
    c1: {
      defaultEntity: bookDefaultModel,
      onSaveCompletedEvent: invalidateBooksEvent,
    },
    c2: {},
  });

export const bookEditInputSignals = signals.input;
export const bookEditOutputSignals = signals.output;
export const bookEditEffectIds = signals.effects;

export const setupBookEditSignals = (store: Store) => {
  signals.setup(store);
};
