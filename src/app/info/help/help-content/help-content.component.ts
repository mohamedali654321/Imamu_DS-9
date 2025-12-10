import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LocaleService } from 'src/app/core/locale/locale.service'; //kware-edit
import { hasValue } from 'src/app/shared/empty.util';
@Component({
  selector: 'ds-help-content',
  templateUrl: './help-content.component.html',
  styleUrls: ['./help-content.component.scss'],
  standalone: true,
  imports:[TranslateModule,NgIf,NgFor,NgbNavModule,AsyncPipe,RouterLink]
})
/**
 * Component displaying the contents of the Privacy Statement
 */
export class HelpContentComponent {
    /**
   * The active tab
   */
    activeTab$: Observable<string>;

    activeSubTab$: Observable<string>;

  //kware-edit
  constructor(
    public localeService: LocaleService ,/* kware edit - call service from LocaleService */
    private route: ActivatedRoute,
    private router: Router
  ){}
  currentLocale: boolean = this.localeService.getCurrentLanguageCode() === 'ar' ? false : true;

  ngOnInit(): void {

  
      document.getElementById(`${this.route.snapshot.fragment}`).style.scrollMarginTop ='67px';
      document.getElementById(`${this.route.snapshot.fragment}`).scrollIntoView({behavior: "smooth"});
     
      this.updateUrl(this.route.queryParams['_value']['tab'] , this.route.queryParams['_value']['subTab'],this.route.snapshot.fragment)
  

    // document.getElementById(`${scrollingArea}`).style.scrollMarginTop ='67px';
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.activeTab$ = this.route.queryParams.pipe(
      map((params) => params.tab)
    );

    this.activeSubTab$ = this.route.queryParams.pipe(
      map((params) => params.subTab)
    );

 
  }

  ngAfterViewInit(){
    if(hasValue(this.route.snapshot.fragment) ) {
      document.getElementById(`${this.route.snapshot.fragment}`).style.scrollMarginTop ='67px';
      document.getElementById(`${this.route.snapshot.fragment}`).scrollIntoView({behavior: "smooth"});
     }
  
   }
  updateUrl(tab: string ,subTab:string,scrollingArea:string) {
    if(hasValue(tab) && hasValue(subTab)){
     this.route.data.subscribe(res=>{
       res.breadcrumb.url
       window.history.replaceState({},'',`${res.breadcrumb.url}?tab=${tab}&subTab=${subTab}#${scrollingArea}`);
       })
    }
    else if(hasValue(tab) ){
      this.route.data.subscribe(res=>{
        res.breadcrumb.url
        window.history.replaceState({},'',`${res.breadcrumb.url}?tab=${tab}#${scrollingArea}`);
        })
     }
     else if(hasValue(subTab) ){
      this.route.data.subscribe(res=>{
        res.breadcrumb.url
        window.history.replaceState({},'',`${res.breadcrumb.url}?subTab=${subTab}#${scrollingArea}`);
        })
     }
     else{
      this.route.data.subscribe(res=>{
        res.breadcrumb.url
        window.history.replaceState({},'',`${res.breadcrumb.url}#${scrollingArea}`);
        })

     }
     document.getElementById(`${scrollingArea}`).style.scrollMarginTop ='67px';
 
     
   }



   updateSubUrl(event: any,filter: string) {
    if(hasValue(filter)){
     this.route.data.subscribe(res=>{
       res.breadcrumb.url
       window.history.replaceState({},'',`${res.breadcrumb.url}?subTab=${filter}`);
       })
    }
 
     
   }

   goToPart(scrollingArea:string){
    this.updateUrl(this.route.queryParams['_value']['tab'] , this.route.queryParams['_value']['subTab'],scrollingArea)
    document.getElementById(`${scrollingArea}`).style.scrollMarginTop ='67px';
    document.getElementById(`${scrollingArea}`).scrollIntoView({behavior: "smooth"});
  
    }
  //kware-edit end

    /**
   * Add a "tab" query parameter to the URL when changing tabs
   * @param event
   */
    onTabChange(event) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          tab: event.nextId,
          
        },
        queryParamsHandling: 'merge',
      
      });
    }

    onSubTabChange(event) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          subTab: event.nextId
        },
        queryParamsHandling: 'merge',
      
      });
    }
  
}
