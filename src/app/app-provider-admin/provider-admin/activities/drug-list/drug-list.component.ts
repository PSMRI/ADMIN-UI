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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

import { NgForm } from '@angular/forms';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { DrugMasterService } from '../../inventory/services/drug-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-drug-list',
  templateUrl: './drug-list.component.html',
})
export class DrugListComponent implements OnInit, AfterViewInit {
  showDrugs = true;
  duplicateDrugs = false;
  availableDrugs: any = [];
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  editable: any = false;
  availableDrugNames: any = [];
  serviceID104: any;
  createdBy: any;
  invalidDrugDesc = false;

  displayedColumns = [
    'sno',
    'drugName',
    'drugDesc',
    'remarks',
    'edit',
    'action',
  ];

  displayAddedColumns = ['sno', 'drugName', 'drugDesc', 'remarks', 'action'];

  fileteredavailableDrugs = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  drugList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;

  @ViewChild('drugForm') drugForm!: NgForm;
  drugNameToEdit: any;

  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public drugMasterService: DrugMasterService,
    private alertMessage: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.data = [];
    this.service_provider_id =
      this.sessionstorage.getItem('service_providerID');
    this.serviceID104 = this.commonDataService.serviceID104;
    this.createdBy = this.commonDataService.uname;
    this.fileteredavailableDrugs.paginator = this.paginatorFirst;
  }

  ngOnInit() {
    this.getStatesByServiceID();
    this.getAvailableDrugs();
  }
  ngAfterViewInit() {
    this.fileteredavailableDrugs.paginator = this.paginatorFirst;
    this.fileteredavailableDrugs.sort = this.sort;
  }
  stateSelection(stateID: any) {
    this.getServices(stateID);
  }
  getAvailableDrugs() {
    this.drugObj = {};
    this.drugObj.serviceProviderID = this.service_provider_id;
    this.drugMasterService.getDrugsList(this.drugObj).subscribe(
      (response: any) => this.getDrugsSuccessHandeler(response),
      (err) => {
        console.log('error', err);
        // this.alertMessage.alert(err, 'error');
      },
    );
  }

  getDrugsSuccessHandeler(response: any) {
    this.availableDrugs = response.data;
    this.fileteredavailableDrugs.data = response.data;

    for (const availableDrug of this.availableDrugs) {
      this.availableDrugNames.push(availableDrug.drugName);
    }
  }

  getServices(stateID: any) {
    this.providerAdminRoleService
      .getServices(this.service_provider_id, stateID)
      .subscribe(
        (response) => this.getServicesSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          // this.alertMessage.alert(err, 'error');
        },
      );
  }

  getStates() {
    this.providerAdminRoleService.getStates(this.service_provider_id).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response),
      (err) => {
        console.log('error', err);
        // this.alertMessage.alert(err, 'error');
      },
    );
  }

  getStatesByServiceID() {
    this.drugMasterService
      .getStatesByServiceID(this.serviceID104, this.service_provider_id)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          // this.alertMessage.alert(err, 'error');
        },
      );
  }

  getStatesSuccessHandeler(response: any) {
    this.provider_states = response;
  }

  getServicesSuccessHandeler(response: any) {
    this.provider_services = response.data;
    for (const provider_service of this.provider_services) {
      if ('104' === provider_service.serviceName) {
        this.providerServiceMapID = provider_service.providerServiceMapID;
      }
    }
  }

  responseHandler(response: any) {
    this.data = response;
  }

  showForm() {
    this.showDrugs = false;
    this.inValidDrugName = false;
    this.invalidDrugDesc = false;
  }

  drugObj: any;
  // = {
  // 	'drug':'',
  //   'drugDesc':'',
  //   'providerServiceMapID':'',
  //   'createdBy':''
  // };

  addDrugToList(values: any) {
    this.drugObj = {};
    this.drugObj.drugName =
      values.drugName !== undefined && values.drugName !== null
        ? values.drugName.trim()
        : null;
    (this.drugObj.drugDesc =
      values.drugDesc !== undefined && values.drugDesc !== null
        ? values.drugDesc.trim()
        : null),
      (this.drugObj.remarks =
        values.remarks !== undefined && values.remarks !== null
          ? values.remarks.trim()
          : null),
      (this.drugObj.serviceProviderID = this.service_provider_id);
    this.drugObj.createdBy = this.createdBy;
    this.checkDuplicates(this.drugObj);
  }
  checkDuplicates(object: any) {
    let duplicateStatus = 0;
    if (this.drugList.data.length === 0) {
      this.drugList.data.push(object);
    } else {
      for (let i = 0; i < this.drugList.data.length; i++) {
        if (this.drugList.data[i].drugName === object.drugName) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.drugList.data.push(object);
      } else {
        this.alertMessage.alert('Already exists');
      }
    }
  }

  storedrug() {
    const obj = { drugMasters: this.drugList.data };
    console.log('request', obj);

    this.drugMasterService.saveDrugs(JSON.stringify(obj)).subscribe(
      (response: any) => this.successHandler(response.data),
      (err) => {
        console.log('error', err);
        // this.alertMessage.alert(err, 'error');
      },
    );
  }

  successHandler(response: any) {
    this.drugList.data = [];
    this.alertMessage.alert('Saved successfully', 'success');
    this.getAvailableDrugs();
    this.clearEdit();
  }

  dataObj: any = {};
  updateDrugStatus(drug: any) {
    const flag = !drug.deleted;
    let status: any;
    if (flag === true) {
      status = 'Deactivate';
    }
    if (flag === false) {
      status = 'Activate';
    }
    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to ' + status + '?')
      .subscribe((response: any) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.drugID = drug.drugID;
          this.dataObj.deleted = !drug.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(
            (res) => this.updateStatusHandler(res, status),
            (err) => {
              console.log('error', err);
              // this.alertMessage.alert(err, 'error');
            },
          );

          drug.deleted = !drug.deleted;
        }
        // this.alertMessage.alert(status + 'd successfully');
      });
  }
  updateStatusHandler(response: any, status: any) {
    console.log('Drug status changed');
    this.alertMessage.alert(status + 'd successfully', 'success');
  }

  drugID: any;
  drugName: any;
  drugDesc: any;
  remarks: any;
  stateID: any;
  initializeObj() {
    this.drugID = '';
    this.drugName = '';
    this.drugDesc = '';
    this.remarks = '';
    this.stateID = '';
  }
  editDrugData(drug: any) {
    this.drugID = drug.drugID;
    this.drugName = drug.drugName;
    this.drugDesc = drug.drugDesc;
    this.remarks = drug.remarks;
    // this.stateID = drug.m_providerServiceMapping.state.stateID;
    this.editable = true;
    this.drugNameToEdit = drug.drugName;
  }

  updateDrugData(drug: any) {
    if (
      drug.drugName !== undefined &&
      drug.drugName !== null &&
      drug.drugName.trim() === ''
    )
      this.alertMessage.alert('Please enter valid Drug Name');
    else {
      this.dataObj = {};
      this.dataObj.drugID = this.drugID;
      this.dataObj.drugName =
        this.drugName !== undefined && this.drugName !== null
          ? this.drugName.trim()
          : null;
      this.dataObj.drugDesc =
        drug.drugDesc !== undefined && drug.drugDesc !== null
          ? drug.drugDesc.trim()
          : null;
      this.dataObj.remarks =
        drug.remarks !== undefined && drug.remarks !== null
          ? drug.remarks.trim()
          : null;
      this.dataObj.providerServiceMapID = drug.providerServiceMapID;
      this.dataObj.modifiedBy = this.createdBy;
      this.drugMasterService.updateDrugData(this.dataObj).subscribe(
        (response) => {
          if (response !== undefined && response !== null)
            this.updateHandler(response);
        },
        (err) => {
          console.log('error', err);
          // this.alertMessage.alert(err, 'error');
        },
      );
    }
  }

  updateHandler(response: any) {
    this.editable = false;
    this.alertMessage.alert('Updated successfully', 'success');
    this.getAvailableDrugs();
    this.availableDrugNames = [];
  }

  drugNameExist: any = false;
  inValidDrugName = false;
  checkExistance(drugName: any) {
    console.log('drugName', drugName);
    if (this.editable) {
      if (
        drugName !== undefined &&
        drugName !== null &&
        drugName.trim() !== this.drugNameToEdit
      ) {
        this.checkWithDrugmaster(drugName);
      }
    } else {
      this.checkWithDrugmaster(drugName);
    }
    console.log('drugNameExist', this.drugNameExist);
  }
  checkWithDrugmaster(drugName: any) {
    if (drugName !== undefined && drugName !== null && drugName.trim() !== '') {
      this.inValidDrugName = false;
      this.drugNameExist = this.availableDrugNames.includes(drugName.trim());
    } else {
      this.inValidDrugName = true;
      this.drugNameExist = false;
    }
  }
  remove_obj(index: any) {
    this.drugList.data.splice(index, 1);
  }
  clearEdit() {
    this.initializeObj();
    this.showDrugs = true;
    this.editable = false;
    this.drugNameExist = false;
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.fileteredavailableDrugs.data = this.availableDrugs;
      this.fileteredavailableDrugs.paginator = this.paginatorFirst;
    } else {
      this.fileteredavailableDrugs.data = [];
      this.fileteredavailableDrugs.paginator = this.paginatorFirst;
      this.availableDrugs.forEach((item: any) => {
        for (const key in item) {
          if (key === 'drugName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.fileteredavailableDrugs.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.drugForm.resetForm();
          this.clearEdit();
          this.drugList.data = [];
        }
      });
  }
  checkForValidDrugDesc(drugDesc: any) {
    if (drugDesc !== undefined && drugDesc !== null && drugDesc.trim() === '') {
      this.invalidDrugDesc = true;
    } else {
      this.invalidDrugDesc = false;
    }
  }
}
