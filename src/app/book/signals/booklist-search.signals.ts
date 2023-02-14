import { getEffectSignalsFactory, getModelSignalsFactory, Store } from '@rx-signals/store';
import { PersistedBook } from '../model/book.model';
import { invalidateBooksEvent } from './invalidate-books.event';

export type QueryInput = string | null | undefined;

const signals = getModelSignalsFactory<QueryInput>()
  .renameInputId('set', 'query')
  .renameInputId('reset', 'resetQuery')
  .removeInputId('update')
  .compose(getEffectSignalsFactory<QueryInput, PersistedBook[]>())
  .connect('model', 'input', false)
  .renameInputId('invalidate', 'reload')
  .removeInputId('trigger')
  .connectId(invalidateBooksEvent, 'reload', true)
  .build({
    c1: {
      defaultModel: '',
    },
    c2: {
      effectDebounceTime: 300,
    },
  });

export const booklistSearchInputSignals = signals.input;
export const booklistSearchOutputSignals = signals.output;
export const booklistSearchEffectId = signals.effects.id;

export const setupBooklistSearchSignals = (store: Store) => {
  signals.setup(store);
};
