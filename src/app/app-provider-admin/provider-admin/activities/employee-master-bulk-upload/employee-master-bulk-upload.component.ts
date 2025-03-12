import { Component, OnInit } from '@angular/core';
import { BlockSubcenterMappingService } from '../services/block-subcenter-mapping-service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-employee-master-bulk-upload',
  templateUrl: './employee-master-bulk-upload.component.html',
  styleUrls: ['./employee-master-bulk-upload.component.css'],
})
export class EmployeeMasterBulkUploadComponent {
  file: any;
  fileList!: FileList;
  error1 = false;
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

  constructor(
    public dataService: dataService,
    public blockSubcenterMappingService: BlockSubcenterMappingService,
    public alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.userID = this.dataService.uid;
    const servicelines = this.dataService.userPriveliges;

    this.showUpload = true;
    return this.showUpload;
  }

  checkExtension(file: any) {
    let count = 0;
    console.log('FILE DETAILS', file);
    if (file) {
      const array_after_split = file.name.split('.');
      if (array_after_split.length === 2) {
        const file_extension = array_after_split[array_after_split.length - 1];
        for (let i = 0; i < this.valid_file_extensions.length; i++) {
          if (
            file_extension.toUpperCase() ===
            this.valid_file_extensions[i].toUpperCase()
          ) {
            count = count + 1;
          }
        }
        if (count > 0) {
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    } else {
      return true;
    }
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
            this.showProgressBar = false;
            this.alertService.alert('File Uploaded successfully', 'success');
            this.resetFileInput();
            this.file = undefined;
            this.successcount = true;
            this.fileuploadedCount = response.registeredUser;
            this.filetotalCount = response.totalUser;
            this.errorloglist = response.error;
          } else {
            this.showProgressBar = false;
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.showProgressBar = false;
          this.alertService.alert(err.errorMessage, 'error');
          this.resetFileInput();
          this.file = undefined;
          this.fileContent = null;
          this.disableUpload = true;
        },
      );
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
}
