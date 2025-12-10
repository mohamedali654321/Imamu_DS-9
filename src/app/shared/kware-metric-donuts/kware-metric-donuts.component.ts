import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { ItemPageAltmetricFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/metrics/altmetric/item-page-altmetric-field.component';
import { ItemPageDimensionFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/metrics/dimension/item-page-dimension-field.component';
import { ItemPagePlumxFieldComponent } from 'src/app/item-page/simple/field-components/specific-field/metrics/plumx/item-page-plumx-field.component';
import { MetadataFieldWrapperComponent } from '../metadata-field-wrapper/metadata-field-wrapper.component';
import { Item } from 'src/app/core/shared/item.model';

@Component({
  selector: 'ds-kware-metric-donuts',
  standalone: true,
   imports: [MetadataFieldWrapperComponent, ItemPageAltmetricFieldComponent, TranslateModule, NgIf, ItemPageDimensionFieldComponent, ItemPagePlumxFieldComponent],
  templateUrl: './kware-metric-donuts.component.html',
  styleUrl: './kware-metric-donuts.component.scss'
})
export class KwareMetricDonutsComponent {
 @Input() item: Item;

  public showTitle = false;

  public someWidgetHasLoaded(widgetLoaded: boolean) {
    if (widgetLoaded) {
      this.showTitle = true;
    }
  }
}
