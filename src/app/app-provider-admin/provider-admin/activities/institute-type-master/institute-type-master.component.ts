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
import { InstituteTypeMasterService } from '../services/institute-type-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { NgForm } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-institute-type-master',
  templateUrl: './institute-type-master.component.html',
  styleUrls: ['./institute-type-master.component.css'],
})
export class InstituteTypeMasterComponent implements OnInit {
  paginator!: MatPaginator;
  j: any;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResultArray = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResultArray.paginator = this.paginator;
  }

  // filteredsearchResultArray: any = [];
  /*ngModels*/
  serviceProviderID: any;
  providerServiceMapID: any;
  state: any;
  service: any;

  instituteType: any;
  description: any;
  typeExists: any;
  userID: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  searchInstituteTypeArray: any = [];
  searchResultArray: any = [];
  // bufferArray: any = [];

  /*flags*/
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  isNational = false;
  availableInstitute: any = [];

  displayedColumns: string[] = [
    'SNo',
    'InstituteType',
    'Description',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = ['SNo', 'InstituteType', 'Description', 'edit'];

  @ViewChild('searchFields')
  searchFields!: NgForm;
  @ViewChild('entryField')
  entryField!: NgForm;
  constructor(
    public _instituteTypeMasterService: InstituteTypeMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.userID = this.commonDataService.uid;
  }

  ngOnInit() {
    this.getServices(this.userID);
  }

  setIsNational(value: any) {
    this.isNational = value;
  }

  getServices(userID: any) {
    this._instituteTypeMasterService
      .getServicesForInstTypeMaster(userID)
      .subscribe(
        (response: any) => this.getServicesSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  getServicesSuccessHandeler(response: any) {
    console.log('SERVICES', response.data);
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
  }

  getStates(serviceID: any, isNational: any) {
    this._instituteTypeMasterService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, isNational),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  getStatesSuccessHandeler(response: any, isNational: any) {
    this.state = '';
    console.log('STATE', response.data);
    this.states = response.data;
    if (isNational) {
      this.setProviderServiceMapID(this.states[0].providerServiceMapID);
    } else {
      this.searchResultArray = [];
      this.filteredsearchResultArray.data = [];
    }
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.search(providerServiceMapID);
  }

  search(providerServiceMapID: any) {
    this._instituteTypeMasterService
      .getInstitutesType(providerServiceMapID)
      .subscribe(
        (response: any) => this.searchSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  searchSuccessHandeler(response: any) {
    if (response) {
      this.showTableFlag = true;
      this.searchResultArray = response.data;
      this.filteredsearchResultArray.data = response.data;
      for (const availableIns of this.searchResultArray) {
        this.availableInstitute.push(availableIns.institutionType);
      }
    }
  }

  clear() {
    /*resetting the search fields*/
    this.state = '';
    this.service = '';
    this.providerServiceMapID = '';

    this.services = [];
    /*resetting the flag*/
    this.showTableFlag = false;
    /*resetting the search result array*/
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
  }

  showForm() {
    this.showTableFlag = false;
    this.showFormFlag = true;

    this.disableSelection = true;
  }
  navigateToPrev() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.back();
        }
      });
  }
  back() {
    this.showTableFlag = true;
    this.showFormFlag = false;
    /*reset the input fields of the form*/
    //	this.instituteType="";
    this.description = '';
    this.bufferArray.data = [];

    this.disableSelection = false;
  }

  toggle_activate(institutionTypeID: any, isDeleted: any) {
    if (isDeleted === true) {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              institutionTypeID: institutionTypeID,
              deleted: isDeleted,
            };

            this._instituteTypeMasterService
              .toggle_activate_InstituteType(obj)
              .subscribe(
                (response: any) =>
                  this.toggleActivateSuccessHandeler(response, 'Deactivated'),
                (err) => {
                  console.log('Error', err);
                  // this.alertService.alert(err, 'error');
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
              institutionTypeID: institutionTypeID,
              deleted: isDeleted,
            };

            this._instituteTypeMasterService
              .toggle_activate_InstituteType(obj)
              .subscribe(
                (response: any) =>
                  this.toggleActivateSuccessHandeler(response, 'Activated'),
                (err) => {
                  console.log('Error', err);
                  // this.alertService.alert(err, 'error');
                },
              );
          }
        });
    }
  }

  toggleActivateSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response.data) {
      this.alertService.alert(action + ' successfully', 'success');
      this.search(this.providerServiceMapID);
    }
  }

  add_obj(institute_type: any, description: any) {
    const obj = {
      institutionType: institute_type,
      institutionTypeDesc: description,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };
    console.log('created', this.commonDataService.uname);

    if (
      this.bufferArray.data.length === 0 &&
      obj.institutionType !== '' &&
      obj.institutionType !== undefined
    ) {
      this.bufferArray.data.push(obj);
    } else {
      let count = 0;
      for (let i = 0; i < this.bufferArray.data.length; i++) {
        if (obj.institutionType === this.bufferArray.data[i].institutionType) {
          count = count + 1;
        }
      }
      if (
        count === 0 &&
        obj.institutionType !== '' &&
        obj.institutionType !== undefined
      ) {
        this.bufferArray.data.push(obj);
      } else {
        this.alertService.alert('Already exists');
      }
    }
    this.entryField.resetForm();

    /*resetting fields after entering in buffer array/or if duplicate exist*/
    // this.instituteType = "";
    // this.description = "";
  }

  removeObj(index: any) {
    this.bufferArray.data.splice(index, 1);
  }

  save() {
    this._instituteTypeMasterService
      .saveInstituteType(this.bufferArray.data)
      .subscribe(
        (response: any) => this.saveSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  saveSuccessHandeler(response: any) {
    console.log('response', response.data);
    if (response.data) {
      this.alertService.alert('Saved successfully', 'success');
      this.back();
      this.search(this.providerServiceMapID);
    }
  }

  openEditModal(toBeEditedOBJ: any) {
    const dialog_Ref = this.dialog.open(EditInstituteTypeComponent, {
      width: '500px',
      disableClose: true,
      data: toBeEditedOBJ,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.search(this.providerServiceMapID);
      }
    });
  }
  InstituteExist: any = false;
  checkExistance(facilityCode: any) {
    this.InstituteExist = this.availableInstitute.includes(facilityCode);
    console.log(this.InstituteExist);
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
    } else {
      this.filteredsearchResultArray.data = [];
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'institutionType') {
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
  selector: 'app-editinstitutetype',
  templateUrl: './edit-institute-type-modal.html',
})
export class EditInstituteTypeComponent implements OnInit {
  instituteType: any;
  description: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public _instituteTypeMasterService: InstituteTypeMasterService,
    public commonDataService: dataService,
    public dialogReff: MatDialogRef<EditInstituteTypeComponent>,
  ) {}

  ngOnInit() {
    console.log('dialog data', this.data);
    this.instituteType = this.data.institutionType;
    this.description = this.data.institutionTypeDesc;
  }

  update(
    edited_institute_type_name: any,
    edited_institute_type_description: any,
  ) {
    const obj = {
      institutionTypeID: this.data.institutionTypeID,
      institutionType: edited_institute_type_name,
      institutionTypeDesc: edited_institute_type_description,
      modifiedBy: this.commonDataService.uname,
    };
    this._instituteTypeMasterService.editInstituteType(obj).subscribe(
      (response: any) => this.updateSuccessHandeler(response),
      (err) => {
        console.log(err, 'Error');
      },
    );
  }

  updateSuccessHandeler(response: any) {
    console.log(response, 'edit response success');
    if (response.data) {
      this.dialogReff.close('success');
    }
  }
}
