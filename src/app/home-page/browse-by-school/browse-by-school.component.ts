import { Component, Inject } from '@angular/core';
import { Observable } from 'rxjs';
import { SortDirection, SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginationService } from 'src/app/core/pagination/pagination.service';
import { DSpaceObjectType } from 'src/app/core/shared/dspace-object-type.model';
import { Item } from 'src/app/core/shared/item.model';
import { toDSpaceObjectListRD } from 'src/app/core/shared/operators';
import { SearchService } from 'src/app/core/shared/search/search.service';
import { PaginationComponentOptions } from 'src/app/shared/pagination/pagination-component-options.model';
import { PaginatedSearchOptions } from 'src/app/shared/search/models/paginated-search-options.model';
import { followLink, FollowLinkConfig } from 'src/app/shared/utils/follow-link-config.model';
import { APP_CONFIG, AppConfig } from 'src/config/app-config.interface';
import { environment } from 'src/environments/environment';
import { ThemedLoadingComponent } from "src/app/shared/loading/themed-loading.component";
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';

@Component({
  selector: 'ds-browse-by-school',
  standalone: true,
  imports: [ThemedLoadingComponent,ObjectCollectionComponent,VarDirective, NgIf,RouterLink,AsyncPipe,TranslateModule],
  templateUrl: './browse-by-school.component.html',
  styleUrl: './browse-by-school.component.scss'
})
export class BrowseBySchoolComponent {
  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;

    constructor(
      private paginationService: PaginationService,
      private searchService: SearchService,
      @Inject(APP_CONFIG) private appConfig: AppConfig,

    ) {
      this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
        id: 'hp',
        pageSize: 10,
        currentPage: 1,
        maxSize: 1
      });
      this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);
    }

    ngOnInit(): void {
          const linksToFollow: FollowLinkConfig<Item>[] = [];
          if (this.appConfig.browseBy.showThumbnails) {
            linksToFollow.push(followLink('thumbnail'));
          }
          if (this.appConfig.item.showAccessStatuses) {
            linksToFollow.push(followLink('accessStatus'));
          }
      

    this.itemRD$ = this.searchService.search(
      new PaginatedSearchOptions({
        pagination: this.paginationConfig,
        dsoTypes: [DSpaceObjectType.ITEM],
        sort: this.sortConfig,
        fixedFilter:'f.administrationType=College | كلية,equals'
      }),
      undefined,
      undefined,
      undefined,
      ...linksToFollow,
    ).pipe(
      toDSpaceObjectListRD(),
    ) as Observable<RemoteData<PaginatedList<Item>>>;

    this.itemRD$.subscribe(res=>{
      console.log(res)
    })
      
    }
  

}
