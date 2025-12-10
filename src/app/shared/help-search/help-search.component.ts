// kware start edit -- issue.7.6.003
import { Component, OnInit } from '@angular/core';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService 
@Component({
  selector: 'ds-help-search',
  templateUrl: './help-search.component.html',
  styleUrls: ['./help-search.component.scss'],
  standalone:true,
  imports:[TranslateModule,NgbDropdownModule]
})
export class HelpSearchComponent implements OnInit {

  constructor(
    private localeService : LocaleService , /* kware edit - call service from LocaleService */
  ) {
    
  }

   links=[{
    label:"text",
    link:"http://dspace-wiki.kwaretech.com/"+this.localeService.getCurrentLanguageCode()+"/DSpace/functional-overview"
  }]
  lang=this.localeService.getCurrentLanguageCode();
 

  ngOnInit(): void {
   
  }

}
// kware end edit -- issue.7.6.003