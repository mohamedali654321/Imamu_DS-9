import { MediaViewerService } from "../services/media-viewer.service";
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { Item } from "../../../core/shared/item.model";
import { ItemFileIconComponent } from "../item-file-icon/item-file-icon.component";
import { AsyncPipe, NgClass, NgIf, NgStyle } from "@angular/common";
import { DSONameService } from "src/app/core/breadcrumbs/dso-name.service";
import { Bitstream } from "src/app/core/shared/bitstream.model";
import { BehaviorSubject, Observable } from "rxjs";
import { NgbAccordionModule, NgbTooltipModule } from "@ng-bootstrap/ng-bootstrap";
import { StopContextMenuDirective } from "../../kware-custom-directives/stop-context-menu-directive/stop-context-menu.directive";
import { ThemedFileDownloadLinkComponent } from "../../file-download-link/themed-file-download-link.component";
import { FileSizePipe } from "../../utils/file-size-pipe";
import { FileService } from "src/app/core/shared/file.service";
import { FileDownloadService } from "../services/file-download.service";
import { TranslateModule } from "@ngx-translate/core";
import { getBitstreamRequestACopyRoute } from "src/app/app-routing-paths";
import { Router, RouterLink, UrlSerializer } from "@angular/router";
import { VarDirective } from "../../utils/var.directive";

@Component({
  selector: "ds-viewer-file",
  templateUrl: "./viewer-file.component.html",
  styleUrls: ["./viewer-file.component.scss"],
  standalone: true,
  imports: [
    ItemFileIconComponent,
    RouterLink,
    AsyncPipe,
    NgIf,
    NgStyle,
    VarDirective,
    NgClass,
    NgbAccordionModule,
    TranslateModule,
    StopContextMenuDirective,
    ThemedFileDownloadLinkComponent,
    FileSizePipe,
    NgbTooltipModule
  ],
})
export class ViewerFileComponent {
  @Input() bitstream: Bitstream;
  @Input() bitstreams: BehaviorSubject<Bitstream[]>;
  @Input() item: Item;
  @Input() fileIndex;
  @Input() currentFileIndex: number;
  @Output() selectedFileEmitter = new EventEmitter<number>();
  @ViewChild("selectedFileRef") selectedFileRef: ElementRef<any>;
  @Input() isMobile: boolean;
  @Input() viewerPanelsStatus: any;

  baseImage: any;
  waterMarkImage: any;
  canvas: any;
  isLoadingImage: boolean;
  fileFormat: string;
  isEvenIndex: boolean;
  routerLinkReqACopy: string;
  queryParamsReqACopy: any;
  bitstreamURL = new BehaviorSubject(null);
  constructor(
    private viewerService: MediaViewerService,
    public dsoNameService: DSONameService,
    private fileService: FileService,
    private fileDownload: FileDownloadService,
    private router: Router,
    private serializer: UrlSerializer
  ) {}

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.isEvenIndex = this.fileIndex % 2 === 0 ? true : false;
    this.routerLinkReqACopy = getBitstreamRequestACopyRoute(
      this.item,
      this.bitstream
    ).routerLink;
    this.queryParamsReqACopy = getBitstreamRequestACopyRoute(
      this.item,
      this.bitstream
    ).queryParams;
    this.bitstream["canDownload"].subscribe((res) => {
      console.log(res);
    });
  }

  emitMediaViewerSwitcher() {
    this.viewerService.setFileMetadata({
      id: this.bitstream.id,
      format: this.bitstream?.format,
      name: this.bitstream?.name,
      canDownload: this.bitstream["canDownload"],
      canRequestACopy: this.bitstream["canRequestACopy"],
      bitstreamPath: this.bitstream["bitstreamPath"],
      contentLink: this.bitstream["contentLink"],
    });
    this.selectedFileEmitter.emit(this.fileIndex);
    this.scrollToView();

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

  scrollToView() {
    this.selectedFileRef?.nativeElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  }

  formatBytes(bytes, decimals = 2) {
    if (!+bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  download(canDownload) {
    if (canDownload) {
      const url = this.bitstream._links.content.href;
      this.fileDownload.downloadFile(url).subscribe((blob) => {
        const a = document.createElement("a");
        const objectUrl = URL.createObjectURL(blob);
        a.href = objectUrl;
        a.download = this.bitstream.metadata["dc.title"][0]["value"];
        a.click();
        URL.revokeObjectURL(objectUrl);
      });
    } else {
      const tree = this.router.createUrlTree(
        [
          `${
            getBitstreamRequestACopyRoute(this.item, this.bitstream).routerLink
          }`,
        ],
        {
          queryParams: {
            bitstream: getBitstreamRequestACopyRoute(this.item, this.bitstream)
              .queryParams.bitstream,
          },
        }
      );
      const url = this.serializer.serialize(tree);
      window.open(url, "_blank");
      //   void this.router.navigate([`${getBitstreamRequestACopyRoute(this.item, this.bitstream).routerLink}`], {
      //   queryParams: { 'bitstream': getBitstreamRequestACopyRoute(this.item, this.bitstream).queryParams.bitstream },
      //   queryParamsHandling: 'merge'
      // });
    }
  }
}
