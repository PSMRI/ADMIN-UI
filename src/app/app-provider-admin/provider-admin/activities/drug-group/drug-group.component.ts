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
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { DrugMasterService } from '../../inventory/services/drug-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-drug-group',
  templateUrl: './drug-group.component.html',
})
export class DrugGroupComponent implements OnInit, AfterViewInit {
  showDrugGroups: any = true;
  availableDrugGroups: any = [];
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  showPaginationControls: any = true;
  editable: any = false;
  availableDrugGroupNames: any = [];
  serviceID104: any;
  createdBy: any;
  sno: any = 0;
  invalidDrugDesc = false;
  @ViewChild('drugGroupForm') drugGroupForm!: NgForm;
  drugGroupToEdit: any;
  displayedColumns = ['sno', 'drugGroup', 'drugGroupDesc', 'edit', 'action'];

  displayAddedColumns = ['sno', 'drugGroup', 'drugGroupDesc', 'action'];

  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  filteredavailableDrugGroups = new MatTableDataSource<any>();
  drugGroupList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public drugMasterService: DrugMasterService,
    private alertMessage: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.data = [];
    this.service_provider_id =
      this.sessionstorage.getItem('service_providerID');
    this.serviceID104 = this.commonDataService.serviceID104;
    this.createdBy = this.commonDataService.uname;
  }

  ngOnInit() {
    this.getAvailableDrugs();
    this.getStatesByServiceID();
  }

  ngAfterViewInit() {
    this.filteredavailableDrugGroups.paginator = this.paginatorFirst;
    this.drugGroupList.paginator = this.paginatorSecond;
  }

  stateSelection(stateID: any) {
    this.getServices(stateID);
  }

  getAvailableDrugs() {
    this.drugGroupObj = {};
    this.drugGroupObj.serviceProviderID = this.service_provider_id;
    this.drugMasterService.getDrugGroups(this.drugGroupObj).subscribe(
      (response: any) => this.getDrugGroupsSuccessHandeler(response),
      (err) => {
        console.log('error', err);
      },
    );
  }

  getDrugGroupsSuccessHandeler(response: any) {
    this.availableDrugGroups = response.data;
    this.filteredavailableDrugGroups.data = response.data;
    for (const availableDrugGroup of this.availableDrugGroups) {
      this.availableDrugGroupNames.push(availableDrugGroup.drugGroup);
    }
  }
  getServices(stateID: any) {
    this.providerAdminRoleService
      .getServices(this.service_provider_id, stateID)
      .subscribe(
        (response: any) => this.getServicesSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          //this.alertMessage.alert(err, 'error')
        },
      );
  }

  getStates() {
    this.providerAdminRoleService.getStates(this.service_provider_id).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response),
      (err) => {
        console.log('error', err);
        //this.alertMessage.alert(err, 'error')
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
          //this.alertMessage.alert(err, 'error')
        },
      );
  }

  getStatesSuccessHandeler(response: any) {
    this.provider_states = response.data;
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
    this.showDrugGroups = false;
    this.inValidDrugGroup = false;
    this.invalidDrugDesc = false;
    this.drugGroupList.data = [];
    this.drugGroupList.paginator = this.paginatorSecond;
  }

  drugGroupObj: any;
  // = {
  // 	'drugGroup':'',
  //   'drugGroupDesc':'',
  //   'providerServiceMapID':'',
  //   'createdBy':''
  // };

  addDrugGroupToList(values: any) {
    const drugGroup =
      values.drugGroup !== undefined && values.drugGroup !== null
        ? values.drugGroup.trim()
        : null;
    const drugGroupDesc =
      values.drugGroupDesc !== undefined && values.drugGroupDesc !== null
        ? values.drugGroupDesc.trim()
        : null;

    const drugGroupObj = {
      drugGroup: drugGroup,
      drugGroupDesc: drugGroupDesc,
      serviceProviderID: this.service_provider_id,
      createdBy: this.createdBy,
    };
    this.checkDuplicates(drugGroupObj);
  }

  checkDuplicates(object: any) {
    if (this.drugGroupList.data.length === 0) {
      this.drugGroupList.data = [...this.drugGroupList.data, object];
    } else {
      const isDuplicate = this.drugGroupList.data.some(
        (item) => item.drugGroup === object.drugGroup,
      );
      if (!isDuplicate) {
        this.drugGroupList.data = [...this.drugGroupList.data, object];
      } else {
        this.alertMessage.alert('Drug group already exists');
      }
    }
  }

  storeDrugGroup() {
    const obj = { drugGroups: this.drugGroupList.data };
    this.drugMasterService
      .saveDrugGroups(JSON.stringify(obj))
      .subscribe((response: any) => this.successHandler(response));
  }

  successHandler(response: any) {
    this.drugGroupList.data = [];
    this.alertMessage.alert('Saved successfully', 'success');
    this.getAvailableDrugs();
    this.clearEdit();
    this.reset();
  }
  dataObj: any = {};
  updateDrugGroupStatus(drugGroup: any) {
    const flag = !drugGroup.deleted;
    let status: any;
    if (flag === true) {
      status = 'Deactivate';
    }
    if (flag === false) {
      status = 'Activate';
    }
    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to ' + status + '?')
      .subscribe((response) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.drugGroupID = drugGroup.drugGroupID;
          this.dataObj.deleted = !drugGroup.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.drugMasterService.updateDrugStatus(this.dataObj).subscribe(
            (response: any) => {
              this.alertMessage.alert(status + 'd successfully', 'success');
            },
            (err) => {
              console.log('error', err);
              //this.alertMessage.alert(err, 'error')
            },
          );
          drugGroup.deleted = !drugGroup.deleted;
        }
      });
  }
  activePage: any;
  // updateStatusHandler(response) {

  //   console.log("Drug Group status changed");
  // }

  remove_obj(index: any) {
    const newData = [...this.drugGroupList.data];
    newData.splice(index, 1);
    this.drugGroupList.data = newData;
    this.cdr.detectChanges();
  }

  drugGroupID: any;
  drugGroup: any;
  drugGroupDesc: any;
  stateID: any;

  initializeObj() {
    this.drugGroupID = '';
    this.drugGroup = '';
    this.drugGroupDesc = '';
    this.stateID = '';
  }
  editDrugGroup(drug: any) {
    this.drugGroupID =
      drug.drugGroupID !== null && drug.drugGroupID !== undefined
        ? parseInt(drug.drugGroupID)
        : null;
    this.drugGroup =
      typeof drug.drugGroup === 'string' && drug.drugGroup.trim() !== ''
        ? drug.drugGroup.trim()
        : null;
    this.drugGroupDesc =
      typeof drug.drugGroupDesc === 'string' && drug.drugGroupDesc.trim() !== ''
        ? drug.drugGroupDesc.trim()
        : null;
    //this.stateID = drug.m_providerServiceMapping.state.stateID;
    this.editable = true;
    this.drugGroupToEdit = drug.drugGroup;
  }

  updateDrugGroup(drugGroup: any) {
    if (
      drugGroup.drugGroup !== undefined &&
      drugGroup.drugGroup !== null &&
      drugGroup.drugGroup.trim() === ''
    ) {
      this.alertMessage.alert('Please enter valid Drug Group Name');
    } else {
      this.dataObj = {};
      this.dataObj.drugGroupID =
        this.drugGroupID !== undefined && this.drugGroupID !== null
          ? this.drugGroupID
          : null;
      this.dataObj.drugGroup =
        drugGroup.drugGroup !== undefined && drugGroup.drugGroup !== null
          ? drugGroup.drugGroup.trim()
          : null;
      this.dataObj.drugGroupDesc =
        drugGroup.drugGroupDesc !== undefined &&
        drugGroup.drugGroupDesc !== null
          ? drugGroup.drugGroupDesc.trim()
          : null;
      //this.dataObj.providerServiceMapID = drugGroup.providerServiceMapID;
      this.dataObj.modifiedBy = this.createdBy;
      this.drugMasterService.updateDrugGroup(this.dataObj).subscribe(
        (response) => {
          if (response !== undefined && response !== null)
            this.updateHandler(response);
        },
        (err) => {
          console.log('error', err);
          //this.alertMessage.alert(err, 'error')
        },
      );
    }
  }

  updateHandler(response: any) {
    this.editable = false;
    this.alertMessage.alert('Updated successfully', 'success');
    this.getAvailableDrugs();
    this.availableDrugGroupNames = [];
  }

  groupNameExist: any = false;
  inValidDrugGroup = false;
  checkExistance(drugGroup: any) {
    if (this.editable) {
      if (
        drugGroup !== undefined &&
        drugGroup !== null &&
        drugGroup.trim() !== this.drugGroupToEdit
      ) {
        this.checkWithDrugmaster(drugGroup);
      }
    } else {
      this.checkWithDrugmaster(drugGroup);
    }
  }
  checkWithDrugmaster(drugGroup: any) {
    if (
      drugGroup !== undefined &&
      drugGroup !== null &&
      drugGroup.trim() !== ''
    ) {
      this.inValidDrugGroup = false;
      this.groupNameExist = this.availableDrugGroupNames.includes(
        drugGroup.trim(),
      );
    } else {
      this.inValidDrugGroup = true;
      this.groupNameExist = false;
    }
  }
  clearEdit() {
    this.initializeObj();
    this.showDrugGroups = true;
    this.editable = false;
    this.groupNameExist = false;
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableDrugGroups.data = this.availableDrugGroups;
      this.filteredavailableDrugGroups.paginator = this.paginator;
      this.filteredavailableDrugGroups.sort = this.sort;
    } else {
      this.filteredavailableDrugGroups.data = [];
      this.filteredavailableDrugGroups.sort = this.sort;
      this.availableDrugGroups.forEach((item: any) => {
        for (const key in item) {
          if (key === 'drugGroup') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableDrugGroups.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredavailableDrugGroups.paginator = this.paginator;
      this.filteredavailableDrugGroups.paginator = this.paginatorFirst;
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
          this.drugGroupForm.resetForm();
          this.reset();
          this.clearEdit();
          this.drugGroupList.data = [];
        }
      });
  }

  reset() {
    this.drugGroupList.data = [];
    this.drugGroupList.paginator = this.paginatorSecond;
  }

  checkForValidDrugDesc(drugDesc: any) {
    if (drugDesc !== undefined && drugDesc !== null && drugDesc.trim() === '') {
      this.invalidDrugDesc = true;
    } else {
      this.invalidDrugDesc = false;
    }
  }
}
