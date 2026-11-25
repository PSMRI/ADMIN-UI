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
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CallibrationMasterServiceService } from '../../inventory/services/callibration-master-service.service';
import { DatePipe } from '@angular/common';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-calibration-master',
  templateUrl: './calibration-master.component.html',
  styleUrls: ['./calibration-master.component.css'],
  providers: [DatePipe],
})
export class CalibrationMasterComponent implements OnInit {
  createdBy: any;
  state: any;
  service: any;
  userID: any;
  services: any;
  states: any;
  searchresultarray: any = [];
  today = new Date();
  expiryDate: any;
  stripCode: any;
  confirmMessage: any;
  //flags
  stripCodeExist = false;
  disableSelection = false;
  showCalibrationCreationForm = false;
  editHeading = false;
  nationalFlag = false;
  tableMode = false;
  formMode = false;
  editMode = false;
  displayedColumns = ['sno', 'stripCode', 'expiryDate', 'edit', 'action'];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchresultarray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchresultarray.paginator = this.paginator;
  }
  @ViewChild('stripCodeForm') stripCodeForm!: NgForm;
  calibrationStripId: any;
  constructor(
    public provider_AdminRoleService: ProviderAdminRoleService,
    public data_service: dataService,
    public alertService: ConfirmationDialogsService,
    public calibrationService: CallibrationMasterServiceService,
    public datePipe: DatePipe,
  ) {}

  ngOnInit() {
    this.createdBy = this.data_service.uname;
    this.userID = this.data_service.uid;
    this.getServiceLines();
    this.today = new Date();
  }
  getServiceLines() {
    this.provider_AdminRoleService
      .getServiceLinesCalibrationNew(this.userID)
      .subscribe(
        (response: any) => {
          if (response) {
            this.services = this.successhandeler(response.data);
          } else {
            this.alertService.alert(response.errorMessage);
          }
        },
        (err) => {
          console.log(err, 'error');
        },
      );
  }
  successhandeler(response: any) {
    this.services = response.filter(function (item: any) {
      console.log('item', item);
      if (
        item.serviceID === 4 ||
        item.serviceID === 9 ||
        item.serviceID === 2 ||
        item.serviceID === 12
      )
        return item;
    });
    return this.services;
  }
  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.provider_AdminRoleService.getStatesNew(obj).subscribe(
      (response: any) => {
        if (response) {
          this.statesSuccesshandeler(response, value);
        } else {
          this.alertService.alert(response.errorMessage);
        }
      },
      (err) => {
        console.log(err, 'error');
      },
    );
  }
  statesSuccesshandeler(response: any, value: any) {
    this.state = '';
    this.states = response.data;
    this.searchresultarray = [];
    this.filteredsearchresultarray.data = [];
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(response[0].providerServiceMapID);
    } else {
      this.nationalFlag = value.isNational;
    }
  }
  setProviderServiceMapID(ProviderServiceMapID: any) {
    this.data_service.provider_serviceMapID = ProviderServiceMapID;
    this.getCalibrationStrips(null);
  }
  getCalibrationStrips(stripCode: any) {
    const obj = {
      providerServiceMapID: this.data_service.provider_serviceMapID,
    };
    this.calibrationService.fetCalibrationMasters(obj).subscribe(
      (response: any) => {
        console.log('stripdata', response);
        if (response.statusCode === 200) {
          this.searchresultarray = response.data.calibrationData;
          this.filteredsearchresultarray.data = [];
          this.filteredsearchresultarray.data = response.data.calibrationData;
          console.log(
            'this.filteredsearchresultarray',
            this.filteredsearchresultarray,
          );
          this.tableMode = true;
          if (stripCode !== null && stripCode !== undefined) {
            this.filterComponentList(stripCode);
          }
        } else {
          this.alertService.alert(response.errorMessage);
        }
      },
      (err) => {
        console.log(err, 'error');
      },
    );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchresultarray.data = this.searchresultarray;
      this.filteredsearchresultarray.paginator = this.paginator;
    } else {
      this.filteredsearchresultarray.data = [];
      // this.filteredsearchresultarray.data = this.searchresultarray;
      // this.filteredsearchresultarray.paginator = this.paginator;
      this.searchresultarray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'stripCode') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchresultarray.data.push(item);
              this.filteredsearchresultarray.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  //start showing Calibration and form mode
  showForm(flag: any) {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = flag;
    this.editHeading = false;
    this.disableSelection = true;
    this.showCalibrationCreationForm = true;
    this.stripCodeExist = false;
    this.stripCode = null;
    this.expiryDate = null;
  }
  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.filteredsearchresultarray.data = this.searchresultarray;
          this.redirectToMainPage();
        }
      });
  }
  redirectToMainPage() {
    this.tableMode = true;
    this.formMode = false;
    this.editHeading = false;
    this.disableSelection = false;
    this.showCalibrationCreationForm = false;
    this.stripCodeExist = false;
    this.stripCodeForm.resetForm();
  }
  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }
  editCalibrationStrip(stripObj: any) {
    this.stripCode = stripObj.stripCode;
    this.expiryDate = stripObj.expiryDate;
    this.calibrationStripId = stripObj.calibrationStripID;
    this.showCalibrationCreationForm = true;
    this.editHeading = true;
    this.disableSelection = true;
    this.stripCodeExist = false;
    this.tableMode = false;
    this.formMode = true;
    this.editMode = true;
  }
  //end
  save_UpdateStripCode(saveType: any) {
    let newexpDate: any;
    if (this.expiryDate !== undefined && this.expiryDate !== null) {
      const formattedDate = this.datePipe.transform(
        this.expiryDate,
        'yyyy-MM-dd',
      );
      // Append the time portion and time zone offset
      const isoFormattedDate = `${formattedDate}T00:00:00.000Z`;
      newexpDate = isoFormattedDate;
      //  newexpDate=this.datePipe.transform(this.expiryDate, 'yyyy-MM-dd');
    }
    let obj;
    if (saveType === 'save') {
      obj = {
        stripCode: this.stripCode,
        // "expiryDate": this.expiryDate == null ? null : new Date(this.expiryDate - 1 * this.expiryDate.getTimezoneOffset() * 60 * 1000),
        expiryDate:
          this.expiryDate === undefined || this.expiryDate === null
            ? null
            : newexpDate,
        providerServiceMapID: this.data_service.provider_serviceMapID,
        createdBy: this.createdBy,
      };
      this.calibrationService.createCalibrationStrip(obj).subscribe(
        (response: any) => {
          if (response.statusCode === 200) {
            this.edit_delete_save_SuccessHandeler('response', 'save');
            this.redirectToMainPage();
            this.getCalibrationStrips(null);
          } else {
            this.alertService.alert(response.errorMessage);
          }
        },
        (err) => {
          console.log(err, 'error');

          this.alertService.alert(err.errorMessage);
        },
      );
      console.log('request object', this.stripCode, this.expiryDate);
    } else {
      obj = {
        stripCode: this.stripCode,
        expiryDate:
          this.expiryDate === undefined || this.expiryDate === null
            ? null
            : newexpDate,
        providerServiceMapID: this.data_service.provider_serviceMapID,
        createdBy: this.createdBy,
        calibrationStripID: this.calibrationStripId,
        deleted: false,
      };
      this.updateCalibrationData(obj);
    }
  }

  updateCalibrationData(obj: any) {
    this.calibrationService.updateCalibrationStrip(obj).subscribe(
      (response: any) => {
        if (response.statusCode === 200) {
          this.edit_delete_save_SuccessHandeler('response', 'edit');
          this.redirectToMainPage();
          this.getCalibrationStrips(null);
        } else {
          this.alertService.alert(response.errorMessage);
        }
      },
      (err) => {
        console.log(err, 'error');
      },
    );
    console.log('request object', this.stripCode, this.expiryDate);
  }

  activateDeactivate(calibrationStripID: any, flag: any, stripCode: any) {
    const obj = {
      calibrationStripID: calibrationStripID,
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
            console.log('obj', obj);
            this.calibrationService.deleteCalibrationStrip(obj).subscribe(
              (response: any) => {
                if (response.statusCode === 200) {
                  console.log('data', response);
                  this.edit_delete_save_SuccessHandeler('response', 'delete');
                  this.getCalibrationStrips(stripCode);
                } else {
                  this.alertService.alert(response.errorMessage);
                }
              },
              (err) => {
                console.log(err, 'error');
              },
            );
          }
        },
        (err) => {
          console.log(err, 'error');
        },
      );
  }
  edit_delete_save_SuccessHandeler(response: any, choice: any) {
    if (choice === 'edit') {
      this.alertService.alert('Updated successfully', 'success');
    } else if (choice === 'save') {
      this.alertService.alert('Saved successfully', 'success');
    } else {
      this.alertService.alert(
        this.confirmMessage + 'd successfully',
        'success',
      );
    }
  }
  validateRole(stripcode: any) {
    let count = 0;
    for (let i = 0; i < this.searchresultarray.length; i++) {
      if (
        this.searchresultarray[i].stripCode !== undefined &&
        this.searchresultarray[i].stripCode !== null &&
        stripcode !== undefined &&
        stripcode !== null &&
        this.searchresultarray[i].stripCode.trim().toUpperCase() ===
          stripcode.trim().toUpperCase()
      ) {
        count = count + 1;
      }
    }
    if (count > 0) {
      this.stripCodeExist = true;
      return false;
    } else {
      this.stripCodeExist = false;
      return true;
    }
  }
}
