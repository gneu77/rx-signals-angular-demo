import { Store } from '@rx-signals/store';
import { setupBooklistSearchSignals } from './booklist-search.signals';
import { setupBookEditSignals } from './book-edit.signals';

export const setupBookSignals = (store: Store) => {
  setupBooklistSearchSignals(store);
  setupBookEditSignals(store);
};
