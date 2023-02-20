import {
  EffectCompletedSuccess,
  getEffectId,
  getEntityEditSignalsFactory,
  getStateId,
  ModelWithDefault,
  NO_VALUE,
  Store,
} from '@rx-signals/store';
import { Book, bookDefaultModel } from '../model/book.model';
import { currentRouteState } from '../../navigation/signals/navigation.signals';
import { filter, map, switchMap, take } from 'rxjs';
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
  .addEffectId('afterSaveSuccess', () =>
    getEffectId<EffectCompletedSuccess<ModelWithDefault<Book>, number>, void>(),
  ) // adding id for an after-save-success effect
  .extendSetup((store, _, output, _2, effects) => {
    // connecting the result-completed-success event with the after-save-success effect:
    const internalStateId = getStateId<void>();
    store.connectObservable(
      store.getEffect(effects.afterSaveSuccess).pipe(
        take(1),
        switchMap(eff =>
          store
            .getEventStream(output.edit.resultCompletedSuccesses)
            .pipe(switchMap(successEvent => eff(successEvent, store, NO_VALUE, NO_VALUE))),
        ),
      ),
      internalStateId,
    );
  })
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
