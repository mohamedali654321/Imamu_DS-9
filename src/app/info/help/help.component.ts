import { Component } from '@angular/core';
import { HelpContentComponent } from './help-content/help-content.component';

@Component({
  selector: 'ds-help',
  templateUrl: './help.component.html',
  styleUrls: ['./help.component.scss'],
  standalone:true,
  imports:[HelpContentComponent]
})
/**
 * Component displaying the Privacy Statement
 */
export class HelpComponent {
}
