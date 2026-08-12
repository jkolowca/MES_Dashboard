import { Component } from '@angular/core';
import packageJson from '@package';

/**
 * Bottom layout footer.
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public readonly version = packageJson.version;
}
