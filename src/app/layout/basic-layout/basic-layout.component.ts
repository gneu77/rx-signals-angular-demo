import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NavigationComponent } from '../../navigation/navigation.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-basic-layout',
  templateUrl: './basic-layout.component.html',
  styleUrls: ['./basic-layout.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [NavigationComponent, RouterOutlet],
})
export class BasicLayoutComponent {}
