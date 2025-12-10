import { Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { Item } from "src/app/core/shared/item.model";
import { MetadataFieldWrapperComponent } from "../metadata-field-wrapper/metadata-field-wrapper.component";
import { MetadataRepresentationLoaderComponent } from "../metadata-representation/metadata-representation-loader.component";
import { GenericItemPageFieldComponent } from "src/app/item-page/simple/field-components/specific-field/generic/generic-item-page-field.component";
import { ItemPageUriFieldComponent } from "src/app/item-page/simple/field-components/specific-field/uri/item-page-uri-field.component";
import { ThemedMetadataRepresentationListComponent } from "src/app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component";

@Component({
  selector: "ds-kware-details-section",
  standalone: true,
  imports: [
    MetadataFieldWrapperComponent,
    MetadataRepresentationLoaderComponent,
    TranslateModule,
    ItemPageUriFieldComponent,
    GenericItemPageFieldComponent,
    ThemedMetadataRepresentationListComponent,
    
  ],
  templateUrl: "./kware-details-section.component.html",
  styleUrl: "./kware-details-section.component.scss",
})
export class KwareDetailsSectionComponent {
  @Input() object: Item;
}
