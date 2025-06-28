import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { BrowseService } from "src/app/core/browse/browse.service";
import { PaginationService } from "src/app/core/pagination/pagination.service";
import { Item } from "src/app/core/shared/item.model";
import { SearchService } from "src/app/core/shared/search/search.service";
import { PaginationComponentOptions } from "../pagination/pagination-component-options.model";
import { environment } from "src/environments/environment";
import {
  SortDirection,
  SortOptions,
} from "src/app/core/cache/models/sort-options.model";
import { RemoteData } from "src/app/core/data/remote-data";
import { PaginatedList } from "src/app/core/data/paginated-list.model";
import { PaginatedSearchOptions } from "../search/models/paginated-search-options.model";
import { DSpaceObjectType } from "src/app/core/shared/dspace-object-type.model";
import {
  getFirstCompletedRemoteData,
  getFirstSucceededRemoteData,
  toDSpaceObjectListRD,
} from "src/app/core/shared/operators";
import { getItemPageRoute } from "src/app/item-page/item-page-routing-paths";
import { AsyncPipe, NgClass, NgIf } from "@angular/common";
import { VarDirective } from "../utils/var.directive";
import { TranslateModule } from "@ngx-translate/core";
import { NavigationItemsService } from "./service/services/navigation-items.service";
import { NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { hasNoValue, hasValue } from "../empty.util";
import { CollectionDataService } from "src/app/core/data/collection-data.service";
import { Collection } from "src/app/core/shared/collection.model";
import {
  BehaviorSubject,
  combineLatest as observableCombineLatest,
  Observable,
  Subject,
  startWith,
  switchMap,
  map,
} from "rxjs";
import { SearchObjects } from "../search/models/search-objects.model";
import { DSpaceObject } from "src/app/core/shared/dspace-object.model";

@Component({
  selector: "ds-kware-navigate-items",
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    NgClass,
    VarDirective,
    TranslateModule,
    RouterLink,
    NgbTooltipModule,
  ],
  templateUrl: "./kware-navigate-items.component.html",
  styleUrl: "./kware-navigate-items.component.scss",
})
export class KwareNavigateItemsComponent {
  @Input() currentPage: number = 1; // Current page number
  @Input() totalPages: number = 1; // Total number of pages
  @Input() item: Item;
  @Input() collectionId: string;
  items$ = new BehaviorSubject([]);
  itemsID$ = new BehaviorSubject(0);
  itemId;
  back$ = new BehaviorSubject(null);
  URLBACK$ = new BehaviorSubject(null);
  Params$ = new BehaviorSubject(null);

  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;
  /**
   * Route to the item page
   */
  itemPageRoute: string;

  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  constructor(
    private browseService: BrowseService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    protected router: Router,
    protected navigationItemsService: NavigationItemsService,
    private route: ActivatedRoute,
    private collectionDataService: CollectionDataService
  ) {
    this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
      id: "hp",
      pageSize: 5,
      currentPage: 1,
      maxSize: 1,
    });
    this.sortConfig = new SortOptions(
      environment.homePage.recentSubmissions.sortField,
      SortDirection.DESC
    );
  }

  back(url): string {
    url
      .replace(/%40/gi, "@")
      .replace(/%3A/gi, ":")
      .replace(/%24/gi, "$")
      .replace(/%2C/gi, ",")
      .replace(/%3B/gi, ";")
      .replace(/%2B/gi, "+")
      .replace(/%3D/gi, "=")
      .replace(/%3F/gi, "?")
      .replace(/%2F/gi, "/");
    return decodeURIComponent(url);
  }

  ngOnInit(): void {
    // this.navigationItemsService.setCounter(1)
    // this.navigationItemsService.currentCounter$.subscribe(res=>{
    //   console.log(res)
    // })
    // this.navigationItemsService.currentConfiguration$.subscribe((res) => {
    //   console.log(res);
    // });
    if (
      this.navigationItemsService.searchoptions$.getValue()?.pagination
        ?.currentPage
    ) {
      this.navigationItemsService.setCounter(
        this.navigationItemsService.searchoptions$.getValue()?.pagination
          ?.currentPage
      );
    }
    this.navigationItemsService.retrieveSearchResults();

    this.navigationItemsService.currentResultsRDNavigation$?.subscribe(
      (res) => {
        if (
          res["payload"]?.page.length > 0 &&
          hasValue(this.navigationItemsService.resultRoute$.getValue())
        ) {
          this.navigationItemsService.currentResultRoute$?.subscribe((res) => {
            this.back$.next(res);
          });

          this.items$.next(res["payload"]?.page);
          this.items$?.subscribe((vals) => {
            for (let index = 0; index < vals.length; index++) {
              if (this.item.uuid === vals[index]?.indexableObject?.uuid) {
                this.itemId = index;
                if (this.itemId === vals.length - 1) {
                  this.navigationItemsService.setCounter(
                    this.navigationItemsService.counter$.getValue() + 1
                  );
                }

                this.itemsID$.next(index);
              }
            }
          });
        }
        if (
          
          hasNoValue(this.navigationItemsService.resultRoute$.getValue())
        ) {
          this.collectionDataService
            .findOwningCollectionFor(this.item)
            .pipe(getFirstCompletedRemoteData())
            .subscribe((collection: RemoteData<Collection>) => {
              this.back$.next(`/collections/${collection?.payload?.uuid}`);
              const currentPagination$ =
                this.paginationService.getCurrentPagination(
                  this.paginationConfig.id,
                  this.paginationConfig
                );
              const currentSort$ = this.paginationService.getCurrentSort(
                this.paginationConfig.id,
                this.sortConfig
              );

              this.itemRD$ = observableCombineLatest([
                currentPagination$,
                currentSort$,
              ]).pipe(
                switchMap(([currentPagination, currentSort]) =>
                  this.collectionDataService
                    .findOwningCollectionFor(this.item)
                    .pipe(
                      getFirstSucceededRemoteData(),
                      map((rd) => rd.payload.id),
                      switchMap((id: string) => {
                        return this.searchService
                          .search<Item>(
                            new PaginatedSearchOptions({
                              scope: id,
                              pagination: currentPagination,
                              sort: currentSort,
                              dsoTypes: [DSpaceObjectType.ITEM],
                            }),
                            null,
                            true,
                            true
                          )
                          .pipe(toDSpaceObjectListRD()) as Observable<
                          RemoteData<PaginatedList<Item>>
                        >;
                      }),
                      startWith(undefined) // Make sure switching pages shows loading component
                    )
                )
              );

              this.itemRD$
                .pipe(getFirstCompletedRemoteData())
                .subscribe((items) => {
                  if (items.hasSucceeded) {
                    for (
                      let page = 1;
                      page <= items?.payload.totalPages;
                      page++
                    ) {
                      this.searchService
                        .search(
                          new PaginatedSearchOptions({
                            configuration: "collection",
                            scope: collection?.payload?.uuid,
                            pagination: Object.assign(
                              new PaginationComponentOptions(),
                              {
                                id: "spc",
                                pageSize: 5,
                                currentPage: page,
                                maxSize: 1,
                              }
                            ),
                            dsoTypes: [DSpaceObjectType.ITEM],
                            sort: this.sortConfig,
                          }),
                          undefined,
                          undefined,
                          undefined
                        )
                        .pipe(getFirstCompletedRemoteData())
                        .subscribe(
                          (
                            results: RemoteData<SearchObjects<DSpaceObject>>
                          ) => {
                            if (results.hasSucceeded) {
                              this.items$.next(
                                this.items$
                                  .getValue()
                                  .concat(results.payload.page)
                              );
                            }
                          }
                        );
                    }
                    this.items$.subscribe((vals) => {
                      for (let index = 0; index < vals.length; index++) {
                        if (
                          this.item.uuid === vals[index]?.indexableObject.uuid
                        ) {
                          this.itemId = index;
                          this.itemsID$.next(index);
                        }
                      }
                    });
                  }
                });
            });
        }
        // if (res.length <= 0) {
        //   this.item.owningCollection.subscribe((collection) => {
        //     this.back$.next(`/collections/${collection?.payload?.uuid}`);
        //     this.navigationItemsService.retrieveSearchResultsByCollection(
        //       collection?.payload?.uuid
        //     );
        //   });
        //   this.navigationItemsService.currentCollectionResultsRDNavigation$.subscribe(
        //     (items) => {
        //       console.log(items)
        //       this.items$.next(this.items$.getValue().concat(items));
        //       this.items$.subscribe((vals) => {
        //         for (let index = 0; index < vals.length; index++) {
        //           if (this.item.uuid === vals[index]?.indexableObject.uuid) {
        //             this.itemId = index;
        //             this.itemsID$.next(index);
        //           }
        //         }
        //       });
        //     }
        //   );
        // }

        // if (
        //   res.length <= 0 &&
        //   hasNoValue(this.navigationItemsService.resultRoute$.getValue())
        // ) {
        //   this.item.owningCollection.subscribe((collection) => {
        //     this.back$.next(`/collections/${collection?.payload?.uuid}`);
        //     this.searchService
        //       .search(
        //         new PaginatedSearchOptions({
        //           configuration: "collection",
        //           scope: collection?.payload?.uuid,
        //           pagination: this.paginationConfig,
        //           dsoTypes: [DSpaceObjectType.ITEM],
        //           sort: this.sortConfig,
        //         }),
        //         undefined,
        //         undefined,
        //         undefined
        //       )
        //       .subscribe((res) => {
        //         for (
        //           let page = 1;
        //           page <= res.payload?.pageInfo.totalPages;
        //           page++
        //         ) {
        //           this.searchService
        //             .search(
        //               new PaginatedSearchOptions({
        //                 configuration: "collection",
        //                 scope: collection?.payload?.uuid,
        //                 pagination: Object.assign(
        //                   new PaginationComponentOptions(),
        //                   {
        //                     id: "hp",
        //                     pageSize: 5,
        //                     currentPage: page,
        //                     maxSize: 1,
        //                   }
        //                 ),
        //                 dsoTypes: [DSpaceObjectType.ITEM],
        //                 sort: this.sortConfig,
        //               }),
        //               undefined,
        //               undefined,
        //               undefined
        //             )
        //             .subscribe((items) => {
        //               this.items$.next(
        //                 this.items$.getValue().concat(items.payload?.page)
        //               );
        //               this.items$.subscribe((vals) => {
        //                 for (let index = 0; index < vals.length; index++) {
        //                   if (
        //                     this.item.uuid === vals[index]?.indexableObject.uuid
        //                   ) {
        //                     this.itemId = index;
        //                     this.itemsID$.next(index);
        //                   }
        //                 }
        //               });
        //             });
        //         }
        //       });
        //   });
        // }
      }
    );
  }

  onPrevious(item: any): string {
    if (item) {
      return (this.itemPageRoute = getItemPageRoute(item));
    }
  }

  onNext(item: any): string {
    if (item) {
      return (this.itemPageRoute = getItemPageRoute(item));
    }
  }

  // Event emitter to notify parent component about page changes
  @Output() pageChange = new EventEmitter<number>();
}
