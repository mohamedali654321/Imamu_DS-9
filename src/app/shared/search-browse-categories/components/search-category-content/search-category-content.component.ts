/* eslint-disable unused-imports/no-unused-imports */
import { NgIf, AsyncPipe } from '@angular/common';
import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { Item } from 'src/app/core/shared/item.model';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { CategoriesComponent } from 'src/app/home-page/browse-categories/components/categories/categories.component';
import { fadeIn } from 'src/app/shared/animations/fade';
import { hasNoValue, isNotEmpty } from 'src/app/shared/empty.util';
import { ErrorComponent } from 'src/app/shared/error/error.component';
import { NavigationItemsService } from 'src/app/shared/kware-navigate-items/service/services/navigation-items.service';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { SearchExportCsvComponent } from 'src/app/shared/search/search-export-csv/search-export-csv.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';

@Component({
  selector: 'ds-search-category-content',
  templateUrl: './search-category-content.component.html',
  styleUrls: ['./search-category-content.component.scss'],
  standalone: true,
  animations:[fadeIn],
  imports:[ThemedLoadingComponent,CategoriesComponent,ObjectCollectionComponent,SearchExportCsvComponent,ErrorComponent,VarDirective, NgIf,RouterLink,AsyncPipe,TranslateModule]
})
export class SearchCategoryContentComponent {
  @Input() paginationConfig:PaginationComponentOptions;;
  @Input() SearchOptions;
  @Input() sortConfig: SortOptions;
  @Input() objects: Observable<RemoteData<PaginatedList<Item>>>;
  @Input() loadMoreLink: string;
  @Input() loadMoreParams = {
    value: '',
    view: '',
    source: ''
  };
  @Input() searchConfig:PaginatedSearchOptions;
  @Input() category:string;
  items$ = new BehaviorSubject([]);

  constructor(  protected navigationItemsService: NavigationItemsService,
    private route: ActivatedRoute,
      private searchService: SearchService){}
  ngOnInit(): void {
    this.route.params.subscribe(params=>{
      console.log(params)
    })
    console.log(this.category)

    // this.SearchOptions.fixedFilter=`f.entityType=Person,equals`;
    // this.navigationItemsService.setConfiguration(this.SearchOptions)

    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    // this.objects.subscribe(res=>{
    //         let pages= res?.payload?.pageInfo?.totalElements >  500 ? 50 : res?.payload?.pageInfo?.totalPages;
    //          for (let page = 1; page <= pages; page++) {
                    
    //            this.searchService.search(
    //               new PaginatedSearchOptions(
    //                      {
    //                        pagination: Object.assign(new PaginationComponentOptions(), {
    //                                            id: 'hp',
    //                                            pageSize: 5,
    //                                            currentPage: page,
    //                                            maxSize: 1,
    //                                          }),
    //                       dsoTypes: [DSpaceObjectType.ITEM],
    //                             sort: this.SearchOptions.sort,
    //                             query: this.SearchOptions.query,
    //                             filters:this.SearchOptions.filters,
    //                             fixedFilter: `f.entityType=${this.category},equals`,
    //                             configuration:`f.entityType=${this.category},equals`
    //                           }
    //                    ),
    //                    undefined,
    //                    undefined,
    //                    undefined
    //            ).subscribe(res=>{
    //              this.items$.next(
    //                this.items$.getValue().concat(res.payload?.page)
    //              );
                 
           
               
    //            })
           
    //          }
    //          this.items$.subscribe(res=>{
    //           this.navigationItemsService.setResultsRDNavigation(res)
    //         })

    // })
  }

  /**
   * Check if search results are loading
   */
  isLoading(searchResults) {
    return !this.showError(searchResults) && (hasNoValue(searchResults) || hasNoValue(searchResults.payload) || searchResults.isLoading);
  }

  
  showError(searchResults): boolean {
    return searchResults?.hasFailed && (!searchResults?.errorMessage || searchResults?.statusCode !== 400);
  }

  errorMessageLabel(searchResults): string {
    return (searchResults?.statusCode  === 422) ? 'error.invalid-search-query' : 'error.search-results';
  }

  /**
   * Method to change the given string by surrounding it by quotes if not already present.
   */
  surroundStringWithQuotes(input: string): string {
    let result = input;

    if (isNotEmpty(result) && !(result.startsWith('\"') && result.endsWith('\"'))) {
      result = `"${result}"`;
    }

    return result;
  }
}

