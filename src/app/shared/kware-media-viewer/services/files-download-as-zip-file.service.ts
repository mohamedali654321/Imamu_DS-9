import { Injectable } from '@angular/core';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root'
})
export class FilesDownloadAsZipFileService {

  constructor() { }

    async downloadFilesAsZip(bitstreams:any, zipFileName: string) {
    const zip = new JSZip();

    // Fetch each file and add it to the zip
    for (const bitstream of bitstreams) {
  
      const response = await fetch(bitstream._links.content.href);
      const blob = await response.blob();
      const fileName = bitstream.metadata["dc.title"][0]["value"]; // Extract file name from URL
      zip.file(fileName, blob);
    }

    // Generate the zip file
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, zipFileName);
  }
}
