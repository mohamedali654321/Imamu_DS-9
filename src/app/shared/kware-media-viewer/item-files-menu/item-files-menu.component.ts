/* eslint-disable lodash/import-scope */
/* eslint-disable unused-imports/no-unused-imports */
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { Bitstream } from 'src/app/core/shared/bitstream.model';
import { Item } from 'src/app/core/shared/item.model';
import { MediaViewerService } from '../services/media-viewer.service';
import { BehaviorSubject } from 'rxjs';
import { ViewerFileComponent } from '../item-file/viewer-file.component';
import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { StopContextMenuDirective } from '../../kware-custom-directives/stop-context-menu-directive/stop-context-menu.directive';
import { ThemedLoadingComponent } from '../../loading/themed-loading.component';
import { TranslateModule } from '@ngx-translate/core';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { FilesDownloadAsZipFileService } from '../services/files-download-as-zip-file.service';
import { DSONameService } from 'src/app/core/breadcrumbs/dso-name.service';

@Component({
  selector: 'ds-item-files-menu',
  templateUrl: './item-files-menu.component.html',
  styleUrls: ['./item-files-menu.component.scss'],
  standalone:true,
  providers:[FilesDownloadAsZipFileService],
  imports:[ViewerFileComponent,NgIf,NgFor,AsyncPipe ,NgClass,StopContextMenuDirective,ThemedLoadingComponent,TranslateModule,NgbAccordionModule]
})
export class ItemFilesMenuComponent implements OnInit {
  @ViewChild('filesListContainer', { static: false })
  filesListContainer: ElementRef;
  @ViewChildren('filesIds') filesIds: QueryList<any>;
  @ViewChild(CdkVirtualScrollViewport) virtualScroll: CdkVirtualScrollViewport;
  @Input() item: Item;
  @Input() bitstreams:BehaviorSubject<Bitstream[]>;
  @Input() totalElements: number;
  @Input() isLoading: boolean;
  @Input() isEmptyList: boolean;
  @Input() isLastPage = false;
  @Input() isMobile: boolean;
  @Input() viewerPanelsStatus: any;
  @Output() scrollingFinished = new EventEmitter<void>();

  items$ = new BehaviorSubject([]);
   totalSize = new BehaviorSubject<number>(0);


  pageSize = 20;
  pageNumber = 1;

  fetchedRanges = new Set<number>();


  selectedFile = 0;
  itemSize = 20;
  emitted = false;

  filesLinksNames =[];

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if ((event.target.offsetHeight + event.target.scrollTop) >= (event.target.scrollHeight - 10) && !this.isLoading && !this.isLastPage) {
      this.scrollingFinished.emit();
    }
  }
  constructor(private viewerService: MediaViewerService,
    private http: HttpClient,
    private filesDownloadAsZipFile :FilesDownloadAsZipFileService,
    public dsoNameService: DSONameService,
  ) { }

  ngOnInit(): void {
    this.viewerService.selectedFile.subscribe(fileIndex => {
      if (this.selectedFile !== fileIndex) {
        this.selectedFile = fileIndex;
      }
    });
      this.bitstreams.subscribe(res=>{
        this.filesLinksNames=res;
      res.forEach(file=>{
        this.totalSize.next(this.totalSize.getValue()+file['sizeBytes'])
       
      })
    })    
  }

  selectedFileClickEvent($event: number) {
    this.selectedFile = $event;
    this.viewerService.setSelectedFileIndex($event);
  }

  onScrollingFinished() {
    this.scrollingFinished.emit();
  }

  handleSeletctedFile() {
    const currentElement = this.filesIds
      .toArray()
      .find((file) => file.fileIndex === this.selectedFile);

    this.viewerService.setFileMetadata({
      id: currentElement.bitstream.id,
      format: currentElement.bitstream?.format,
      name: currentElement.bitstream?.name,
      canDownload: currentElement.bitstream?.canDownload,
      canRequestACopy: currentElement.bitstream?.canRequestACopy,
      bitstreamPath: currentElement.bitstream?.bitstreamPath,
      contentLink: currentElement.bitstream?.contentLink,
    });
    currentElement.scrollToView();
    if (this.isMobile) {
      this.viewerService.setViewerPanelsStatus({
        isFilesMenuOpen: false,
        isViewerPanelOpen: true,
      });
    } else {
      this.viewerService.setViewerPanelsStatus({
        isFilesMenuOpen: true,
        isViewerPanelOpen: true,
      });
    }
  }

  getNextFile() {
    if (!this.selectedFile && this.selectedFile !== 0) {
      this.selectedFile = 0;
      this.viewerService.setSelectedFileIndex(0);
    } else {
      this.selectedFile++;
      this.viewerService.setSelectedFileIndex(this.selectedFile);
    }
    this.handleSeletctedFile();
  }

  getPrevFile() {
    this.selectedFile--;
    this.viewerService.setSelectedFileIndex(this.selectedFile);
    this.handleSeletctedFile();
  }

  trackByIdx(i, item) {
    return item.id;
  }

  setViewerPanelStatus() {
    if (this.isMobile) {
      this.viewerService.setViewerPanelsStatus({
        isFilesMenuOpen: !this.viewerPanelsStatus.isFilesMenuOpen,
        isViewerPanelOpen: !this.viewerPanelsStatus.isViewerPanelOpen,
      });
    } else {
      this.viewerService.setViewerPanelsStatus({
        isFilesMenuOpen: !this.viewerPanelsStatus.isFilesMenuOpen,
        isViewerPanelOpen: true,
      });
    }
  }

     formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes'

    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

  downloadFiles() {
    const zipFileName = this.dsoNameService.getName(this.item);
    this.filesDownloadAsZipFile.downloadFilesAsZip(this.filesLinksNames, zipFileName);
  }
}
