import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PersistedBook } from '../../model/book.model';
import { filter, map, Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { isCombinedEffectResultInCompletedSuccessState, Store } from '@rx-signals/store';
import {
  booklistSearchInputSignals,
  booklistSearchOutputSignals,
} from '../../signals/booklist-search.signals';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-booklist',
  templateUrl: './booklist.component.html',
  styleUrls: ['./booklist.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterLink, AsyncPipe, NgIf, NgForOf],
})
export class BooklistComponent {
  protected readonly books$: Observable<PersistedBook[]> = this.store
    .getBehavior(booklistSearchOutputSignals.combined)
    .pipe(
      filter(isCombinedEffectResultInCompletedSuccessState),
      map(result => result.result),
    );

  constructor(private store: Store) {}

  protected onSearch(query: string): void {
    this.store.dispatch(booklistSearchInputSignals.query, query);
  }

  protected refresh(): void {
    this.store.dispatch(booklistSearchInputSignals.reload);
  }
}
