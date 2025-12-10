import { Component, Input } from '@angular/core';
import { ItemPageFieldComponent } from '../item-page-field.component';
import { Item } from 'src/app/core/shared/item.model';
import { MetadataFieldWrapperComponent } from "src/app/shared/metadata-field-wrapper/metadata-field-wrapper.component";
import { ItemPageAltmetricFieldComponent } from "./altmetric/item-page-altmetric-field.component";
import { TranslateModule } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { ItemPageDimensionFieldComponent } from "./dimension/item-page-dimension-field.component";
import { ItemPagePlumxFieldComponent } from "./plumx/item-page-plumx-field.component";

@Component({
  selector: 'ds-item-page-metrics-field',
  templateUrl: './item-page-metrics-field.component.html',
  standalone:true,
  imports: [MetadataFieldWrapperComponent, ItemPageAltmetricFieldComponent, TranslateModule, NgIf, ItemPageDimensionFieldComponent, ItemPagePlumxFieldComponent],
  styleUrls: [
    '../../../../../shared/metadata-field-wrapper/metadata-field-wrapper.component.scss',
  ],
})
export class ItemPageMetricsFieldComponent extends ItemPageFieldComponent {

  @Input() item: Item;

  public showTitle = false;

  public someWidgetHasLoaded(widgetLoaded: boolean) {
    if (widgetLoaded) {
      this.showTitle = true;
    }
  }

}
