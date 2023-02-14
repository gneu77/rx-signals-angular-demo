import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BasicLayoutComponent } from './layout/basic-layout/basic-layout.component';
import { AsyncPipe, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { map } from 'rxjs';
import { EmbeddedModalComponent } from './layout/embedded-modal/embedded-modal.component';
import { Store } from '@rx-signals/store';
import { currentRouteState } from './navigation/signals/navigation.signals';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    BasicLayoutComponent,
    NgSwitch,
    NgSwitchDefault,
    NgSwitchCase,
    AsyncPipe,
    EmbeddedModalComponent,
  ],
})
export class AppComponent {
  protected readonly title = 'rx-signals-angular-demo';

  protected readonly isModalRoute$ = this.store.getBehavior(currentRouteState).pipe(
    map(activatedRouteSnapshot => activatedRouteSnapshot.data),
    map(data => data['modal'] === true),
  );

  constructor(private store: Store) {}
}
