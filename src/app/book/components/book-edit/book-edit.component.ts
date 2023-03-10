import { ChangeDetectionStrategy, Component } from '@angular/core';
import { AsyncPipe, Location, NgIf } from '@angular/common';
import { EntityEditModel, Store } from '@rx-signals/store';
import { bookEditInputSignals, bookEditOutputSignals } from '../../signals/book-edit.signals';
import { Observable } from 'rxjs';
import { Book, bookValidationLens } from '../../model/book.model';
import { AnyLensKeyPipe, LensPipe, RxsValidationDirective } from '@rx-signals/angular-provider';

@Component({
  selector: 'app-book-edit',
  templateUrl: './book-edit.component.html',
  styleUrls: ['./book-edit.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NgIf, AsyncPipe, RxsValidationDirective, AnyLensKeyPipe, LensPipe],
})
export class BookEditComponent {
  protected readonly validationLens = bookValidationLens;
  protected readonly nameLens = this.validationLens.k('name');

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
