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
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { NgForm } from '@angular/forms';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-main-store-and-sub-store',
  templateUrl: './main-store-and-sub-store.component.html',
  styleUrls: ['./main-store-and-sub-store.component.css'],
})
export class MainStoreAndSubStoreComponent implements OnInit {
  getProviderStatesInService() {
    throw new Error('Method not implemented.');
  }
  filteredstoresList = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  createButton = false;
  create_store: any;
  facilityID: any;
  edit_facilityName: any;
  edit_facilityType: any;
  edit_State: any;
  edit_Serviceline: any;
  edit_substore = false;
  edit_mainstore: any = false;
  edit_physicalLocation: any;
  confirmMessage: any;
  edit_location: any;
  edit_facilityDiscription: any;
  edit_facilityCode: any;
  uid: any;
  edit_store: any;
  storeType_arrayEdit: any;
  create_filterTerm!: string;
  state: any;
  serviceline: any;
  storeType!: string;
  facilityTypeID: any;
  formMode = false;
  tableMode = true;
  editMode = false;
  showTableFlag = false;
  mainStoreDropdownState = false;
  create_Main_Store_radiobutton = false;
  create_Sub_Store_radiobutton = false;

  providerServiceMapID: any;
  serviceProviderID: any;
  createdBy: any;

  states_array: any = [];
  storeType_array: any = [];
  availableFacilityCode: any = [];
  services_array: any = [];
  store_array: any = [];
  // filteredstoresList: any = [];
  facilityType_array: any = [];
  storesList: any = [];
  // bufferArray: any = [];

  @ViewChild('storeSearchForm')
  facilitySearchForm!: NgForm;
  @ViewChild('storeAddForm')
  facilityAddForm!: NgForm;
  @ViewChild('storeEditForm')
  faciliTypEditForm!: NgForm;
  create_facilityCode: any;
  create_facilityType: any;
  create_facilityName: any;
  create_facilityDiscription: any;
  create_location: any;
  create_physicalLocation: any;
  constructor(
    public commonservice: CommonServices,
    private storeService: Mainstroreandsubstore,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uid = this.commonDataService.uid;
    this.getServices();
  }
  getServices() {
    this.commonservice.getServiceLines(this.uid).subscribe((response: any) => {
      if (response) {
        console.log('All services success', response.data);
        this.services_array = response.data.filter(function (item: any) {
          console.log('item', item);
          if (
            item.serviceID === 4 ||
            item.serviceID === 9 ||
            item.serviceID === 2
          )
            return item;
        });
      }
    });
  }
  getstates(service: any) {
    this.storeService
      .getStates(this.uid, service.serviceID, false)
      .subscribe((response: any) => {
        if (response) {
          console.log('All states success based on service', response.data);
          this.states_array = response.data;
        }
      });
  }
  getAllStores(providerServiceMapID: any) {
    this.createButton = true;
    this.providerServiceMapID = providerServiceMapID;
    this.storeService
      .getAllStores(providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          console.log('All stores services success', response.data);
          this.storesList = response.data;
          this.filteredstoresList.data = response.data;
          this.filteredstoresList.paginator = this.paginator;
          this.showTableFlag = true;
          for (const availableFacilityCode of this.storesList) {
            this.availableFacilityCode.push(availableFacilityCode.facilityCode);
          }
          this.getFacilityType();
        }
      });
  }
  getFacilityType() {
    //this.providerServiceMapID = providerServiceMapID;
    this.storeService
      .getAllActiveFacilities(this.providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          console.log('All Facility Types services success', response.data);
          this.facilityType_array = response.data;
          this.getStoreType();
        }
      });
  }
  getStoreType() {
    //this.providerServiceMapID = providerServiceMapID;
    this.storeService
      .getStoreType(this.providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          console.log('All Main stores services success', response.data);
          this.storeType_array = response.data;
        }
      });
  }
  filterstoreList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredstoresList.data = this.storesList;
    } else {
      this.filteredstoresList.data = [];
      this.storesList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'facilityCode' ||
            key === 'facilityName' ||
            key === 'facilityDesc' ||
            key === 'location' ||
            key === 'physicalLocation'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredstoresList.data.push(item);
              break;
            }
          }
        }
      });
    }
  }

  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.resetDropdowns();
    this.getAllStores(this.providerServiceMapID);
    this.create_filterTerm = '';
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
    this.create_Main_Store_radiobutton = true;
    this.disbleDropdown(true);
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  activateDeactivate(facilityTypeID: any, flag: any) {
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.dialogService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe((response: any) => {
        if (response) {
          const object = {
            facilityID: facilityTypeID,
            deleted: flag,
          };
          this.storeService.deleteStore(object).subscribe(
            (res: any) => {
              if (res.status === 'Success') {
                this.dialogService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.getAllStores(this.providerServiceMapID);
                this.create_filterTerm = '';
              } else {
                this.dialogService.alert(res.errorMessage, 'error');
              }
            },
            (err) => {
              console.log('error', err);
              this.dialogService.alert(err.errorMessage, 'error');
            },
          );
        }
      });
  }

  add2bufferArray(formvalues: any) {
    this.resetDropdowns();
    console.log('form values', formvalues);
    const obj = {
      serviceName: this.serviceline.serviceName,
      stateName: this.state.stateName,
      facilityName: formvalues.facilityName,
      facilityDesc: formvalues.facilityDescription,
      facilityCode: formvalues.facilityCode,
      facilityTypeID: formvalues.facilityType.facilityTypeID,
      facilityType: formvalues.facilityType.facilityTypeName,
      location: formvalues.createlocation,
      mainFacilityID: formvalues.store,
      physicalLocation: formvalues.physicalLocation,
      storeType: this.storeType,
      status: 'active',
      isMainFacility: this.storeType === 'MAIN' ? true : false,
      createdBy: this.createdBy,
      providerServiceMapID: this.providerServiceMapID,
    };
    this.checkDuplictes(obj);
  }
  checkDuplictes(object: any) {
    let duplicateStatus = 0;
    if (this.bufferArray.data.length === 0) {
      this.bufferArray.data.push(object);
      this.bufferArray.paginator = this.paginator;
    } else {
      for (let i = 0; i < this.bufferArray.data.length; i++) {
        if (
          this.bufferArray.data[i].facilityCode === object.facilityCode &&
          this.bufferArray.data[i].facilityName === object.facilityName
        ) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.bufferArray.data.push(object);
        this.bufferArray.paginator = this.paginator;
      }
    }
  }
  removeRow(index: any) {
    this.bufferArray.data.splice(index, 1);
  }
  saveStores() {
    console.log('object before saving the store', this.bufferArray);
    this.storeService.saveStore(this.bufferArray.data).subscribe(
      (response: any) => {
        if (response) {
          console.log(response.data, 'after successful creation of store');
          this.dialogService.alert('Saved successfully', 'success');
          this.resetDropdowns();
          this.showTable();
          this.getAllStores(this.providerServiceMapID);
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  editFacility(editFormValues: any) {
    this.edit_Serviceline = this.serviceline;
    this.edit_State = this.state;
    this.facilityID = editFormValues.facilityID;
    this.edit_facilityType = editFormValues.facilityTypeID;
    this.edit_facilityName = editFormValues.facilityName;
    this.edit_facilityCode = editFormValues.facilityCode;
    this.edit_facilityDiscription = editFormValues.facilityDesc; //facilityTypeID
    this.edit_location = editFormValues.location;
    this.edit_physicalLocation = editFormValues.physicalLocation;
    this.edit_store = editFormValues.mainFacilityID;
    if (editFormValues.storeType === 'MAIN') {
      this.edit_mainstore = true;
      this.edit_substore = false;
      const subStore: any = [];
      subStore.push(this.facilityID);
      for (let i = 0; i < subStore.length; i++) {
        const stores = this.storeType_array.filter(
          (book: any) => book.mainFacilityID === subStore[i],
        );
        stores.forEach((store: any) => {
          subStore.push(store.facilityID);
        });
      }

      this.storeType_arrayEdit = this.storeType_array.filter(function (
        store: any,
      ) {
        return subStore.indexOf(store.facilityID) === -1;
      });
    } else {
      this.edit_mainstore = false;
      this.edit_substore = true;
      this.storeType_arrayEdit = this.storeType_array;
    }
    this.showEditForm();
    console.log('edit form values', editFormValues);
  }

  updateFacilityType(editedFormValues: any) {
    const editObj = {
      facilityID: this.facilityID,
      location: editedFormValues.createlocation,
      physicalLocation: editedFormValues.physicalLocation,
      facilityDesc: editedFormValues.facilityDescription,
      ModifiedBy: this.createdBy,
    };

    this.storeService.updateStore(editObj).subscribe(
      (response: any) => {
        if (response) {
          console.log(response.data, 'after successful updation of Store');
          this.dialogService.alert('Updated successfully', 'success');
          this.resetDropdowns();
          this.showTable();
          this.getAllStores(this.providerServiceMapID);
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }

  resetDropdowns() {
    this.edit_facilityDiscription = undefined;
  }
  disbleDropdown(value: any) {
    if (value) {
      this.storeType = 'MAIN';
      this.create_store = undefined;
      this.create_Main_Store_radiobutton = true;
    } else {
      this.storeType = 'SUB';
      this.create_store = undefined;
    }
    this.mainStoreDropdownState = value;
  }
  FacilityCodeExist: any = false;
  checkExistance(facilityCode: any) {
    this.FacilityCodeExist = this.availableFacilityCode.includes(facilityCode);
    console.log(this.FacilityCodeExist);
  }
}
