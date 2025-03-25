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
import { Component, OnInit, ViewChild } from '@angular/core';
import { EmailConfigurationService } from 'src/app/core/services/ProviderAdminServices/email-configuration-services.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-email-configuration',
  templateUrl: './email-configuration.component.html',
  styleUrls: ['./email-configuration.component.css'],
})
export class EmailConfigurationComponent implements OnInit {
  displayedColumns: string[] = [
    'sno',
    'District',
    'Taluk',
    'AuthorityDesignation',
    'AuthorityName',
    'EmailId',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = ['sno', 'AuthorityName', 'EmailId', 'action'];

  userID: any;
  Serviceline: any;
  state: any;
  districtID: any;
  taluk: any;
  institutes: any;
  designation: any;
  authorityName: any;
  emailID: any;
  contactNo: any;
  nationalFlag: any;
  providerServiceMapID: any;
  mailConfigObject: any;
  editAuthorityMailConfig: any;
  updateMailConfigObject: any;
  confirmMessage: any;
  bufferCount: any = 0;
  serviceline: any;
  mailConfig: any = [];
  services: any = [];
  states: any = [];
  districts: any = [];
  designations: any = [];
  taluks: any = [];

  disableSelection = false;
  showListOfEmailconfig: any = true;
  showListOfEmails: any = true;
  editable: any = false;
  showTableFlag = false;

  emailPattern = /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;

  @ViewChild('searchForm')
  searchForm!: NgForm;
  @ViewChild('mailConfigForm')
  mailConfigForm!: NgForm;
  searchFields: any;
  mConfig: any;

  constructor(
    public EmailConfigurationService: EmailConfigurationService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
  ) {}
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredMailConfig = new MatTableDataSource<any>();
  emailConfigList = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredMailConfig.paginator = this.paginator;
  }
  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getAllServicelines();
  }

  getAllServicelines() {
    console.log('user id', this.userID);
    this.EmailConfigurationService.getServiceLines(this.userID).subscribe(
      (serviceResponse: any) => {
        this.serviceSuccessHandler(serviceResponse),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
          };
      },
    );
  }

  serviceSuccessHandler(serviceResponse: any) {
    this.services = serviceResponse.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 1 || item.serviceID === 3 || item.serviceID === 6)
        return item;
    });
    console.log('services', serviceResponse);
  }
  getStates(serviceline: any) {
    this.searchForm.controls['districtID'].reset();
    this.searchForm.controls['taluk'].reset();
    this.mailConfig = [];
    this.filteredMailConfig.data = [];
    const obj = {
      userID: this.userID,
      serviceID: serviceline.serviceID,
      isNational: serviceline.isNational,
    };
    this.EmailConfigurationService.getStates(obj).subscribe(
      (statesResponse: any) => {
        this.getStatesSuccessHandeler(statesResponse, serviceline),
          (err: any) => {
            console.log('error in fetching states', err);
          };
      },
    );
  }

  getStatesSuccessHandeler(response: any, serviceline: any) {
    this.states = response.data;
  }
  setProviderServiceMapID(state: any) {
    this.searchForm.controls['districtID'].reset();
    this.searchForm.controls['taluk'].reset();
    console.log('providerServiceMapID', state.providerServiceMapID);
    this.providerServiceMapID = state.providerServiceMapID;
    this.getAllMailConfig();
    this.getDistricts(state);
  }
  getDistricts(state: any) {
    this.mailConfig = [];
    this.filteredMailConfig.data = [];
    this.EmailConfigurationService.getDistricts(state.stateID).subscribe(
      (response: any) => {
        this.getDistrictsSuccessHandeler(response);
      },
    );
  }
  getDistrictsSuccessHandeler(response: any) {
    this.districts = response.data;
  }
  getTaluk(districtID: any) {
    this.taluk = null;
    this.EmailConfigurationService.getTaluks(districtID.districtID).subscribe(
      (response: any) => this.getTalukSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
      },
    );
  }

  getTalukSuccessHandeler(response: any) {
    console.log(response.data, 'Taluk');
    if (response.data) {
      console.log(
        'this.searchForm',
        this.searchForm.valid,
        this.searchForm.value,
      );
      this.taluks = response.data;
    }
    this.getAllMailConfig();
  }

  getAllMailConfig() {
    let checkDistrictValue: any;
    let checkTalukValue: any;
    this.showTableFlag = true;
    this.editable = false;
    if (this.districtID !== undefined || this.districtID !== null) {
      checkDistrictValue = this.districtID.districtID;
    }
    if (this.taluk !== undefined || this.taluk !== null) {
      checkTalukValue = this.taluk.blockID;
    }
    const object = {
      providerServiceMapID: this.providerServiceMapID,
      stateID: this.state.stateID,
      districtID: checkDistrictValue,
      blockID: checkTalukValue,
    };

    this.EmailConfigurationService.getMailConfig(object).subscribe(
      (mailConfigResponse: any) => {
        this.mailConfigSuccessHandler(mailConfigResponse),
          (err: any) => {
            console.log('ERROR in fetching mail config', err);
          };
      },
    );
  }
  mailConfigSuccessHandler(mailConfigResponse: any) {
    const configArray = mailConfigResponse;
    this.filteredMailConfig.data = configArray.filter((Response: any) => {
      if (Response.data.mobileNo === null) {
        return Response.data;
      }
    });
    this.mailConfig = this.filteredMailConfig.data;
    console.log('mailConfigResponse', mailConfigResponse);
  }
  showForm() {
    this.getAllDesignations();
    this.showTableFlag = false;
    this.disableSelection = true;
    this.showListOfEmails = false;
    this.showListOfEmailconfig = false;
  }
  getAllDesignations() {
    this.EmailConfigurationService.getAllDesignations().subscribe(
      (res: any) => this.getAllDesignationsSuccessHandler(res),
      (err) => console.log('error', err),
    );
  }
  getAllDesignationsSuccessHandler(response: any) {
    console.log('Display All Designations', response.data);
    this.designations = response.data;
    if (this.editAuthorityMailConfig !== undefined) {
      if (this.designations) {
        const auth_designation = this.designations.filter(
          (designationResponse: any) => {
            if (
              this.editAuthorityMailConfig.designationID ===
              designationResponse.designationID
            ) {
              return designationResponse;
            }
          },
        )[0];
        if (auth_designation) {
          this.designation = auth_designation;
        }
      }
    }
  }

  add_obj(values: any) {
    console.log('add object', values);
    let checkTalukValue: any;
    if (this.taluk !== undefined || this.taluk !== null) {
      checkTalukValue = this.taluk.blockID;
    }
    this.mailConfigObject = {
      providerServiceMapID: this.providerServiceMapID,
      stateID: this.state.stateID,
      districtID: this.districtID.districtID,
      blockID: checkTalukValue,
      designationID: values.designation.designationID,
      authorityName: values.authorityName,
      emailID: values.emailID,
      createdBy: this.commonDataService.uname,
    };
    console.log('emailConfigList', this.emailConfigList);

    this.checkDuplicates(this.mailConfigObject);
  }

  checkDuplicates(parkingPlaceObj: any) {
    if (this.emailConfigList.data.length === 0) {
      this.emailConfigList.data.push(this.mailConfigObject);
      this.mailConfigForm.resetForm();
    } else if (this.emailConfigList.data.length > 0) {
      for (let a = 0; a < this.emailConfigList.data.length; a++) {
        if (
          this.emailConfigList.data[a].authorityName ===
            this.mailConfigObject.authorityName &&
          this.emailConfigList.data[a].stateID ===
            this.mailConfigObject.stateID &&
          this.emailConfigList.data[a].districtID ===
            this.mailConfigObject.districtID &&
          this.emailConfigList.data[a].designationID ===
            this.mailConfigObject.designationID &&
          this.emailConfigList.data[a].emailID === this.mailConfigObject.emailID
        ) {
          this.bufferCount = this.bufferCount + 1;
          console.log('Duplicate Combo Exists', this.bufferCount);
        }
      }
      if (this.bufferCount > 0) {
        this.alertService.alert('Already exists');
        this.bufferCount = 0;
        this.mailConfigForm.resetForm();
      } else {
        this.emailConfigList.data.push(this.mailConfigObject);
        this.mailConfigForm.resetForm();
      }
    }
  }
  remove_obj(index: any) {
    this.emailConfigList.data.splice(index, 1);
  }
  save() {
    this.EmailConfigurationService.saveMailConfig(
      this.emailConfigList.data,
    ).subscribe(
      (response: any) => this.saveSuccessHandeler(response),
      (err) => {
        console.log('Error', err);
      },
    );
  }
  saveSuccessHandeler(response: any) {
    console.log('response', response);
    if (response.data) {
      this.alertService.alert('Saved successfully', 'success');
      this.mailConfigForm.resetForm();
      this.emailConfigList.data = [];
      this.showList();
    }
  }
  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.mailConfigForm.resetForm();
          this.emailConfigList.data = [];
          this.showList();
        }
      });
  }
  showList() {
    this.getAllMailConfig();
    this.showListOfEmailconfig = true;
    this.editable = false;
    this.disableSelection = false;
    this.showListOfEmails = true;
  }
  editMailConfig(mailConfigvalues: any) {
    console.log('mail config', mailConfigvalues);
    this.editable = true;
    this.disableSelection = true;
    this.showListOfEmails = false;
    this.editAuthorityMailConfig = mailConfigvalues;
    this.getAllDesignations();
    this.authorityName = mailConfigvalues.authorityName;
    this.emailID = mailConfigvalues.emailID;
    this.contactNo = mailConfigvalues.contactNo;
  }

  update() {
    this.updateMailConfigObject = {
      providerServiceMapID: this.providerServiceMapID,
      stateID: this.state.stateID,
      districtID: this.districtID.districtID,
      blockID: this.taluk.blockID,
      designationID: this.designation.designationID,
      authorityName: this.authorityName,
      emailID: this.emailID,
      authorityEmailID: this.editAuthorityMailConfig.authorityEmailID,
      modifiedBy: this.commonDataService.uname,
    };
    console.log('updateMailConfigObject', this.updateMailConfigObject);

    this.EmailConfigurationService.updateMailConfig(
      this.updateMailConfigObject,
    ).subscribe((response) => this.updateHandler(response));
  }

  updateHandler(response: any) {
    if (response) {
      this.alertService.alert('Updated successfully', 'success');
      this.mailConfigForm.resetForm();
      this.showList();
      this.editAuthorityMailConfig = null;
    }
  }
  toggleMailConfigActivationAndDeactivation(mailconfigObject: any, flag: any) {
    const obj = {
      providerServiceMapID: mailconfigObject.providerServiceMapID,
      stateID: mailconfigObject.stateID,
      districtID: mailconfigObject.districtID,
      blockID: mailconfigObject.blockID,
      designationID: mailconfigObject.designationID,
      authorityName: mailconfigObject.authorityName,
      emailID: mailconfigObject.emailID,
      modifiedBy: this.commonDataService.uname,
      authorityEmailID: mailconfigObject.authorityEmailID,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('Deactivating or activating Obj', obj);
            this.EmailConfigurationService.emailActivationDeactivation(
              obj,
            ).subscribe(
              (res) => {
                console.log('Activation or deactivation response', res);
                this.alertService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.getAllMailConfig();
              },
              (err) => console.log('error', err),
            );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredMailConfig.data = this.mailConfig;
      this.filteredMailConfig.paginator = this.paginator;
    } else {
      this.filteredMailConfig.data = [];
      this.mailConfig.forEach((item: any) => {
        for (const key in item) {
          if (key === 'authorityName' || key === 'emailID') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredMailConfig.data.push(item);
              break;
            }
          } else {
            if (key === 'designation') {
              const value: string = '' + item[key].designationName;
              if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                this.filteredMailConfig.data.push(item);
                break;
              }
            }
          }
        }
      });
      this.filteredMailConfig.paginator = this.paginator;
    }
  }
}
