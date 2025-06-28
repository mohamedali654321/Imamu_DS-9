/* eslint-disable unused-imports/no-unused-imports */
import { AsyncPipe, NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { SortOptions } from 'src/app/core/cache/models/sort-options.model';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { RemoteData } from 'src/app/core/data/remote-data';
import { Item } from 'src/app/core/shared/item.model';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { ObjectCollectionComponent } from 'src/app/shared/object-collection/object-collection.component';
import { VarDirective } from 'src/app/shared/utils/var.directive';
import { CategoriesComponent } from '../categories/categories.component';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-category-content',
  templateUrl: './category-content.component.html',
  styleUrls: ['./category-content.component.scss'],
  standalone: true,
  imports:[ThemedLoadingComponent,CategoriesComponent,ObjectCollectionComponent,VarDirective, NgIf,RouterLink,AsyncPipe,TranslateModule]

})
export class CategoryContentComponent {
  @Input() paginationConfig = {};
  @Input() sortConfig: SortOptions;
  @Input() objects: Observable<RemoteData<PaginatedList<Item>>>;
  @Input() loadMoreLink: string;
  @Input() loadMoreParams = {
    value: '',
    view: '',
    source: ''
  };
}
