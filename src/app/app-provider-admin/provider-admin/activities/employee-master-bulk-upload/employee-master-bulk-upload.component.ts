import {
  Component,
  ViewChild,
  OnInit,
  Output,
  EventEmitter,
} from '@angular/core';
import { BlockSubcenterMappingService } from '../services/block-subcenter-mapping-service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import * as XLSX from 'xlsx';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-employee-master-bulk-upload',
  templateUrl: './employee-master-bulk-upload.component.html',
  styleUrls: ['./employee-master-bulk-upload.component.css'],
})
export class EmployeeMasterBulkUploadComponent {
  @Output() closeUpload = new EventEmitter<void>();
  objs = new MatTableDataSource<any>();

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  filteredsearchResult = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResult.paginator = this.paginator;
    // this.objs.paginator = this.paginator;
  }

  file: any;
  fileList!: FileList;
  error1 = false;
  error2 = false;
  successcount = false;
  invalid_file_flag = false;
  inValidFileName = false;
  maxFileSize = 5.0;
  jsonData: any;
  enableUPloadButton = false;
  valid_file_extensions = ['xls', 'xlsx', 'xlsm', 'xlsb'];
  fileContent: any;
  userID: any;
  showProgressBar = false;
  disableUpload = true;
  showUpload = false;
  fileuploadedCount = 0;
  filetotalCount = 0;
  errorloglist: any;

  tableMode = true;
  editMode = false;

  constructor(
    public dataService: dataService,
    public blockSubcenterMappingService: BlockSubcenterMappingService,
    public alertService: ConfirmationDialogsService,
    public dialog: MatDialog,
    private location: Location,
  ) {}

  ngOnInit() {
    this.userID = this.dataService.uid;
    const servicelines = this.dataService.userPriveliges;

    this.showUpload = true;
    return this.showUpload;
  }

  onLoadFileCallback = (event: any) => {
    this.fileContent = event.currentTarget.result;
    this.showProgressBar = false;
  };

  onFileUpload(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }

    const file = target.files[0];

    // Validate file size (e.g., max size 10 MB)
    const maxSizeInMB = 5; // Set your max file size (in MB)
    const fileSizeInMB = file.size / 1000 / 1000; // Convert file size to MB

    // Check if the file size exceeds the limit
    if (fileSizeInMB > maxSizeInMB) {
      this.alertService.alert(
        `File size exceeds the maximum allowed size of ${maxSizeInMB} MB`,
        'error',
      );
      this.resetFileInput();
      return; // Exit early if the file is too large
    }

    // Validate file extension

    const valid_file_extensions = ['.xls', '.xlsx', '.xlsm']; // Define the allowed extensions
    const fileExtension = file.name.split('.').pop()?.toLowerCase(); // Extract file extension

    // Check if the file extension is valid
    if (
      !fileExtension ||
      !valid_file_extensions.includes(`.${fileExtension}`)
    ) {
      this.alertService.alert(
        'Invalid file extension. Please upload a valid Excel',
        'error',
      );
      this.resetFileInput();
      return; // Exit early if the extension is not valid
    }

    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const xmlData = this.convertJsonToXml(data);

      this.showProgressBar = true;
      this.blockSubcenterMappingService.memberBulkUploadXML(xmlData).subscribe(
        (response: any) => {
          if (response) {
            this.fileuploadedCount = response.registeredUser;
            this.filetotalCount = response.totalUser;

            if (
              Number(this.fileuploadedCount) !== Number(this.filetotalCount)
            ) {
              this.downloadFile();
            }
            this.showProgressBar = false;
            this.alertService.alert('File Uploaded', 'success');

            this.resetFileInput();
            this.file = undefined;
            this.successcount = true;

            this.errorloglist = response.error;
          } else {
            this.showProgressBar = false;
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (error: HttpErrorResponse) => {
          if (
            !navigator.onLine ||
            (error.status === 0 && error.error instanceof ProgressEvent)
          ) {
            this.showProgressBar = false;
            this.alertService.alert(
              'Internet connection not available!',
              'error',
            );
          }
        },
      );
      (err: any) => {
        this.showProgressBar = false;
        this.alertService.alert(err.errorMessage, 'error');
        this.resetFileInput();
        this.file = undefined;
        this.fileContent = null;
        this.disableUpload = true;
      };
    };
  }

  convertJsonToXml(json: any): string {
    const xml = ['<Employees>\n'];
    json.forEach((item: any) => {
      xml.push('<Employee>\n');
      for (const [key, value] of Object.entries(item)) {
        xml.push(`<${key}>${value}</${key}>\n`);
      }
      xml.push('</Employee>\n');
    });

    xml.push('</Employees>\n');
    return xml.join('');
  }

  resetFileInput() {
    const fileInput = document.getElementById(
      'upload-file',
    ) as HTMLInputElement;
    fileInput.value = '';
  }

  downloadMaster() {
    const filePath = 'assets/bulkuser_excel_sheet.xlsx';

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = filePath;
    link.download = 'bulkuser_excel_sheet.xlsx'; // Set the file name when downloaded

    // Trigger the click event on the anchor element to initiate the download
    link.click();
  }

  downloadFile(): void {
    this.blockSubcenterMappingService.downloadErrorExcel().subscribe(
      (blob: Blob) => {
        const link = document.createElement('a');
        const url = window.URL.createObjectURL(blob); // Create a URL for the Blob
        link.href = url;
        link.download = 'Error-log-file.xlsx'; // Set the desired filename
        link.click(); // Programmatically trigger the download
        window.URL.revokeObjectURL(url); // Clean up the URL object
      },
      (error) => {
        console.error('Download failed', error);
      },
    );
  }

  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.closeUpload.emit();
        }
      });
  }
}
