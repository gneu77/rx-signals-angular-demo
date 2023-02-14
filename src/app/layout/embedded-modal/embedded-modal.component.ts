import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-embedded-modal',
  templateUrl: './embedded-modal.component.html',
  styleUrls: ['./embedded-modal.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [RouterOutlet],
})
export class EmbeddedModalComponent {}
