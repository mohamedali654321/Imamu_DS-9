// kware start edit -- issue.7.6.004
import { NgIf, AsyncPipe, NgClass } from '@angular/common';
import { Component, OnInit,HostListener, ElementRef  } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'ds-scroll-to-top',
  templateUrl: './scroll-to-top.component.html',
  styleUrls: ['./scroll-to-top.component.scss'],
  standalone: true,
  imports: [NgIf, AsyncPipe,NgClass, TranslateModule],
})
export class ScrollToTopComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  isShow: boolean;
  topPosToStartShowing = 100;

  @HostListener('window:scroll')
  checkScroll() {
    // window의 scroll top
    // Both window.pageYOffset and document.documentElement.scrollTop returns the same result in all the cases. window.pageYOffset is not supported below IE 9.

    const scrollPosition =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;

   

    if (scrollPosition >= this.topPosToStartShowing) {
      this.isShow = true;
    } else {
      this.isShow = false;
    }
  }

  // TODO: Cross browsing
  gotoTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

}
// kware end edit -- issue.7.6.004