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

import { NgForm } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { InstituteSubDirectoryMasterService } from '../services/institute-subdirectory-master-service.service';

import { SessionStorageService } from 'src/app/core/services/session-storage.service';
@Component({
  selector: 'app-institute-subdirectory-master',
  templateUrl: './institute-subdirectory-master.component.html',
  styleUrls: ['./institute-subdirectory-master.component.css'],
})
export class InstituteSubdirectoryMasterComponent implements OnInit {
  /*ngModel*/
  serviceProviderID: any;
  providerServiceMapID: any;

  state: any;
  service: any;
  institute_directory: any;
  institute_subdirectory: any;
  description: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  instituteDirectories: any = [];

  searchResultArray: any = [];
  availableInstituteSubDirectory: any = [];
  instituteSubDirectoryExist = false;

  /*flags*/
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  userID: any;
  nationalFlag: any;
  displayedColumns = [
    'sno',
    'instituteSubDirectoryName',
    'instituteSubDirectoryDesc',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'instituteSubDirectoryName',
    'instituteSubDirectoryDesc',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResultArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResultArray.paginator = this.paginator;
  }
  bufferArray = new MatTableDataSource<any>();

  @ViewChild('addInstitutueSubDirForm') addInstitutueSubDirForm!: NgForm;
  constructor(
    public instituteSubDirectoryMasterService: InstituteSubDirectoryMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.instituteSubDirectoryMasterService
      .getServiceLinesNew(this.userID)
      .subscribe((response: any) => {
        this.successhandeler(response),
          (err: any) => {
            console.log('Error', err);
          };
      });
  }

  successhandeler(res: any) {
    this.services = res.data.filter(function (item: any) {
      if (item.serviceID === 3 || item.serviceID === 1) return item;
    });
  }

  getStates(value: any) {
    console.log('value', value);

    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.instituteSubDirectoryMasterService.getStatesNew(obj).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response, value),
      (err) => {
        console.log('Error', err);
      },
    );
  }

  getStatesSuccessHandeler(response: any, value: any) {
    this.states = response.data;
    this.instituteDirectories = [];
    this.institute_directory = '';
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(response.data[0].providerServiceMapID);
      this.showTableFlag = false;
    } else {
      this.nationalFlag = value.isNational;
      this.showTableFlag = false;
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getInstituteDirectories();
  }

  getInstituteDirectories() {
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
    this.institute_directory = undefined;
    this.instituteSubDirectoryMasterService
      .getInstituteDirectory(this.providerServiceMapID)
      .subscribe(
        (response: any) => this.getInstituteDirectorySuccessHandeler(response),
        (err) => {
          console.log('Error', err);
        },
      );
  }

  getInstituteDirectorySuccessHandeler(response: any) {
    console.log(response, 'Institiute Directories');
    if (response) {
      this.instituteDirectories = response.data.filter(function (item: any) {
        if (item.deleted === false) {
          return item;
        }
      });
    }
  }

  getInstituteSubdirectory(institute_directory: any) {
    const data = {
      instituteDirectoryID: institute_directory,
      providerServiceMapId: this.providerServiceMapID,
    };

    this.instituteSubDirectoryMasterService
      .getInstituteSubDirectory(data)
      .subscribe(
        (response: any) =>
          this.getInstituteSubDirectorySuccessHandeler(response),
        (err) => {
          console.log('Error', err);
        },
      );
  }

  getInstituteSubDirectorySuccessHandeler(response: any) {
    if (response) {
      console.log('INSTITUTE SUB DIRECTORY', response);
      this.showTableFlag = true;
      this.searchResultArray = response.data;
      this.filteredsearchResultArray.data = response.data;
      console.log('searcharray', this.searchResultArray);
      for (const availableInstituteSubDirectory of this.searchResultArray) {
        this.availableInstituteSubDirectory.push(
          availableInstituteSubDirectory.instituteSubDirectoryName,
        );
      }
    }
  }
  checkexistance(institute_subdirectory: any) {
    this.instituteSubDirectoryExist =
      this.availableInstituteSubDirectory.includes(institute_subdirectory);
    console.log(this.instituteSubDirectoryExist);
  }
  showForm() {
    this.showTableFlag = false;
    this.showFormFlag = true;

    this.disableSelection = true;
  }

  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res: any) => {
        if (res) {
          this.showTableFlag = true;
          this.showFormFlag = false;
          /*reset the input fields of the form*/
          this.institute_subdirectory = '';
          this.description = '';
          this.bufferArray.data = [];

          this.disableSelection = false;
        }
      });
  }

  clear() {
    /*resetting the search fields*/
    this.state = '';
    this.service = '';
    (this.institute_directory = ''), (this.providerServiceMapID = '');

    this.services = [];
    this.instituteDirectories = [];

    /*resetting the flag*/
    this.showTableFlag = false;
    /*resetting the search result array*/
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
  }

  add_obj(institute_subdirectory: any, description: any) {
    const obj = {
      instituteDirectoryID: this.institute_directory,
      instituteSubDirectoryName: institute_subdirectory,
      instituteSubDirectoryDesc: description,
      providerServiceMapId: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };

    if (
      this.bufferArray.data.length === 0 &&
      obj.instituteSubDirectoryName !== '' &&
      obj.instituteSubDirectoryName !== undefined
    ) {
      this.bufferArray.data.push(obj);
    } else {
      let count = 0;
      for (let i = 0; i < this.bufferArray.data.length; i++) {
        if (
          obj.instituteSubDirectoryName ===
          this.bufferArray.data[i].instituteSubDirectoryName
        ) {
          count = count + 1;
        }
      }
      if (
        count === 0 &&
        obj.instituteSubDirectoryName !== '' &&
        obj.instituteSubDirectoryName !== undefined
      ) {
        this.bufferArray.data.push(obj);
      } else {
        this.alertService.alert('Already exists');
      }
    }

    /*resetting fields after entering in buffer array/or if duplicate exist*/
    this.institute_subdirectory = '';
    this.description = '';
    this.addInstitutueSubDirForm.resetForm();
  }

  removeObj(index: any) {
    this.bufferArray.data.splice(index, 1);
  }

  save() {
    this.instituteSubDirectoryMasterService
      .saveInstituteSubDirectory(this.bufferArray.data)
      .subscribe(
        (response: any) => this.saveSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
        },
      );
  }

  saveSuccessHandeler(response: any) {
    if (response) {
      this.alertService.alert('Saved successfully', 'success');
      this.addInstitutueSubDirForm.resetForm();
      this.showFormFlag = false;
      this.bufferArray.data = [];
      this.getInstituteSubdirectory(this.institute_directory);
      this.disableSelection = false;
    }
  }

  toggle_activate(instituteSubDirectoryID: any, isDeleted: any) {
    if (isDeleted === true) {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response: any) => {
          if (response) {
            const obj = {
              instituteSubDirectoryID: instituteSubDirectoryID,
              deleted: isDeleted,
            };

            this.instituteSubDirectoryMasterService
              .toggle_activate_InstituteSubDirectory(obj)
              .subscribe(
                (response: any) =>
                  this.toggleActivateSuccessHandeler(response, 'Deactivated'),
                (err) => {
                  console.log('Error', err);
                },
              );
          }
        });
    }

    if (isDeleted === false) {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              instituteSubDirectoryID: instituteSubDirectoryID,
              deleted: isDeleted,
            };

            this.instituteSubDirectoryMasterService
              .toggle_activate_InstituteSubDirectory(obj)
              .subscribe(
                (response) =>
                  this.toggleActivateSuccessHandeler(response, 'Activated'),
                (err) => {
                  console.log('Error', err);
                },
              );
          }
        });
    }
  }

  toggleActivateSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response) {
      this.alertService.alert(action + ' successfully', 'success');
      this.getInstituteSubdirectory(this.institute_directory);
    }
  }

  openEditModal(toBeEditedOBJ: any) {
    const dialog_Ref = this.dialog.open(EditInstituteSubDirectoryComponent, {
      width: '500px',
      data: toBeEditedOBJ,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.getInstituteSubdirectory(this.institute_directory);
      }
    });
  }

  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
      this.filteredsearchResultArray.paginator = this.paginator;
    } else {
      this.filteredsearchResultArray.data = [];
      this.filteredsearchResultArray.paginator = this.paginator;
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'instituteSubDirectoryName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResultArray.data.push(item);
              break;
            }
          }
        }
        this.filteredsearchResultArray.paginator = this.paginator;
      });
    }
  }
}

@Component({
  selector: 'app-edit-institute-subdirectory',
  templateUrl: './edit-institute-subdirectory-modal.html',
})
export class EditInstituteSubDirectoryComponent implements OnInit {
  instituteSubDirectory: any;
  description: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public instituteSubDirectoryMasterService: InstituteSubDirectoryMasterService,
    public commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    public dialogReff: MatDialogRef<EditInstituteSubDirectoryComponent>,
  ) {}

  ngOnInit() {
    console.log('dialog data', this.data);
    this.instituteSubDirectory = this.data.instituteSubDirectoryName;
    this.description = this.data.instituteSubDirectoryDesc;
  }

  update(edited_subdirectory_name: any, edited_description: any) {
    const obj = {
      instituteSubDirectoryID: this.data.instituteSubDirectoryID,
      instituteSubDirectoryName: edited_subdirectory_name,
      instituteSubDirectoryDesc: edited_description,
      modifiedBy: this.commonDataService.uname,
    };
    this.instituteSubDirectoryMasterService
      .editInstituteSubDirectory(obj)
      .subscribe(
        (response: any) => this.updateSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
        },
      );
  }

  updateSuccessHandeler(response: any) {
    console.log(response, 'edit response success');
    if (response) {
      this.dialogReff.close('success');
    }
  }
}
