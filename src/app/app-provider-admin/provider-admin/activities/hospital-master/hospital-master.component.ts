/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { HospitalMasterService } from '../services/hospital-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
import { InstituteTypeMasterService } from '../services/institute-type-master-service.service';
import { Subscription, Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-hospital-master',
  templateUrl: './hospital-master.component.html',
  styleUrls: ['./hospital-master.component.css'],
})
export class HospitalMasterComponent implements OnInit {
  [x: string]: any;
  filteredsearchResultArray = new MatTableDataSource<any>();
  enableUPload = true;
  dataString: any;
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.filteredsearchResultArray.paginator = this.paginator;
  }

  value: any;
  timerSubscription!: Subscription;
  refresh = true;
  status: any;
  modDate: any;
  fileRes: any;
  createdBy: any;
  fileSizeIsMoreThanRequired = true;
  error1 = false;
  error2 = false;
  fileContent: any;
  invalid_file_flag = false;
  inValidFileName = false;
  valid_file_extensions = ['xls', 'xlsx', 'xlsm', 'xlsb'];
  file: any;
  fileList!: FileList;
  maxFileSize = 5.0;
  institutionType: any;
  InstitutionTypes: any = [];
  // filteredsearchResultArray: any = [];
  userID: any;
  /*ngModels*/
  serviceProviderID: any;
  providerServiceMapID: any;
  state: any;
  service: any;
  district: any;
  taluk: any;

  institutionName: any;
  address: any;
  website: any;

  contact_person_name: any;
  contact_number: any;
  emailID: any;

  secondary_contact_person_name: any;
  secondary_contact_number: any;
  secondary_emailID: any;

  tertiary_contact_person_name: any;
  tertiary_contact_number: any;
  tertiary_emailID: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  districts: any = [];
  taluks: any = [];
  searchResultArray: any = [];

  /*flags*/
  disabled_flag = false;
  showTableFlag = false;
  showFormFlag = false;
  disableSecFields = false;
  disableTertiaryFields = false;

  /*regEx*/

  website_expression: any =
    /^(http[s]?:\/\/)?(www\.)?[a-zA-Z0-9]+[a-zA-Z]{2,5}\.?/;

  email_expression =
    /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;
  name_expression: any = /^[a-zA-Z ]*$/;
  mobileNoPattern = /^[1-9][0-9]{9}/;

  @ViewChild('institutionForm1')
  institutionForm1!: NgForm;
  @ViewChild('uploadForm')
  uploadForm!: NgForm;
  enableUPloadButton = true;
  jsonData: any;
  serviceproviderid!: string;
  currentLanguageSet: any;

  displayedColumns: string[] = [
    'SNo',
    'InstitutionName',
    'Address',
    'Website',
    'ContactPerson',
    'ContactNumber',
    'EmailID',
    'edit',
    'action',
  ];

  constructor(
    public HospitalMasterService: HospitalMasterService,
    public _instituteTypeMasterService: InstituteTypeMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServices(this.userID);
  }

  onFileUpload(ev: any) {
    this.file = undefined;

    this.fileList = ev.target.files;
    this.file = ev.target.files[0];

    //this.file = undefined;
    if (this.fileList.length === 0) {
      this.error1 = true;
      this.error2 = false;
      this.invalid_file_flag = false;
      this.inValidFileName = false;
    } else {
      if (this.file) {
        const fileNameExtension = this.file.name.split('.');
        const fileName = fileNameExtension[0];
        if (fileName !== undefined && fileName !== null && fileName !== '') {
          const isvalid = this.checkExtension(this.file);
          console.log(isvalid, 'VALID OR NOT');
          if (isvalid) {
            if (this.fileList[0].size / 1000 / 1000 > this.maxFileSize) {
              console.log('File Size' + this.fileList[0].size / 1000 / 1000);
              this.error2 = true;
              this.error1 = false;
              this.invalid_file_flag = false;
              this.inValidFileName = false;
            } else {
              this.error1 = false;
              this.error2 = false;
              this.invalid_file_flag = false;
              this.inValidFileName = false;

              let workBook: any = null;
              this.jsonData = null;
              const reader = new FileReader();

              reader.onload = (event) => {
                const data = reader.result;
                workBook = XLSX.read(data, { type: 'binary' });
                this.jsonData = workBook.SheetNames.reduce(
                  (initial: any, name: any) => {
                    const sheet = workBook.Sheets[name];
                    initial[name] = XLSX.utils.sheet_to_json(sheet);
                    return initial;
                  },
                  {},
                );
                // this.dataString = JSON.stringify(jsonData.Sheet1);
              };
              this.enableUPloadButton = false;
              reader.readAsBinaryString(this.file);

              const myReader: FileReader = new FileReader();
              myReader.onloadend = this.onLoadFileCallback.bind(this);
              myReader.readAsDataURL(this.file);
              this.invalid_file_flag = false;
            }
          } else {
            this.invalid_file_flag = true;
            this.inValidFileName = false;
            this.error1 = false;
            this.error2 = false;
          }
        } else {
          //this.alertService.alert("Invalid file name", 'error');
          this.inValidFileName = true;
          this.invalid_file_flag = false;
          this.error2 = false;
          this.error1 = false;
        }
      } else {
        this.invalid_file_flag = false;
      }

      // const validFormat = this.checkExtension(this.file);
      // if (validFormat) {
      //   this.invalid_file_flag = false;
      // } else {
      //   this.invalid_file_flag = true;
      // }
      // if (this.file
      //   && ((this.file.size / 1024) / 1024) <= this.maxFileSize
      //   && ((this.file.size / 1024) / 1024) > 0) {
      //   const myReader: FileReader = new FileReader();
      //   myReader.onloadend = this.onLoadFileCallback.bind(this)
      //   myReader.readAsDataURL(this.file);
      // }

      // else if (this.fileList.length > 0 && this.fileList[0].size / 1024 / 1024 <= this.maxFileSize) {
      //   console.log(this.fileList[0].size / 1024 / 1024, "FILE SIZE1");
      //   this.error1 = false;
      //   this.error2 = false;
      // }
      // else if (this.fileList[0].size / 1024 / 1024 === 0) {
      //   console.log(this.fileList[0].size / 1024 / 1024, "FILE SIZE1");
      //   this.error1 = false;
      //   this.error2 = true
      // }
      // else if (this.fileList[0].size / 1024 / 1024 > this.maxFileSize) {
      //   console.log(this.fileList[0].size / 1024 / 1024, "FILE SIZE1");
      //   this.error1 = true;
      //   this.error2 = false;
      // }

      // if (((this.file.size / 1024) / 1024) > this.maxFileSize) {
      //   this.fileSizeIsMoreThanRequired = true;
      // } else {
      //   this.fileSizeIsMoreThanRequired = false;
      // }
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
  };

  onSubmit() {
    console.log(this.fileList[0]);

    const file: File = this.fileList[0];
    // let formData:FormData = new FormData();
    /* let requestData = {
          'userID': this.userID,
          'createdBy': this.createdBy,
          'fileName': (this.file !== undefined) ? this.file.name : '',
          'fileExtension': (this.file !== undefined) ? '.' + this.file.name.split('.')[1] : '',
          'fileContent': (this.fileContent !== undefined) ? this.fileContent.split(',')[1] : ''
        };*/
    // formData.append('file', file, file.name);
    // formData.append('request', JSON.stringify(requestData));

    const requestData = {
      //'InstitutionDetails' : this.dataString,
      InstitutionDetails: this.jsonData.Sheet1,
      userID: Number(this.userID),
      serviceProviderID: Number(this.serviceProviderID),
      createdBy: this.commonDataService.uname,
    };
    this.HospitalMasterService.postFormData(requestData).subscribe(
      (response: any) => {
        //this.autoRefresh(true);
        // loaderDialog.close();
        //console.log(response.json());
        //console.log(response.json().statusCode == 5000);
        //console.log(response.json().errorMessage.indexOf('The process cannot access the file because it is being used by another process') != -1);
        /*if (response.json().statusCode == 5000 && response.json().errorMessage.indexOf('The process cannot access the file because it is being used by another process') != -1) {
              this.alertService.confirm('File is used in another process.Please close and try again', 'error')
                .subscribe(() => {
                  this.uploadForm.resetForm();
                })
            }
            else */
        console.log('Response', response);
        if (response.statusCode === 5000 && response.errorMessage) {
          if (response.data) {
            this.alertService.confirm('error', response.data).subscribe(() => {
              this.uploadForm.resetForm();
            });
          } else {
            this.alertService
              .confirm('error', response.status)
              .subscribe(() => {
                this.uploadForm.resetForm();
              });
          }
        } else {
          this.uploadForm.resetForm();
          this.file = undefined;
          this.alertService.confirm('info', response.data.response);
        }
      },
      (error) => {
        // loaderDialog.close();
        console.log(error);
        this.alertService
          .confirm('Error while uploading excel file', 'error')
          .subscribe(() => {
            this.uploadForm.resetForm();
            this.file = undefined;
          });
      },
    );
    this.enableUPloadButton = true;
  }

  /* autoRefresh(val) {
        this.refresh = val;
        if (val) {
          this.uploadStatus();
          const timer = Observable.interval(5 * 1000);
          this.timerSubscription = timer.subscribe(() => {
            this.uploadStatus();
          });
        }
        else {
          this.timerSubscription.unsubscribe();
        }
      }*/
  /*uploadStatus() {
        this.HospitalMasterService.getUploadStatus(this.providerServiceMapID).subscribe(res => {
    
          if(!res.hasOwnProperty('fileStatus')){
            if (this.timerSubscription)
            this.timerSubscription.unsubscribe();
    
            this.alertService.alert("No file uploaded");
          }
          else if(res.fileStatus.fileStatus == 'New') {
            this.value = 1;
            this.status = res.fileStatus.fileStatus;
            this.modDate = res.createdDate;
            this.fileRes = res;
          }
          else if(res.fileStatus.fileStatus == 'InProgress'){
            this.calculateValue(res);      
            this.status = res.fileStatus.fileStatus;
            this.modDate = res.createdDate;
            this.fileRes = res;
          }
          else if(res.fileStatus.fileStatus == "Completed" || res.fileStatus.fileStatus == "Failed"){
            this.timerSubscription.unsubscribe();
            this.status = res.fileStatus.fileStatus;
            this.modDate = res.createdDate;
            this.fileRes = res;
          }
        },
          (err) => {
          //     this.status =  { "fileID": "578", "fileName": "Mother Data Assam Trial One v1.xlsx", "fileStatusID": "3", "userID": "679", "validRecordCount": "21024", "erroredRecordCount": "0", "validRecordUpload": "21024", "erroredRecordUpload": "0", "isMother": true, "providerServiceMapID": "1252", "md5CheckSum": "f6e4dce6c8a94cd40816999cf4358e5d", "statusReason": "21024 valid and 0 invalid records.", "deleted": false, "createdBy": "manta", "createdDate": "2018-09-03T00:00:00.000Z", "modifiedBy": "manta", "fileStatus": { "fileStatusID": "3", "fileStatus": "Completed", "deleted": false, "createdBy": "Admin", "createdDate": "2018-09-03T00:00:00.000Z", "lastModDate": "2018-09-03T00:00:00.000Z" } };
    
            this.alertService.alert(err.status,"error");
            if (this.timerSubscription)
            this.timerSubscription.unsubscribe();
          });
      }
      calculateValue(res){
        this.value = ((parseInt(res.validRecordUpload) + parseInt(res.erroredRecordUpload))*100/(parseInt(res.validRecordCount) + parseInt(res.erroredRecordCount))).toFixed(2);
    
      }*/

  getStates(serviceID: any, isNational: any) {
    this.HospitalMasterService.getStates(
      this.userID,
      serviceID,
      isNational,
    ).subscribe((response: any) => this.getStatesSuccessHandeler(response));
  }

  clear() {
    this.state = '';
    this.service = '';
    this.district = '';
    this.taluk = '';
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];

    this.showTableFlag = false;
  }

  showForm() {
    this.enableUPload = false;
    this.disabled_flag = true;
    this.showTableFlag = false;
    this.showFormFlag = true;
    this.disableSecFields = true;
    this.disableTertiaryFields = true;
  }

  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.enableUPload = true;

          this.file = undefined;
          this.enableUPloadButton = true;
          this.disabled_flag = false;
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.invalid_file_flag = false;
          this.inValidFileName = false;
          this.error1 = false;
          this.error2 = false;
          this.institutionName = '';
          this.address = '';
          this.website = '';

          this.contact_person_name = '';
          this.contact_number = '';
          this.emailID = '';

          this.secondary_contact_person_name = '';
          this.secondary_contact_number = '';
          this.secondary_emailID = '';

          this.tertiary_contact_person_name = '';
          this.tertiary_contact_number = '';
          this.tertiary_emailID = '';
        }
      });
  }
  getStatesSuccessHandeler(response: any) {
    this.state = '';
    this.district = '';
    this.taluk = '';
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
    if (response) {
      this.states = response.data;
    }
  }

  getServices(userID: any) {
    // this.state = "";
    // this.district = "";
    // this.taluk = "";

    this.HospitalMasterService.getServices(userID).subscribe(
      (response: any) => this.getServiceSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        // this.alertService.alert(err, 'error')
      },
    );
  }

  getServiceSuccessHandeler(response: any) {
    if (response) {
      this.services = response.data.filter(function (item: any) {
        if (
          item.serviceID === 3 ||
          item.serviceID === 11 ||
          item.serviceID === 1 ||
          item.serviceID === 6 ||
          item.serviceID === 2 ||
          item.serviceID === 4 ||
          item.serviceID === 9
        ) {
          return item;
        }
      });
      this.searchResultArray = [];
      this.filteredsearchResultArray.data = [];
    }
  }

  getDistrict(stateID: any) {
    this.district = '';
    this.taluk = '';
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];

    this.HospitalMasterService.getDistricts(stateID).subscribe(
      (response: any) => this.getDistrictSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        //this.alertService.alert(err, 'error')
      },
    );
  }

  getDistrictSuccessHandeler(response: any) {
    console.log(response.data, 'Districts');
    if (response.data) {
      this.districts = response.data;
    }
  }

  getTaluk(districtID: any) {
    this.taluk = '';
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];

    this.HospitalMasterService.getTaluks(districtID).subscribe(
      (response: any) => this.getTalukSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        // this.alertService.alert(err, 'error')
      },
    );
  }

  getTalukSuccessHandeler(response: any) {
    console.log(response, 'Taluk');
    if (response.data) {
      this.taluks = response.data;
    }
  }

  /* setProviderServiceMapID(providerServiceMapID) {
        this.district = "";
        this.taluk = "";
        this.providerServiceMapID = providerServiceMapID;
    }*/
  setProviderServiceMapID(stateId: any) {
    this.states.map((item: any) => {
      if (item.stateID === stateId) {
        this.providerServiceMapID = item.providerServiceMapID;
      }
    });
    this.district = '';
    this.taluk = '';
    this._instituteTypeMasterService
      .getInstitutesType(this.providerServiceMapID)
      .subscribe(
        (response: any) => this.instituteSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }
  instituteSuccessHandeler(response: any) {
    this.InstitutionTypes = response.data;
  }
  /*CRUD OPERATIONS */

  /*GET institution*/
  getInstitutions() {
    let checkTalukValue = 0;
    let request_obj: any;
    this.showTableFlag = true;
    if (this.taluk !== '' && this.taluk !== undefined && this.taluk !== null) {
      checkTalukValue = this.taluk;
      request_obj = {
        providerServiceMapID: this.providerServiceMapID,
        stateID: this.state,
        districtID: this.district,
        blockID: checkTalukValue,
      };
    } else {
      request_obj = {
        providerServiceMapID: this.providerServiceMapID,
        stateID: this.state,
        districtID: this.district,
      };
    }

    this.HospitalMasterService.getInstitutions(request_obj).subscribe(
      (response: any) => this.getInstitutionSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        //this.alertService.alert(err, 'error')
      },
    );
  }

  getInstitutionSuccessHandeler(response: any) {
    console.log(response.data, 'GET HOSPITAL LIST');
    if (response.data) {
      this.showTableFlag = true;
      this.searchResultArray = response.data;
      this.filteredsearchResultArray.data = response.data;
    }
  }

  /*activate/deactivate an institution*/
  toggleActivate(institutionID: any, toBeDeactivatedFlag: any) {
    if (toBeDeactivatedFlag === true) {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response: any) => {
          if (response) {
            const obj = {
              institutionID: institutionID,
              deleted: toBeDeactivatedFlag,
            };

            this.HospitalMasterService.deleteInstitution(obj).subscribe(
              (response: any) =>
                this.deleteInstitutionSuccessHandeler(response, 'Deactivated'),
              (err) => {
                console.log('Error', err);
                // this.alertService.alert(err, 'error')
              },
            );
          }
        });
    } else if (toBeDeactivatedFlag === false) {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              institutionID: institutionID,
              deleted: toBeDeactivatedFlag,
            };

            this.HospitalMasterService.deleteInstitution(obj).subscribe(
              (response) =>
                this.deleteInstitutionSuccessHandeler(response, 'Activated'),
              (err) => {
                console.log('Error', err);
                //this.alertService.alert(err, 'error')
              },
            );
          }
        });
    }
  }

  deleteInstitutionSuccessHandeler(response: any, action: any) {
    if (response.data) {
      this.alertService.alert(action + ' successfully', 'success');
      this.getInstitutions();
    }
  }

  /*create institution*/
  createInstitution() {
    let checkTalukValue: any;
    const request_Array = [];

    if (this.taluk !== undefined || this.taluk !== null) {
      checkTalukValue = this.taluk;
    }
    const request_obj = {
      institutionName: this.institutionName,
      instituteTypeId: this.institutionType.institutionTypeID,
      stateID: this.state,
      districtID: this.district,
      blockID: checkTalukValue,
      address:
        this.address !== undefined && this.address !== null
          ? this.address.trim()
          : null,
      contactPerson1: this.contact_person_name,
      contactPerson1_Email: this.emailID,
      contactNo1: this.contact_number,
      contactPerson2: this.secondary_contact_person_name,
      contactPerson2_Email: this.secondary_emailID,
      contactNo2: this.secondary_contact_number,
      contactPerson3: this.tertiary_contact_person_name,
      contactPerson3_Email: this.tertiary_emailID,
      contactNo3: this.tertiary_contact_number,
      website: this.website,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };

    request_Array.push(request_obj);
    this.HospitalMasterService.saveInstitution(request_Array).subscribe(
      (response: any) => this.saveInstitutionSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        //this.alertService.alert(err, 'error')
      },
    );
  }

  saveInstitutionSuccessHandeler(response: any) {
    console.log(response.data, 'SAVE INSTITUTION SUCCESS HANDELER');
    if (response.data) {
      this.alertService.alert('Saved successfully', 'success');
      this.enableUPload = true;
      this.disabled_flag = false;
      this.showTableFlag = true;
      this.showFormFlag = false;
      this.institutionForm1.resetForm();
      this.getInstitutions();
    }
  }
  enableSecNumberAndEmailFields() {
    if (this.secondary_contact_person_name.length === 0) {
      this.disableSecFields = true;
      this.institutionForm1.controls['secondary_contact_number'].reset();
      this.institutionForm1.controls['secondary_emailID'].reset();
    } else {
      this.disableSecFields = false;
    }
  }

  enableTertiaryNumberAndEmailFields() {
    if (this.tertiary_contact_person_name.length === 0) {
      this.disableTertiaryFields = true;
      this.institutionForm1.controls['tertiary_contact_number'].reset();
      this.institutionForm1.controls['tertiary_emailID'].reset();
    } else {
      this.disableTertiaryFields = false;
    }
  }

  openEditModal(toBeEditedObject: any) {
    const dialog_Ref = this.dialog.open(EditHospitalModalComponent, {
      height: '500px',
      width: '700px',
      disableClose: true,
      data: toBeEditedObject,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.getInstitutions();
      }
    });
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
    } else {
      this.filteredsearchResultArray.data = [];
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'institutionName' ||
            key === 'website' ||
            key === 'contactPerson1' ||
            key === 'contactNo1' ||
            key === 'contactPerson1_Email'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResultArray.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-edithospitalmodal',
  templateUrl: './edit-hospital-modal.html',
})
export class EditHospitalModalComponent implements OnInit {
  /*ngModels*/

  institutionName: any;
  address: any;
  website: any;

  contact_person_name: any;
  contact_number: any;
  emailID: any;

  secondary_contact_person_name: any;
  secondary_contact_number: any;
  secondary_emailID: any;

  tertiary_contact_person_name: any;
  tertiary_contact_number: any;
  tertiary_emailID: any;

  /*regEx*/
  website_expression: any =
    /^(http[s]?:\/\/)?(www\.)?[a-zA-Z0-9]+[a-zA-Z]{2,5}\.?/;

  email_expression =
    /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;
  mobileNoPattern = /^[1-9][0-9]{9}/;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public HospitalMasterService: HospitalMasterService,
    public commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    public dialogReff: MatDialogRef<EditHospitalModalComponent>,
  ) {}

  ngOnInit() {
    console.log('MODAL DATA', this.data);
    this.institutionName = this.data.institutionName;
    this.address = this.data.address;
    this.website = this.data.website;

    this.contact_person_name = this.data.contactPerson1;
    this.contact_number = this.data.contactNo1;
    this.emailID = this.data.contactPerson1_Email;

    this.secondary_contact_person_name = this.data.contactPerson2;
    this.secondary_contact_number = this.data.contactNo2;
    this.secondary_emailID = this.data.contactPerson2_Email;

    this.tertiary_contact_person_name = this.data.contactPerson3;
    this.tertiary_contact_number = this.data.contactNo3;
    this.tertiary_emailID = this.data.contactPerson3_Email;
  }

  update() {
    // console.log(editedData,"editedData");
    const edit_request_obj = {
      institutionID: this.data.institutionID,
      institutionName: this.institutionName,
      address:
        this.address !== undefined && this.address !== null
          ? this.address.trim()
          : null,
      contactPerson1: this.contact_person_name,
      contactPerson1_Email: this.emailID,
      contactNo1: this.contact_number,
      contactPerson2: this.secondary_contact_person_name,
      contactPerson2_Email: this.secondary_emailID,
      contactNo2: this.secondary_contact_number,
      contactPerson3: this.tertiary_contact_person_name,
      contactPerson3_Email: this.tertiary_emailID,
      contactNo3: this.tertiary_contact_number,
      website: this.website,
      providerServiceMapID: this.data.providerServiceMapID,
      modifiedBy: this.commonDataService.uname,
    };

    this.HospitalMasterService.editInstitution(edit_request_obj).subscribe(
      (response: any) => this.editInstitutionSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
        // this.alertService.alert(err, 'error')
      },
    );
  }

  editInstitutionSuccessHandeler(response: any) {
    console.log('edit success', response.data);
    if (response.data) {
      this.dialogReff.close('success');
    }
  }
}
