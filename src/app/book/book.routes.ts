import { Routes } from '@angular/router';
import { provideStore } from '@rx-signals/angular-provider';
import { setupBookEffects } from './effects/book.effects';
import { setupBookSignals } from './signals/book.signals';

export const bookRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/booklist/booklist.component').then(c => c.BooklistComponent),
      },
      {
        path: 'new',
        loadComponent: () =>
          import('./components/book-edit/book-edit.component').then(c => c.BookEditComponent),
        data: {
          modal: true,
          isBookNew: true,
        },
      },
      {
        path: ':id',
        loadComponent: () =>
          import('./components/book-edit/book-edit.component').then(c => c.BookEditComponent),
        data: {
          modal: true,
          isBookEdit: true,
        },
      },
    ],
    providers: [provideStore(setupBookSignals, setupBookEffects)],
  },
];
