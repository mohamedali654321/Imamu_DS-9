import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from 'src/app/core/locale/locale.service';

@Component({
  selector: 'ds-end-user-agreement-content',
  templateUrl: './end-user-agreement-content.component.html',
  styleUrls: ['./end-user-agreement-content.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    TranslateModule,
    NgIf
  ],
})
/**
 * Component displaying the contents of the End User Agreement
 */
export class EndUserAgreementContentComponent {
    //kware-edit
  constructor(
    public localeService: LocaleService ,/* kware edit - call service from LocaleService */
  ){}
  currentLocale: boolean = this.localeService.getCurrentLanguageCode() === 'ar' ? false : true;
  //kware-edit end
}

