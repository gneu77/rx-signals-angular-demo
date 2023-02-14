import { getDerivedId, getEventId, getStateId, Store } from '@rx-signals/store';
import { ActivatedRoute, ActivatedRouteSnapshot } from '@angular/router';
import { filter, map } from 'rxjs';
import { isNotNullish } from '../../utils/type-guards';

export const activatedRouteEvent = getEventId<ActivatedRoute>();
export const currentRouteState = getDerivedId<ActivatedRouteSnapshot>();

const activatedRouteState = getStateId<ActivatedRoute | null>();

export const setupNavigationSignals = (store: Store) => {
  store.addState(activatedRouteState, null);
  store.addReducer(activatedRouteState, activatedRouteEvent, (_, e) => e);
  store.addDerivedState(
    currentRouteState,
    store.getBehavior(activatedRouteState).pipe(
      filter(isNotNullish),
      map(r => r.snapshot),
    ),
  );
};
