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
    // for (let element of servicelines) {
    //   if (element.serviceDesc?.toLowerCase() === '104 helpline') {
    //     this.showUpload = true;
    //     return this.showUpload;
    //   }
    // }
    this.showUpload = true;
    return this.showUpload;
  }

  onFileUploadd(ev: any) {
    this.showProgressBar = true;
    this.file = undefined;

    this.fileList = ev.target.files;
    this.file = ev.target.files[0];

    //this.file = undefined;
    if (this.fileList.length === 0) {
      this.error1 = true;

      this.invalid_file_flag = false;
      this.inValidFileName = false;
      this.disableUpload = false;
      this.showProgressBar = false;
    } else {
      if (this.file) {
        const fileNameExtension = this.file.name.split('.');
        const fileName = fileNameExtension[0];
        if (fileName !== undefined && fileName !== null && fileName !== '') {
          const isvalid = this.checkExtension(this.file);

          if (isvalid) {
            if (this.fileList[0].size / 1000 / 1000 > this.maxFileSize) {
              console.log('File Size' + this.fileList[0].size / 1000 / 1000);

              this.error1 = false;
              this.invalid_file_flag = false;
              this.inValidFileName = false;
              this.disableUpload = false;
              this.showProgressBar = false;
            } else {
              this.error1 = false;

              this.invalid_file_flag = false;
              this.inValidFileName = false;
              this.disableUpload = false;

              const workBook: any = null;
              // let workBook : any;
              this.jsonData = null;
              const reader = new FileReader();

              // reader.onload = (event) => {
              //   const data = reader.result;
              //   workBook =  ExcelJS.read(data, { type: 'binary' });
              //   this.jsonData = workBook.SheetNames.reduce((initial: any, name: any) => {
              //     const sheet = workBook.Sheets[name];
              //     initial[name] = ExcelJS.utils.sheet_to_json(sheet);
              //     return initial;
              //   }, {});
              //  // this.dataString = JSON.stringify(jsonData.Sheet1);

              // }
              this.enableUPloadButton = false;
              reader.readAsBinaryString(this.file);

              const myReader: FileReader = new FileReader();
              myReader.onloadend = this.onLoadFileCallback.bind(this);
              myReader.readAsDataURL(this.file);
              this.invalid_file_flag = false;
              this.disableUpload = false;
            }
          } else {
            this.invalid_file_flag = true;
            this.inValidFileName = false;
            this.error1 = false;

            this.disableUpload = false;
            this.showProgressBar = false;
          }
        } else {
          //this.alertService.alert("Invalid file name", 'error');
          this.inValidFileName = true;
          this.invalid_file_flag = false;
          this.error1 = false;
          this.disableUpload = false;
          this.showProgressBar = false;
        }
      } else {
        this.invalid_file_flag = false;
        this.disableUpload = false;
        this.showProgressBar = false;
      }
    }
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

  // uploadFile() { debugger
  //   const fileExtenstion = this.file;
  //   const formData = new FormData();

  //   formData.append('file', fileExtenstion);
  //   formData.append('userName', this.dataService.uname)

  // const reader: FileReader = new FileReader();
  // reader.readAsBinaryString(target.files[0]);
  // reader.onload = (e: any) => {
  //   const binarystr: string = e.target.result;
  //   const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });
  //   const wsname: string = wb.SheetNames[0];
  //   const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  //   const data = XLSX.utils.sheet_to_json(ws);
  //   const xmlData = this.convertJsonToXml(data);
  // const reqObj = {
  //   fileName: this.file.name,
  //   fileExtension: fileExtenstion[fileExtenstion.length - 1],
  //   fileContent: this.fileContent,
  //   providerServiceMapID: this.dataService.providerServiceMapID_104,
  //   createdBy: this.dataService.uname,
  // };
  //   this.showProgressBar = true;
  //   this.blockSubcenterMappingService
  //     .uploadData(formData)
  //     .subscribe((response: any) => {
  //       if (response && response.statusCode === 200) {
  //         this.showProgressBar = false;
  //         this.alertService.alert('File Uploaded successfully', 'success');
  //         this.resetFileInput();
  //         this.file = undefined;
  //         this.fileContent = null;
  //         this.disableUpload = true;
  //       } else {
  //         this.showProgressBar = false;
  //         this.alertService.alert(response.errorMessage, 'error');
  //         this.resetFileInput();
  //         this.file = undefined;
  //         this.fileContent = null;
  //         this.disableUpload = true;
  //       }
  //     });
  //   (err: any) => {
  //     this.showProgressBar = false;
  //     this.alertService.alert(err.errorMessage, 'error');
  //     this.resetFileInput();
  //     this.file = undefined;
  //     this.fileContent = null;
  //     this.disableUpload = true;
  //   };
  // }

  onFileUpload(event: any) {
    // const fileExtenstion = this.file;
    // const formData = new FormData();

    // formData.append('file', fileExtenstion);
    // formData.append('userName', this.dataService.uname)

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
      this.blockSubcenterMappingService
        .memberBulkUploadXML(xmlData)
        .subscribe((response: any) => {
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
        });
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

  // formatDate(date: Date): string {
  //   const year = date.getFullYear();
  //   const month = String(date.getMonth() + 1).padStart(2, '0');
  //   const day = String(date.getDate()).padStart(2, '0');
  //   return `${year}-${month}-${day}`;
  // }

  // excelSerialToDate(serial: number): Date {
  //   const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
  //   const msPerDay = 86400000; // Number of milliseconds in a day
  //   return new Date(excelEpoch.getTime() + (serial - 2) * msPerDay);

  // }

  resetFileInput() {
    const fileInput = document.getElementById(
      'upload-file',
    ) as HTMLInputElement;
    fileInput.value = '';
  }
}
