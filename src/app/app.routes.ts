import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.component').then(c => c.HomeComponent),
  },
  {
    path: 'books',
    loadChildren: () => import('./book/book.routes').then(m => m.bookRoutes),
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
];
