
import { ChangeDetectionStrategy, Component, ElementRef, Inject, Input, OnInit, PLATFORM_ID } from '@angular/core';
import { PaginatedSearchOptions } from '../../shared/search/models/paginated-search-options.model';
import { fadeIn, fadeInOut } from '../../shared/animations/fade';
import { RemoteData } from '../../core/data/remote-data';
import { PaginatedList } from '../../core/data/paginated-list.model';
import { Item } from '../../core/shared/item.model';
import { PaginationComponentOptions } from '../../shared/pagination/pagination-component-options.model';
import { PaginationService } from '../../core/pagination/pagination.service';
import { SearchService } from '../../core/shared/search/search.service';
import { SortDirection, SortOptions } from '../../core/cache/models/sort-options.model';
import { environment } from '../../../environments/environment';
import { ViewMode } from '../../core/shared/view-mode.model';
import { SearchConfigurationService } from '../../core/shared/search/search-configuration.service';
import { getFirstSucceededRemoteData, getFirstSucceededRemoteDataPayload, getRemoteDataPayload, toDSpaceObjectListRD } from '../../core/shared/operators';
import { BehaviorSubject, map, Observable, switchMap } from 'rxjs';
import { followLink, FollowLinkConfig } from '../../shared/utils/follow-link-config.model';
import { APP_CONFIG, AppConfig } from '../../../config/app-config.interface';
import { AsyncPipe, isPlatformBrowser, NgFor, NgIf } from '@angular/common';
import { setPlaceHolderAttributes } from '../../shared/utils/object-list-utils';
import { DSpaceObjectType } from '../../core/shared/dspace-object-type.model';
import {
  HttpHeaders,
  HttpClient,
  HttpResponse
} from '@angular/common/http';
import { DSpaceObjectDataService } from 'src/app/core/data/dspace-object-data.service';
import { ThemedLoadingComponent } from 'src/app/shared/loading/themed-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { VarDirective } from 'src/app/shared/utils/var.directive';
import { ErrorComponent } from 'src/app/shared/error/error.component';
import { ListableObjectComponentLoaderComponent } from 'src/app/shared/object-collection/shared/listable-object/listable-object-component-loader.component';
import { BrowserOnlyPipe } from 'src/app/shared/utils/browser-only.pipe';
import { Site } from 'src/app/core/shared/site.model';
import { StatisticsPageDirective } from 'src/app/statistics-page/statistics-page/statistics-page.directive';
import { SiteDataService } from 'src/app/core/data/site-data.service';
import { DSpaceObject } from 'src/app/core/shared/dspace-object.model';
import { redirectOn4xx } from 'src/app/core/shared/authorized.operators';
@Component({
  selector: 'ds-top-section',
  templateUrl: './top-section.component.html',
  styleUrls: ['./top-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    fadeIn,
    fadeInOut
  ],
  standalone:true,
  imports:[ThemedLoadingComponent,NgIf,TranslateModule,VarDirective,ErrorComponent,ListableObjectComponentLoaderComponent,AsyncPipe,BrowserOnlyPipe,NgFor]
})
export class TopSectionComponent extends StatisticsPageDirective<Site> implements OnInit  {
  itemRD$: Observable<RemoteData<PaginatedList<Item>>>;
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  itemsRD$ =new BehaviorSubject<any[]>([]);
  itemsArr=[];
  items=[];
  itemsIDs=[];
  item1:any;
  item2:any;
  item3:any;
  item4:any;
  item5:any;

  /**
 * The view-mode we're currently on
 * @type {ViewMode}
 */
  viewMode = ViewMode.GridElement;

  @Input() showViewModes = true; //kware-edit
  @Input() viewModeList: ViewMode[]; //kware-edit
  @Input() siteId : string;
  private _placeholderFontClass: string;

  constructor(
   
    private paginationService: PaginationService,
    public dsoService: DSpaceObjectDataService,
    private httpClient: HttpClient,
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    protected siteService: SiteDataService
  ) {

super();
    this.paginationConfig = Object.assign(new PaginationComponentOptions(), {
      id: 'hp',
      pageSize: 5,
      currentPage: 1,
      maxSize: 1
    });
    this.sortConfig = new SortOptions(environment.homePage.recentSubmissions.sortField, SortDirection.DESC);
    
  }
  ngOnInit(): void {
    this.getReports$().subscribe(res=>{      
      

     this.dsoService.findById(res[0].points.slice(0,5)[0].id)?.pipe(getFirstSucceededRemoteData()).subscribe((item)=>{
      this.item1=item;
     })

    this.dsoService.findById(res[0].points.slice(0,5)[1].id)?.pipe(getFirstSucceededRemoteData()).subscribe((item)=>{
      this.item2=item;
     })

    this.dsoService.findById(res[0].points.slice(0,5)[2].id)?.pipe(getFirstSucceededRemoteData()).subscribe((item)=>{
      this.item3=item;
     })

     
    this.dsoService.findById(res[0].points.slice(0,5)[3].id)?.pipe(getFirstSucceededRemoteData()).subscribe((item)=>{
      this.item4=item;
     })

    this.dsoService.findById(res[0].points.slice(0,5)[4].id)?.pipe(getFirstSucceededRemoteData()).subscribe((item)=>{
      this.item5=item;
     })

      res[0].points.slice(0,5).forEach(item=>{
       this.itemsIDs.push(item.id) 
      })


    this.itemsIDs.forEach(async(item)=>{
             await this.dsoService.findById(item)?.pipe(getFirstSucceededRemoteData()).subscribe(async(items)=>{
        //  console.log(items)
            
              
         await  this.itemsRD$.next(this.itemsRD$.getValue().concat([items]))

        
      })

    })
      res.forEach(point=>{

        point.points.slice(0, 5).forEach(async(item)=>{
        // console.log(item.id);


         await this.dsoService.findById(item.id)?.pipe(getFirstSucceededRemoteData()).subscribe(async(items)=>{
        //  console.log(items)
            if(items.payload?.id == item?.id){
              this.itemsArr.push(items)
        //  await  this.itemsRD$.next(this.itemsRD$.getValue().concat([items]))

        }
      })
        })
        
      })

    })



  }
  


  ngOnDestroy(): void {
    this.paginationService.clearPagination(this.paginationConfig.id);
  }


  protected getReports$() {
    return this.usageReportService.searchStatistics(`${environment.rest.baseUrl}/api/core/sites/${this.siteId}`, 0, 5)
  }

sortArray(array,sortOrderIds){
  array.sort((a, b) => {
  return sortOrderIds.indexOf(a.id) - sortOrderIds.indexOf(b.id);
});
}

getItemById(id):any{
return  this.dsoService.findById(id)?.pipe(getFirstSucceededRemoteDataPayload()).subscribe((item)=>{
  return item

})
}
}


