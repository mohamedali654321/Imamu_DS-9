import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import {
  SortDirection,
  SortOptions,
} from "src/app/core/cache/models/sort-options.model";
import { RemoteData } from "src/app/core/data/remote-data";
import { PaginationService } from "src/app/core/pagination/pagination.service";
import { DSpaceObjectType } from "src/app/core/shared/dspace-object-type.model";
import { DSpaceObject } from "src/app/core/shared/dspace-object.model";
import { getFirstCompletedRemoteData } from "src/app/core/shared/operators";
import { SearchService } from "src/app/core/shared/search/search.service";
import { PaginationComponentOptions } from "src/app/shared/pagination/pagination-component-options.model";
import { PaginatedSearchOptions } from "src/app/shared/search/models/paginated-search-options.model";
import { SearchObjects } from "src/app/shared/search/models/search-objects.model";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class NavigationItemsService {
  resultsRDNavigation$ = new BehaviorSubject([]);
  currentResultsRDNavigation$ = this.resultsRDNavigation$.asObservable();

  resultRoute$ = new BehaviorSubject(null);
  currentResultRoute$ = this.resultRoute$.asObservable();

  resultRouteParams$ = new BehaviorSubject(null);
  currentResultRouteParams$ = this.resultRoute$.asObservable();

  searchoptions$ = new BehaviorSubject(null);
  currentSearchoptions$ = this.searchoptions$.asObservable();

  configuration$ = new BehaviorSubject(null);
  currentConfiguration$ = this.configuration$.asObservable();

collectionResultsRDNavigation$ = new BehaviorSubject([]);
  currentCollectionResultsRDNavigation$ = this.collectionResultsRDNavigation$.asObservable();

  counter$ = new BehaviorSubject(1);
  currentCounter$ = this.counter$.asObservable();
  paginationConfig: PaginationComponentOptions;
  sortConfig: SortOptions;
  constructor(
    private paginationService: PaginationService,
    private searchService: SearchService
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

  setCollectionResultsRDNavigation(results: any) {
    this.collectionResultsRDNavigation$.next(results);
  }


    setResultsRDNavigation(results: any) {
    this.resultsRDNavigation$.next(results);
  }

  setResultRoute(url: any) {
    this.resultRoute$.next(url);
  }

  setResultRouteParams(params: any) {
    this.resultRoute$.next(params);
  }

  setsearchoptions(option: any) {
    this.searchoptions$.next(option);
  }

  setConfiguration(option: any) {
    this.configuration$.next(option);
  }

  setCounter(page: any) {
    this.counter$.next(page);
  }

  retrieveSearchResults() {
    this.currentConfiguration$.subscribe((searchOptionsWithHidden) => {
      if (this.searchoptions$.getValue()?.pagination?.currentPage) {
        this.setCounter(
          searchOptionsWithHidden?.pagination?.currentPage
        );
      }
      this.searchService
        .search(
          new PaginatedSearchOptions({
            pagination: Object.assign(new PaginationComponentOptions(), {
              id: "spc",
              pageSize:
                searchOptionsWithHidden?.pagination?.currentPage &&
                searchOptionsWithHidden?.pagination?.currentPage > 10
                  ? 10
                  : 100,
              currentPage: this.counter$.getValue(),
              maxSize: 1,
            }),
            dsoTypes: [DSpaceObjectType.ITEM],
            scope: searchOptionsWithHidden?.scope,
            sort: searchOptionsWithHidden?.sort,
            query: searchOptionsWithHidden?.query,
            filters: searchOptionsWithHidden?.filters,
            fixedFilter: searchOptionsWithHidden?.fixedFilter,
            configuration: searchOptionsWithHidden?.configuration,
          }),
          undefined,
          undefined,
          undefined
        )
        .pipe(getFirstCompletedRemoteData())
        .subscribe((results: RemoteData<SearchObjects<DSpaceObject>>) => {
          if (results.hasSucceeded) {
            this.setResultsRDNavigation(results);
          }
        });
    });
  }

   retrieveSearchResultsByCollection(collectionId){
         this.searchService
            .search(
              new PaginatedSearchOptions({
                configuration: "collection",
                scope: collectionId,
                pagination: this.paginationConfig,
                dsoTypes: [DSpaceObjectType.ITEM],
                sort: this.sortConfig,
              }),
              undefined,
              undefined,
              undefined
            ).pipe(getFirstCompletedRemoteData())
    
  } 

  // retrieveSearchResultsByCollection(collectionId){
  //        this.searchService
  //           .search(
  //             new PaginatedSearchOptions({
  //               configuration: "collection",
  //               scope: collectionId,
  //               pagination: this.paginationConfig,
  //               dsoTypes: [DSpaceObjectType.ITEM],
  //               sort: this.sortConfig,
  //             }),
  //             undefined,
  //             undefined,
  //             undefined
  //           ).pipe(getFirstCompletedRemoteData()).subscribe((results: RemoteData<SearchObjects<DSpaceObject>>)=>{
  //              if (results.hasSucceeded){
  //                for (
  //               let page = 1;
  //               page <= results.payload?.pageInfo.totalPages;
  //               page++
  //             ){
  //                this.searchService
  //                 .search(
  //                   new PaginatedSearchOptions({
  //                     configuration: "collection",
  //                     scope: collectionId,
  //                     pagination: Object.assign(
  //                       new PaginationComponentOptions(),
  //                       {
  //                         id: "hp",
  //                         pageSize:100,
  //                         currentPage: page,
  //                         maxSize: 1,
  //                       }
  //                     ),
  //                     dsoTypes: [DSpaceObjectType.ITEM],
  //                     sort: this.sortConfig,
  //                   }),
  //                   undefined,
  //                   undefined,
  //                   undefined
  //                 ).pipe(getFirstCompletedRemoteData()).subscribe((results: RemoteData<SearchObjects<DSpaceObject>>)=>{
  //                   this.setCollectionResultsRDNavigation(results['payload']?.page)
  //                 })
  //             }
  //              }

  //           })
    
  // } 
}
