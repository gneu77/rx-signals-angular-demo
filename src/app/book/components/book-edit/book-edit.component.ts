import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, Location, NgIf } from '@angular/common';
import { EntityEditModel, getLens, ModelValidationResult, Store } from '@rx-signals/store';
import { bookEditInputSignals, bookEditOutputSignals } from '../../signals/book-edit.signals';
import { Observable } from 'rxjs';
import { Book } from '../../model/book.model';
import { AnyLensKeyPipe, LensGetPipe, RxsValidationDirective } from '@rx-signals/angular-provider';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, AsyncPipe, RxsValidationDirective, LensGetPipe, AnyLensKeyPipe],
})
export class BookEditComponent {
  protected readonly lens = getLens<ModelValidationResult<Book>>();
  protected readonly nameLens = this.lens.k('name');

  protected readonly model$: Observable<EntityEditModel<Book, { id: number }, number, string>> =
    this.store.getBehavior(bookEditOutputSignals.model);

  constructor(private store: Store, private location: Location) {}

  protected update(event: Partial<Book>) {
    this.store.dispatch(bookEditInputSignals.update, event);
  }

  protected onSubmit(event: SubmitEvent) {
    event.preventDefault();
    this.store.dispatch(bookEditInputSignals.save);
  }

  protected navigateBack() {
    this.location.back();
  }
}
