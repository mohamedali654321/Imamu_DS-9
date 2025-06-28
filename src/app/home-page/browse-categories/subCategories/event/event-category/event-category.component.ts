import { Component, OnDestroy, OnInit } from '@angular/core';
import { BrowseEntrySearchOptions } from 'src/app/core/browse/browse-entry-search-options.model';
import { BrowseService } from 'src/app/core/browse/browse.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { Item } from 'src/app/core/shared/item.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { toDSpaceObjectListRD } from 'src/app/core/shared/operators';
import { BrowseEntry } from 'src/app/core/shared/browse-entry.model';
import { NgIf } from '@angular/common';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';
import { CategoriesComponent } from '../../../components/categories/categories.component';
import { CategoryContentComponent } from '../../../components/category-content/category-content.component';

@Component({
  selector: 'ds-event-category',
  templateUrl: './event-category.component.html',
  styleUrls: ['./event-category.component.scss'],
  standalone: true,
  imports:[ThemedLoadingComponent,CategoriesComponent,CategoryContentComponent,ObjectCollectionComponent,VarDirective, NgIf]
})
export class EventCategoryComponent implements OnInit, OnDestroy {
  pubCategories = [];
  pubCategoriesConfig = {
    'All': { icon: 'fa-solid fa-calendar-days' },
    'Event | حدث': { icon: 'fa-solid fa-calendar-days' },
    'Activity | فعالية': { icon: 'fa-solid fa-house-laptop' },

  };
  items$ = new BehaviorSubject([]);
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  selectedCategory = 0;
  allPub: BrowseEntry;

  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;

  constructor(
    private browseService: BrowseService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    private route: ActivatedRoute,
    protected router: Router,
  ) {
    this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
      id: 'hp',
      pageSize: 5,
      currentPage: 1,
      maxSize: 1
    });
    this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);
  }

  ngOnInit() {
    this.browseService.getBrowseEntriesFor(
      new BrowseEntrySearchOptions('eventMainType')
    ).subscribe(entities => {
      this.pubCategories = entities?.payload?.page;
      this.pubCategories?.unshift({ type: 'browseEntry', value: 'All' });
      this.route.queryParams
        .subscribe(params => {
          const currentIndex = entities?.payload?.page.findIndex(cat => cat.value === params.subCategory);
          if (currentIndex && currentIndex !== -1) {
            this.selectedCategory = currentIndex;
          } else {
            this.selectedCategory = 0;
          }
        }
        );
      void this.router.navigate([], {
        queryParams: { 'subCategory': entities?.payload?.page[this.selectedCategory].value },
        queryParamsHandling: 'merge'
      });
    });
  }

  getPubCategoryItems(categoryValue: string): Observable<RemoteData<PaginatedList<Item>>> {
    if (categoryValue === 'All') {
      return this.searchService.search(
        new PaginatedSearchOptions(
          {
            pagination: this.paginationConfig,
            dsoTypes: [DSpaceObjectType.ITEM],
            sort: this.sortConfig,
            query: 'dspace.entity.type:Event',
            fixedFilter: 'f.entityType=Event,equals'
          }
        ),
        undefined,
        undefined,
        undefined,
      ).pipe(
        toDSpaceObjectListRD()
      ) as Observable<RemoteData<PaginatedList<Item>>>;
    } else {
      return this.searchService.search(
        new PaginatedSearchOptions({
          pagination: this.paginationConfig,
          dsoTypes: [DSpaceObjectType.ITEM],
          sort: this.sortConfig,
          query: `event.mainType:${categoryValue}`,
          fixedFilter: `f.eventMainType=${categoryValue},equals`
        },),
        undefined,
        undefined,
        undefined,
      ).pipe(
        toDSpaceObjectListRD()
      ) as Observable<RemoteData<PaginatedList<Item>>>;
    }
  }

  setSelectedCategoryItems = (catItems: Observable<RemoteData<PaginatedList<Item>>>) => {
    this.itemRD$ = catItems;
  };

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
    // void this.router.navigate([], {
    //   queryParams: { 'subCategory': null },
    //   queryParamsHandling: 'merge'
    // });
  }
}
