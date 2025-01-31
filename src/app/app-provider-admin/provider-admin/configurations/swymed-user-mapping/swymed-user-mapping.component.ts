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

import { NgForm } from '@angular/forms';
import { SwymedUserConfigurationService } from '../services/swymed-user-service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-swymed-user-mapping',
  templateUrl: './swymed-user-mapping.component.html',
  styleUrls: ['./swymed-user-mapping.component.css'],
})
export class SwymedUserMappingComponent implements OnInit {
  createdBy: any;
  serviceProviderID: any;
  designation: any;
  emailID: any;
  password: any;
  username: any;
  domain: any;
  dataToBeEdit: any;
  status: any;

  swymedUserDetails: any = [];
  designations: any = [];
  userNamesList: any = [];
  domainList: any = [];

  showTable = true;
  editMode = false;
  disableSelection = false;

  dynamictype: any = 'password';

  emailPattern = /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;
  passwordPattern =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;

  @ViewChild('mappingForm') mappingForm!: NgForm;
  displayedColumns = [
    'sno',
    'userName',
    'designationName',
    'videoConsultationEmailID',
    'videoConsultationDomain',
    'edit',
    'action',
  ];

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredswymedUserDetails = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredswymedUserDetails.paginator = this.paginator;
  }

  constructor(
    public swymedUserConfigService: SwymedUserConfigurationService,
    public dataServiceValue: dataService,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.dataServiceValue.uname;
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getAllSwymedUserDetails();
  }
  /*
   * To fetch mapped user details
   */
  getAllSwymedUserDetails() {
    this.swymedUserConfigService
      .getSwymedUserDetails(this.serviceProviderID)
      .subscribe(
        (userResponse: any) => {
          if (userResponse !== undefined) {
            this.swymedUserDetails = userResponse.data;
            this.filteredswymedUserDetails.data = userResponse.data;
          }
        },
        (err) => {
          console.log('error', err.errorMessage);
          this.dialogService.alert(err.errorMessage, 'error');
        },
      );
  }
  showForm() {
    this.showTable = false;
    this.disableSelection = false;
    this.editMode = false;
    this.dataToBeEdit = undefined;
    this.getAllDesignations();
    this.getVideoConsultationDomain();
  }

  /*
   * To fetch Designation
   */
  getAllDesignations() {
    this.swymedUserConfigService.getAllDesignations().subscribe(
      (desigRes: any) => {
        if (desigRes !== undefined) {
          this.designations = desigRes.data;
        }
        if (this.dataToBeEdit !== undefined) {
          const editDesig = this.designations.filter((editDesigValue: any) => {
            if (
              this.dataToBeEdit.designationName !== undefined &&
              this.dataToBeEdit.designationName ===
                editDesigValue.designationName
            ) {
              return editDesigValue;
            }
          })[0];
          if (editDesig) {
            this.designation = editDesig;
          }
        }
      },
      (err) => {
        this.dialogService.alert(err.errorMessage, 'error');
      },
    );
  }

  /*
   * To fetch user list
   */
  getUserNameBasedOnDesig(designationID: any) {
    this.swymedUserConfigService
      .getUserName(designationID, this.serviceProviderID)
      .subscribe(
        (response: any) => {
          if (response !== undefined) {
            this.userNamesList = response.data;
          }
          if (this.dataToBeEdit !== undefined) {
            const editUser = this.userNamesList.filter((editUserValue: any) => {
              if (
                this.dataToBeEdit.userName !== undefined &&
                this.dataToBeEdit.userName === editUserValue.UserName
              ) {
                return editUserValue;
              }
            });
            if (editUser) {
              this.username = editUser;
            }
          }
        },
        (err) => {
          this.dialogService.alert(err.errorMessage, 'error');
        },
      );
  }

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  /*
   * To fetch swymed domain
   */
  getVideoConsultationDomain() {
    this.swymedUserConfigService
      .getVideoConsultationDomain(this.serviceProviderID)
      .subscribe(
        (domainResponse: any) => {
          if (domainResponse !== undefined) {
            this.domainList = domainResponse.data;
          }
          if (this.dataToBeEdit !== undefined) {
            const editDomain = this.domainList.filter(
              (editDomainValue: any) => {
                if (
                  this.dataToBeEdit.videoConsultationDomain !== undefined &&
                  this.dataToBeEdit.videoConsultationDomain ===
                    editDomainValue.videoConsultationDoamin
                ) {
                  return editDomainValue;
                }
              },
            )[0];
            if (editDomain) {
              this.domain = editDomain;
            }
          }
        },
        (err) => {
          this.dialogService.alert(err.errorMessage, 'error');
        },
      );
  }

  /*
   * Save API Call
   */

  saveUserMapping(formValue: any) {
    const saveReqObj = {
      userID: formValue.username.userID,
      videoConsultationEmailID: formValue.emailID,
      videoConsultationPassword: formValue.password,
      videoConsultationDomain: formValue.domain.videoConsultationDoamin,
      createdBy: this.createdBy,
    };
    this.swymedUserConfigService.saveSwymedUserDetails(saveReqObj).subscribe(
      (saveResponse: any) => {
        if (saveResponse.statusCode === 200) {
          this.dialogService.alert('Saved successfully', 'success');
          this.getAllSwymedUserDetails();
          this.resetForm();
        }
      },
      (err) => {
        if (err._body !== undefined) {
          err = err['_body'].replace(
            /(\d+)([[:.])(\d+)([,}\]])/g,
            '"$1$2$3"$4',
          );
          err = JSON.parse(err);
        }
        if (err.statusCode === 5010) {
          this.dialogService.alert(err.errorMessage, 'error');
        } else if (err.statusCode === 5000) {
          this.dialogService.alert('Invalid input', 'error');
        } else {
          console.log('error');
        }
      },
    );
  }

  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.resetForm();
        }
      });
  }

  resetForm() {
    this.showTable = true;
    this.editMode = false;
    this.mappingForm.reset();
  }

  editUserDetails(editValue: any) {
    console.log('editValue', editValue);
    this.dataToBeEdit = editValue;
    this.disableSelection = true;
    this.editMode = true;
    this.showTable = false;
    this.getAllDesignations();
    this.getUserNameBasedOnDesig(editValue.designationID);
    this.getVideoConsultationDomain();
    this.emailID = editValue.videoConsultationEmailID;
    this.password = editValue.videoConsultationPassword;
  }
  /*
   * Update API Call
   */

  updateUsermapping(formValue: any) {
    const updateObj = {
      videoConsultationEmailID: formValue.emailID,
      videoConsultationPassword: formValue.password,
      videoConsultationDomain: this.dataToBeEdit.videoConsultationDomain,
      userID: this.dataToBeEdit.userID,
      userVideoConsultationMapID: this.dataToBeEdit.userVideoConsultationMapID,
      modifiedBy: this.createdBy,
    };
    this.swymedUserConfigService.updateUserDetails(updateObj).subscribe(
      (updateResponse: any) => {
        if (updateResponse.statusCode === 200) {
          this.dialogService.alert('Updated successfully', 'success');
          this.getAllSwymedUserDetails();
          this.dataToBeEdit = undefined;
          this.resetForm();
        }
      },
      (err) => {
        if (err._body !== undefined) {
          err = err['_body'].replace(
            /(\d+)([[:.])(\d+)([,}\]])/g,
            '"$1$2$3"$4',
          );
          err = JSON.parse(err);
        }
        if (err.statusCode === 5010) {
          this.dialogService.alert(err.errorMessage, 'error');
        } else if (err.statusCode === 5000) {
          this.dialogService.alert('Invalid input', 'error');
        } else {
          console.log('error', err);
        }
      },
    );
  }
  /*
   * Activate or deactivate user mapping
   */
  activateDeactivateMapping(item: any, userDeleted: any) {
    if (userDeleted) {
      this.dialogService.alert('User is inactive');
    } else {
      const flag = !item.Deleted;
      if (flag) {
        this.status = 'Deactivate';
      } else {
        this.status = 'Activate';
      }
      this.dialogService
        .confirm('Confirm', 'Are you sure you want to ' + this.status + '?')
        .subscribe(
          (res) => {
            if (res) {
              this.swymedUserConfigService
                .mappingActivationDeactivation(
                  item.userVideoConsultationMapID,
                  flag,
                  item.modifiedBy,
                )
                .subscribe(
                  (res) => {
                    console.log('Activation or deactivation response', res);
                    this.dialogService.alert(
                      this.status + 'd successfully',
                      'success',
                    );
                    this.getAllSwymedUserDetails();
                  },
                  (err) => {
                    if (err._body !== undefined) {
                      err = err['_body'].replace(
                        /(\d+)([[:.])(\d+)([,gt}\]])/g,
                        '"$1$2$3"$4',
                      );
                      err = JSON.parse(err);
                    }
                    if (err.statusCode === 5010) {
                      this.dialogService.alert(err.errorMessage, 'error');
                    } else if (err.statusCode === 5000) {
                      this.dialogService.alert('Invalid input', 'error');
                    } else {
                      console.log('error', err);
                    }
                  },
                );
            }
          },
          (err) => {
            console.log(err);
          },
        );
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredswymedUserDetails.data = this.swymedUserDetails;
    } else {
      this.filteredswymedUserDetails.data = [];
      this.swymedUserDetails.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'userName' ||
            key === 'videoConsultationDomain' ||
            key === 'designationName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredswymedUserDetails.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}
