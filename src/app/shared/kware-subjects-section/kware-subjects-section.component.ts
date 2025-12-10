import { Component, Input } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";
import { BrowseDefinitionDataService } from "src/app/core/browse/browse-definition-data.service";
import { BrowseService } from "src/app/core/browse/browse.service";
import { RelationshipDataService } from "src/app/core/data/relationship-data.service";
import { MetadataService } from "src/app/core/metadata/metadata.service";
import { Item } from "src/app/core/shared/item.model";
import { MetadataRepresentation } from "src/app/core/shared/metadata-representation/metadata-representation.model";
import { MetadataValue } from "src/app/core/shared/metadata.models";
import { getFirstCompletedRemoteData } from "src/app/core/shared/operators";
import { ThemedMetadataRepresentationListComponent } from "src/app/item-page/simple/metadata-representation-list/themed-metadata-representation-list.component";
import { map, Observable, zip as observableZip } from "rxjs";
import { MetadatumRepresentation } from "src/app/core/shared/metadata-representation/metadatum/metadatum-representation.model";
import { AbstractIncrementalListComponent } from "src/app/item-page/simple/abstract-incremental-list/abstract-incremental-list.component";
import { AsyncPipe, NgFor, NgIf } from "@angular/common";
import { ThemedLoadingComponent } from "../loading/themed-loading.component";
import { MetadataFieldWrapperComponent } from "../metadata-field-wrapper/metadata-field-wrapper.component";
import { MetadataRepresentationLoaderComponent } from "../metadata-representation/metadata-representation-loader.component";
import { VarDirective } from "../utils/var.directive";
@Component({
  selector: "ds-kware-subjects-section",
  standalone: true,
  imports: [
    ThemedMetadataRepresentationListComponent,
    TranslateModule,
    AsyncPipe,
    MetadataFieldWrapperComponent,
    MetadataRepresentationLoaderComponent,
    ThemedLoadingComponent,
    VarDirective,
    NgFor,
    NgIf
  ],
  templateUrl: "./kware-subjects-section.component.html",
  styleUrl: "./kware-subjects-section.component.scss",
})
export class KwareSubjectsSectionComponent extends AbstractIncrementalListComponent<
  Observable<MetadataRepresentation[]>
> {
  @Input() object: Item;

  /**
   * The type of item to create a representation of
   */
  itemType: string = "Subject";

  /**
   * The metadata field to use for fetching metadata from the item
   */
  metadataFields: string[] = ["dc.subject"];

  /**
   * An i18n label to use as a title for the list
   */
  label: string;

  /**
   * The amount to increment the list by when clicking "view more"
   * Defaults to 10
   * The default can optionally be overridden by providing the limit as input to the component
   */
  incrementBy = 20;

  /**
   * The total amount of metadata values available
   */
  total: number;
  constructor(
    public relationshipService: RelationshipDataService,
    protected browseDefinitionDataService: BrowseDefinitionDataService,
    protected metadataService: MetadataService
  ) {
    super();
  }


    /**
   * Get a specific page
   * @param page  The page to fetch
   */
  getPage(page: number): Observable<MetadataRepresentation[]> {
    const metadata = this.object.findMetadataSortedByPlace(this.metadataFields);
    this.total = metadata.length;
    return this.resolveMetadataRepresentations(metadata, page);
  }

  /**
   * Resolve a list of metadata values to a list of metadata representations
   * @param metadata  The list of all metadata values
   * @param page      The page to return representations for
   */
  resolveMetadataRepresentations(
    metadata: MetadataValue[],
    page: number
  ): Observable<MetadataRepresentation[]> {
    return observableZip(
      ...metadata
        .slice(
          this.objects.length * this.incrementBy,
          this.objects.length * this.incrementBy + this.incrementBy
        )
        .map((metadatum: any) => Object.assign(new MetadataValue(), metadatum))
        .map((metadatum: MetadataValue) => {
          if (this.metadataService.isVirtual(metadatum)) {
            return this.relationshipService.resolveMetadataRepresentation(
              metadatum,
              this.object,
              this.itemType
            );
          } else {
            // Check for a configured browse link and return a standard metadata representation
            let searchKeyArray: string[] = [];
            this.metadataFields.forEach((field: string) => {
              searchKeyArray = searchKeyArray.concat(
                BrowseService.toSearchKeyArray(field)
              );
            });
            return this.browseDefinitionDataService
              .findByFields(this.metadataFields)
              .pipe(
                getFirstCompletedRemoteData(),
                map((def) =>
                  Object.assign(
                    new MetadatumRepresentation(this.itemType, def.payload),
                    metadatum
                  )
                )
              );
          }
        })
    );
  }
}
