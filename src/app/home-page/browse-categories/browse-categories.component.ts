/* eslint-disable @typescript-eslint/no-empty-function */
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
import { CategoriesComponent } from './components/categories/categories.component';
import { CategoryContentComponent } from './components/category-content/category-content.component';
import { PublicationCategoryComponent } from './subCategories/publication/publication-category/publication-category.component';
import { AdministrationCategoryComponent } from './subCategories/administration/administration-category/administration-category.component';
import { OrgUnitCategoryComponent } from './subCategories/orgunit/orgunit-category/orgunit-category.component';
import { PlaceCategoryComponent } from './subCategories/place/place-category/placet-category.component';
import { EventCategoryComponent } from './subCategories/event/event-category/event-category.component';
import { JournalCategoryComponent } from './subCategories/journal/journal-category/journal-category.component';
@Component({
  selector: 'ds-browse-categories',
  templateUrl: './browse-categories.component.html',
  styleUrls: ['./browse-categories.component.scss'],
  standalone: true,
  imports:[ThemedLoadingComponent,JournalCategoryComponent,AdministrationCategoryComponent,EventCategoryComponent,PlaceCategoryComponent,PublicationCategoryComponent,OrgUnitCategoryComponent,CategoriesComponent,CategoryContentComponent,ObjectCollectionComponent,VarDirective, NgIf]
})
export class BrowseCategoriesComponent implements OnInit, OnDestroy {
  parentCategories = [];
  matchCategories = [];
  // sortedCategories = ['Publication', 'Person', 'Administration', 'OrgUnit', 'Project', 'JournalIssue', 'JournalVolume', 'Journal', 'Site', 'Place', 'Activity', 'Event', 'Era', 'Series'];
  // sortedCategories = ['Publication', 'Person', 'OrgUnit', 'Project', 'Journal', 'Place', 'Event', 'Era', 'Series', 'Subject'];
  sortedCategories = ['Publication', 'Person','Administration', 'OrgUnit', 'Journal', 'Project','Place', 'Event', 'Era', 'Series', 'Subject'];
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
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  selectedCategory = 0;
  publicationcategory: BrowseEntry;
  administrationcategory: BrowseEntry;
  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;

  constructor(
    private browseService: BrowseService,
    private paginationService: PaginationService,
    private searchService: SearchService,
    protected router: Router,
    private route: ActivatedRoute
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
      new BrowseEntrySearchOptions('entityType')
    ).subscribe(entities => {
      this.parentCategories = entities?.payload?.page.filter(obj=>{
        return obj.value !== 'JournalIssue' && obj.value !== 'JournalVolume'
      });
      this.parentCategories?.sort((a, b) => this.sortedCategories.indexOf(a.value) - this.sortedCategories.indexOf(b.value));
      this.matchCategories = this.sortedCategories?.filter(x => this.parentCategories?.find(y=>y.value == x));
      this.publicationcategory = this.parentCategories?.find(entity => entity.value === 'Publication');
      this.administrationcategory = this.parentCategories?.find(entity => entity.value === 'Administration');

      this.route.queryParams
        .subscribe(params => {
          const currentIndex = this.parentCategories?.findIndex(cat => cat.value === params.category);
          if (currentIndex && currentIndex !== -1) {
            this.selectedCategory = currentIndex;
          } else {
            this.selectedCategory = 0;
          }
        }
        );
        this.itemRD$?.subscribe(item=>{console.log(item)})
      this.updateUrl();
    });
  }

  private updateUrl() {
    void this.router.navigate([], {
      queryParams: { 'category': this.parentCategories[this.selectedCategory]?.value },
      queryParamsHandling: 'merge'
    });
  }

  getCategoryItems(categoryValue: string): Observable<RemoteData<PaginatedList<Item>>> {
    return this.searchService.search(
      new PaginatedSearchOptions(
        {
          pagination: this.paginationConfig,
          dsoTypes: [DSpaceObjectType.ITEM],
          sort: this.sortConfig,
          query: `dspace.entity.type:${categoryValue}`,
          fixedFilter: `f.entityType=${categoryValue},equals`
        }
      ),
      undefined,
      undefined,
      undefined,
    ).pipe(
      toDSpaceObjectListRD()
    ) as Observable<RemoteData<PaginatedList<Item>>>;
  }

  setSelectedCategoryItems = (catItems: Observable<RemoteData<PaginatedList<Item>>>) => {
    this.itemRD$ = catItems;
  };

  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
  }
}
