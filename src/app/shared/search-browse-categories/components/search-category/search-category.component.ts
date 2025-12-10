/* eslint-disable @typescript-eslint/no-empty-function */
import { NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { BrowseService } from 'src/app/core/browse/browse.service';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { Item } from 'src/app/core/shared/item.model';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { NavigationItemsService } from 'src/app/shared/kware-navigate-items/service/services/navigation-items.service';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { KwareTranslatePipe } from 'src/app/shared/utils/kware-translate.pipe';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'ds-search-category',
  templateUrl: './search-category.component.html',
  styleUrls: ['./search-category.component.scss'],
  standalone:true,
  imports:[NgIf,KwareTranslatePipe,TranslateModule]
})
export class SearchCategoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('selectedCategoryRef') selectedCategoryRef: ElementRef<any>;
  @Input() category;
  @Input() categoryIndex: number;
  @Input() currentCategoryIndex: number;
  @Input() setSelectedCategoryItems: (catItems: Observable<RemoteData<PaginatedList<Item>>>) => void;
  @Input() categoryIcon: string;
  @Output() emitedCategory = new EventEmitter<number>();
  @Input() getCategoryItems: (categoryValue: string,SearchOptions:any) => Observable<RemoteData<PaginatedList<Item>>>;
  @Input() translatePipe: string;
  @Input() SearchOptions;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  fetchedItems: Observable<RemoteData<PaginatedList<Item>>>;
items$ = new BehaviorSubject([]);
  constructor(
    protected browseService: BrowseService,
    private paginationService: PaginationService,
    protected navigationItemsService: NavigationItemsService,
    private searchService: SearchService) {
      this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
        id: 'spc',
        pageSize: 10,
        currentPage: 1,
        maxSize: 10
      });
      this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);

  }

  ngAfterViewInit(): void {
    if (this.categoryIndex === this.currentCategoryIndex) {
      this.scrollToView();
      this.setSelectedCategoryItems(this.fetchedItems);
    }
  }

  ngOnInit(): void {
    // this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
    //   id: 'spc',
    //   pageSize: this.SearchOptions.pagination.pageSize,
    //   currentPage: this.SearchOptions.pagination.currentPage,
    //   maxSize: this.SearchOptions.pagination.maxSize
    // });
    // this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);
    this.fetchedItems = this.getCategoryItems(this.category.value,this.SearchOptions);
 
  }

  setSelectedCategory() {
    this.emitedCategory.emit(this.categoryIndex);
    this.setSelectedCategoryItems(this.fetchedItems);
    this.SearchOptions.fixedFilter=`f.entityType=${this.category.value},equals`;
    this.navigationItemsService.setConfiguration(this.SearchOptions)

    // this.fetchedItems.subscribe(res=>{
    //   let pages= res.payload?.pageInfo?.totalElements >  500 ? 50 : res?.payload?.pageInfo?.totalPages;
    //    for (let page = 1; page <= pages; page++) {
              
    //      this.searchService.search(
    //         new PaginatedSearchOptions(
    //                {
    //                  pagination: Object.assign(new PaginationComponentOptions(), {
    //                                      id: 'hp',
    //                                      pageSize: 5,
    //                                      currentPage: page,
    //                                      maxSize: 1,
    //                                    }),
    //                 dsoTypes: [DSpaceObjectType.ITEM],
    //                       sort: this.SearchOptions.sort,
    //                       query: this.SearchOptions.query,
    //                       filters:this.SearchOptions.filters,
    //                       fixedFilter: `f.entityType=${this.category.value},equals`,
    //                       configuration:`f.entityType=${this.category.value},equals`
    //                     }
    //              ),
    //              undefined,
    //              undefined,
    //              undefined
    //      ).subscribe(res=>{
    //        this.items$.next(
    //          this.items$.getValue().concat(res.payload?.page)
    //        );
           
     
         
    //      })
     
    //    }
    //    this.items$.subscribe(res=>{
    //     this.navigationItemsService.setResultsRDNavigation(res)
    //   })
    //   })
  }

  scrollToView() {
    this.selectedCategoryRef.nativeElement.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center'
    });
  }

  formatNumberToKStyle(number) {
    if (number < 1000) {
      return number;
    } else if (number >= 1000 && number < 1_000_000) {
      return (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else if (number >= 1_000_000 && number < 1_000_000_000) {
      return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (number >= 1_000_000_000 && number < 1_000_000_000_000) {
      return (number / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    } else if (number >= 1_000_000_000_000 && number < 1_000_000_000_000_000) {
      return (number / 1_000_000_000_000).toFixed(1).replace(/\.0$/, '') + 'T';
    }
  }

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
  }
}
