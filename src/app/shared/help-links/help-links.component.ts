// kware start edit -- issue.7.6.003
import { NgIf, AsyncPipe, NgClass } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from 'src/app/core/locale/locale.service'; // import LocaleService 
import { fadeInOut, fadeOut } from '../animations/fade';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'ds-help-links',
  templateUrl: './help-links.component.html',
  styleUrls: ['./help-links.component.scss'],
  standalone: true,
  animations: [fadeInOut, fadeOut],
  imports: [NgIf, AsyncPipe,NgClass, TranslateModule,NgbDropdownModule],
})
export class HelpLinksComponent implements OnInit {

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