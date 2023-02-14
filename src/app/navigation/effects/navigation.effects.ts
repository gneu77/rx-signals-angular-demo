import { Store } from '@rx-signals/store';
import { activatedRouteEvent } from '../signals/navigation.signals';
import { inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

const getActivatedChildRoute = (route: ActivatedRoute): ActivatedRoute =>
  route.firstChild ? getActivatedChildRoute(route.firstChild) : route;

export const setupNavigationEffects = (store: Store) => {
  const router = inject(Router);
  store.addEventSource(
    activatedRouteEvent,
    router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => getActivatedChildRoute(router.routerState.root)),
    ),
  );
};
