/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Input, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { BrowseEntrySearchOptions } from 'src/app/core/browse/browse-entry-search-options.model';
import { BrowseService } from 'src/app/core/browse/browse.service';
import { BehaviorSubject, Observable, distinctUntilChanged } from 'rxjs';
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
import { SharedVariableService } from 'src/app/core/services/share-variable.service';
import { NgIf } from '@angular/common';
import { ThemedLoadingComponent } from '../loading/themed-loading.component';
import { ObjectCollectionComponent } from '../object-collection/object-collection.component';
import { VarDirective } from '../utils/var.directive';
import { SearchCategoryContentComponent } from './components/search-category-content/search-category-content.component';
import { SearchCategoriesComponent } from './components/serach-categories/search-categories.component';
import { SearchPublicationCategoryComponent } from './subCategories/publication/publication-category/serach-publication-category.component';
import { NavigationItemsService } from '../kware-navigate-items/service/services/navigation-items.service';

@Component({
  selector: 'ds-search-browse-categories',
  templateUrl: './search-browse-categories.component.html',
  styleUrls: ['./search-browse-categories.component.scss'],
  standalone: true,
  imports:[ThemedLoadingComponent,SearchPublicationCategoryComponent,SearchCategoriesComponent,SearchCategoryContentComponent,ObjectCollectionComponent,VarDirective, NgIf]
})
export class SearchBrowseCategoriesComponent implements OnInit, OnDestroy {
  parentCategories = [];
  testCategories = [];
  matchCategories = [];
  sortedCategories = ['All','Publication', 'Person', 'OrgUnit', 'Project', 'JournalIssue', 'JournalVolume', 'Journal', 'Place', 'Event', 'Era', 'Series','Subject'];
  categoriesConfigs = {
    'Publication': { icon: 'fa-solid fa-book-open' },
    'Person': { icon: 'fa fa-users' },
    'Administration': { icon: 'fa-solid fa-building' },
    'OrgUnit': { icon: 'fa fa-sitemap' },
    'Project': { icon: 'fas fa-project-diagram' },
    'JournalIssue': { icon: 'fa-solid fa-newspaper' },
    'JournalVolume': { icon: 'fa-solid fa-newspaper' },
    'Journal': { icon: 'fa-solid fa-newspaper' },
    'Site': { icon: 'fa-solid fa-location-dot' },
    'Place': { icon: 'fa fa-globe' },
    'Activity': { icon: 'fa-solid fa-house-laptop' },
    'Event': { icon: 'fa-solid fa-calendar-days' },
    'Era': { icon: 'fa-solid fa-hourglass-start' },
    'Series': { icon: 'fa-solid fa-layer-group' },
    'Subject': { icon: 'fa-regular fa-file-word' },
  };

  items$ = new BehaviorSubject([]);
  @Input() results;
  @Input() SearchOptions;
  @Input() searchConfig:PaginatedSearchOptions
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  selectedCategory = 0;
  publicationcategory: BrowseEntry;
  searchOptionsFiltering:any;

  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;
  selectedCategoryValue:any;
  constructor(
    private browseService: BrowseService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    protected router: Router,
    private route: ActivatedRoute,
    protected sharedVariable: SharedVariableService,
    protected navigationItemsService: NavigationItemsService,
  ) {
    this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
      id: 'spc',
      pageSize: 10,
      currentPage: 1,
      maxSize: 10
    });
    this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);
  }
ngOnChanges(changes: SimpleChanges): void {
  // console.log(changes.SearchOptions.currentValue)
  this.searchOptionsFiltering=changes.SearchOptions.currentValue;
  if(!changes.SearchOptions.firstChange){
 this.searchOptionsFiltering=changes.SearchOptions.currentValue;
//  console.log(this.searchOptionsFiltering)
  }
if(!changes.searchConfig.firstChange){
this.paginationConfig=changes.searchConfig.currentValue.pagination

}
  
}
  ngOnInit() {

    this.sharedVariable.currentEntityTypes.subscribe(entities => {
      this.parentCategories = entities?.map((
            { label, value, count }) => ({ label, value, count }));;
      this.parentCategories?.unshift({ type: 'browseEntry', value: 'All' });
      this.parentCategories?.sort((a, b) => this.sortedCategories.indexOf(a.value) - this.sortedCategories.indexOf(b.value));
      this.matchCategories = this.sortedCategories.filter(x => this.parentCategories?.find(y=>y.value == x));
      this.publicationcategory = this.parentCategories?.find(entity => entity.value === 'Publication');

      this.route.queryParams
        .subscribe(params => {
          const currentIndex = this.parentCategories.findIndex(cat => cat.value === params.category);
          if (currentIndex && currentIndex !== -1) {
            this.selectedCategory = currentIndex;
          } else {
            this.selectedCategory = 0;
          }
        }
        );
        this.itemRD$?.subscribe(item=>{console.log(item)})
      // this.updateUrl();
    });
    this.selectedCategoryValue=this.parentCategories[this.selectedCategory].value;

  }

  private updateUrl() {
    void this.router.navigate([], {
      queryParams: { 'category': this.parentCategories[this.selectedCategory].value },
      queryParamsHandling: 'merge'
    });
  }
  

  getCategoryItems(categoryValue: string,SearchOptions:any): Observable<RemoteData<PaginatedList<Item>>> {
    

   return this.searchService.search(
     new PaginatedSearchOptions(
        {
          pagination: SearchOptions.pagination,
          dsoTypes: [DSpaceObjectType.ITEM],
          sort: SearchOptions.sort,
          query: SearchOptions.query,
          filters:SearchOptions.filters,
          fixedFilter: `f.entityType=${categoryValue},equals`,
          configuration:`f.entityType=${categoryValue},equals`
        }
      ),
      undefined,
      true,
      true,
    ).pipe(
      toDSpaceObjectListRD(),distinctUntilChanged()
    ) as Observable<RemoteData<PaginatedList<Item>>>;
  
  }

  setSelectedCategoryItems = (catItems: Observable<RemoteData<PaginatedList<Item>>>) => {
    this.itemRD$ = catItems;
  };

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
  }
}
