/* eslint-disable @typescript-eslint/no-empty-function */
import { Component, Input, QueryList, TemplateRef, ViewChildren } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { RemoteData } from 'src/app/core/data/remote-data';
import { PaginatedList } from 'src/app/core/data/paginated-list.model';
import { Item } from 'src/app/core/shared/item.model';
import { SearchCategoryComponent } from '../search-category/search-category.component';
import { map } from 'rxjs/operators';
import { NgClass, NgIf, NgFor, AsyncPipe } from '@angular/common';
import { NgbNavModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { KwareTranslatePipe } from 'src/app/shared/utils/kware-translate.pipe';
import { VarDirective } from 'src/app/shared/utils/var.directive';
@Component({
  selector: 'ds-search-categories',
  templateUrl: './search-categories.component.html',
  styleUrls: ['./search-categories.component.scss'],
  standalone:true,
  imports:[SearchCategoryComponent,NgbNavModule,NgClass,NgIf,NgFor,TranslateModule,KwareTranslatePipe,AsyncPipe,NgbTooltipModule,VarDirective,]

})
export class SearchCategoriesComponent {
  @Input() categoryContentTemplate: TemplateRef<any>;

  @ViewChildren(SearchCategoryComponent) categoriesIds: QueryList<SearchCategoryComponent>;
  @Input() categories = [];
  @Input() categoriesConfigs = [];
  @Input() setSelectedCategoryItems: (catItems: Observable<RemoteData<PaginatedList<Item>>>) => void;
  @Input() getCategoryItems: (categoryValue: string,SearchOptions:any) => Observable<RemoteData<PaginatedList<Item>>>;

  @Input() queryOptions = {};
  @Input() selectedCategory: number;
  @Input() translatePipe: string;
  @Input() categoryParam: string;
  @Input() SearchOptions;
   /**
   * The active tab
   */
   activeTab$: Observable<string>;

  constructor(protected router: Router, private route: ActivatedRoute
  ) { }

  handleCurrentCategoryItmes() {
    const categoryElementRef = this.categoriesIds.toArray().find(cat => cat.categoryIndex === this.selectedCategory);
  
    this.setSelectedCategoryItems(categoryElementRef.fetchedItems);
    categoryElementRef.scrollToView();
    this.updateUrl();
  }

  setSelectedCategory(index: number) {
    this.selectedCategory = index;
    this.handleCurrentCategoryItmes();
    this.updateUrl();
  }

  updateUrl() {
    void this.router.navigate([], {
      queryParams: { [this.categoryParam]: this.categories[this.selectedCategory].value },
      queryParamsHandling: 'merge'
    });
  }

  getNextCategory() {
    if (!this.selectedCategory && this.selectedCategory !== 0 || this.selectedCategory === this.categories.length - 1) {
      this.selectedCategory = 0;
    } else {
      this.selectedCategory++;
    }
    this.handleCurrentCategoryItmes();
  }

  getPrevCategory() {
    if (this.selectedCategory === 0) {
      this.selectedCategory = this.categories.length - 1;
    } else {
      this.selectedCategory--;
    }
    this.handleCurrentCategoryItmes();
  }

  ngOnInit(): void {
console.log(this.categories)
    console.log(this.SearchOptions)
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.activeTab$ = this.route.queryParams.pipe(
      map((params) => params.category)
    );
  }


  onTabChange(event) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        tab: event.nextId
      },
      queryParamsHandling: 'merge',
    
    });
  }
}
