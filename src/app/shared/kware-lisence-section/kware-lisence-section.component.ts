import { Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { Item } from "src/app/core/shared/item.model";
import { ItemPageCcLicenseFieldComponent } from "src/app/item-page/simple/field-components/specific-field/cc-license/item-page-cc-license-field.component";

@Component({
  selector: 'ds-kware-lisence-section',
  standalone: true,
  imports: [TranslateModule, ItemPageCcLicenseFieldComponent],
  templateUrl: './kware-lisence-section.component.html',
  styleUrl: './kware-lisence-section.component.scss'
})
export class KwareLisenceSectionComponent {
    @Input() object: Item;

}
