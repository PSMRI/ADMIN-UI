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
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemFacilityMappingService } from 'src/app/core/services/inventory-services/item-facility-mapping.service';
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { ItemService } from '../services/item.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-item-to-store-mapping',
  templateUrl: './item-to-store-mapping.component.html',
  styleUrls: ['./item-to-store-mapping.component.css'],
})
export class ItemToStoreMappingComponent implements OnInit {
  itemFacilityMapView = new MatTableDataSource<any>();
  bufferarray = new MatTableDataSource<any>();
  providerServiceMapID: any;
  providerID: any;
  userID: any;
  state: any;
  service: any;
  createdBy: any;
  storeType = true;
  showFormFlag = false;
  showTableFlag = false;
  itemCategoryselected: any = {};
  create_filterTerm!: string;

  mappedItem: number[] = [];
  filterItem: any = [];
  services: any = [];
  filteredItemList: any = [];
  itemFacilityMapList: any = [];
  // itemFacilityMapView: any = [];
  states: any = [];
  stores: any = [];
  itemCategory: any = [];
  tempItemCategory: any = [];
  itemsList: any = [];
  mapType: any = false;
  disableSelection = false;
  // bufferarray: any = [];
  mainstores: any = [];
  substores: any = [];
  mainStore: any = {};
  subStore: any = {};
  itemselected: any;

  @ViewChild('mappingFieldsForm')
  mappingFieldsForm!: NgForm;
  createButton: any;
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.itemFacilityMapView.paginator = this.paginator;
  }

  constructor(
    public commonDataService: dataService,
    public itemService: ItemService,
    public commonServices: CommonServices,
    public storeService: Mainstroreandsubstore,
    public dialogService: ConfirmationDialogsService,
    public dialog: MatDialog,
    public itemFacilityMappingService: ItemFacilityMappingService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.providerID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    console.log('this.createdBy', this.createdBy);

    this.userID = this.commonDataService.uid;
    console.log('userID', this.userID);
    this.getAllServices();
  }
  getAllServices() {
    this.commonServices.getServiceLines(this.userID).subscribe(
      (response: any) => {
        console.log('serviceline', response);
        this.servicesSuccesshandler(response);
      },
      (err) => {
        console.log('ERROR in fetching serviceline');
      },
    );
  }
  servicesSuccesshandler(res: any) {
    this.services = res.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 4 || item.serviceID === 9 || item.serviceID === 2)
        return item;
    });
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    console.log('psmid', this.providerServiceMapID);
    // this.getAllItemsList(providerServiceMapID);
    this.setStores(providerServiceMapID);
    this.setItemCat(providerServiceMapID);
    this.getAllItemFacilityMapping(providerServiceMapID);
  }

  setStores(providerServiceMapID: any) {
    this.storeService.getAllStores(providerServiceMapID).subscribe(
      (response: any) => {
        console.log('serviceline', response.data);
        this.stores = response.data;
        this.filterStore(this.stores);
      },
      (err) => {
        console.log('ERROR in fetching serviceline');
      },
    );
  }

  setItemCat(providerServiceMapID: any) {
    this.itemService.getAllItemsCategory(providerServiceMapID, 0).subscribe(
      (response: any) => {
        console.log('serviceline', response.data);
        this.itemCategory = response.data;
        this.tempItemCategory = response.data;
      },
      (err) => {
        console.log('ERROR in fetching serviceline');
      },
    );
  }

  getStates(service: any) {
    console.log('value', service);
    this.commonServices
      .getStatesOnServices(this.userID, service.serviceID, false)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, service),
        (err) => {
          console.log('error in fetching states');
        },
      );
  }
  getStatesSuccessHandeler(response: any, service: any) {
    this.states = response.data;
  }
  filterItemFromList(searchTerm?: string) {
    if (!searchTerm) {
      this.itemFacilityMapView.data = this.itemFacilityMapList;
      this.itemFacilityMapView.paginator = this.paginator;
    } else {
      this.itemFacilityMapView.data = [];
      this.itemFacilityMapList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'facilityTypeName' ||
            key === 'facilityName' ||
            key === 'itemCode' ||
            key === 'itemName' ||
            key === 'itemCategoryName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.itemFacilityMapView.data.push(item);
              break;
            }
          }
        }
      });
    }
  }

  showForm() {
    this.create_filterTerm = '';
    this.showFormFlag = true;
    this.showTableFlag = false;
  }
  getAllItemFacilityMapping(providerServiceMapID: any) {
    this.itemFacilityMappingService
      .getAllFacilityItemMapping(providerServiceMapID)
      .subscribe(
        (response: any) => {
          console.log('serviceline', response.data);
          this.itemFacilityMapView.data = response.data;
          this.itemFacilityMapView.paginator = this.paginator;
          this.itemFacilityMapList = response.data;
          this.showTableFlag = true;
        },
        (err) => {
          console.log('ERROR in fetching serviceline');
        },
      );
  }
  onCategorySelected(categoryId: any, mainStore: any) {
    const mainID = mainStore.facilityID;
    if (this.storeType) {
      if (this.mainStore.mainFacilityID === undefined) {
        this.itemFacilityMappingService
          .getItemsOnCategory(this.providerServiceMapID, categoryId)
          .subscribe(
            (response: any) =>
              this.onCategorySelectedSuccessHandeler(
                response,
                categoryId,
                this.mainStore,
              ),
            (err) => {
              console.log('ERROR in fetching items');
            },
          );
      } else {
        this.itemFacilityMappingService
          .getItemsForSubStore(
            this.providerServiceMapID,
            this.mainStore.mainFacilityID,
          )
          .subscribe(
            (response: any) =>
              this.onCategorySelectedSuccessHandeler(
                response,
                categoryId,
                this.mainStore,
              ),
            (err) => {
              console.log('ERROR in fetching items');
            },
          );
      }
    } else {
      if (this.subStore.mainFacilityID === undefined) {
        this.itemFacilityMappingService
          .getItemsOnCategory(this.providerServiceMapID, categoryId)
          .subscribe(
            (response: any) =>
              this.onCategorySelectedSuccessHandeler(
                response,
                categoryId,
                this.subStore,
              ),
            (err) => {
              console.log('ERROR in fetching items');
            },
          );
      } else {
        this.itemFacilityMappingService
          .getItemsForSubStore(this.providerServiceMapID, mainID)
          .subscribe(
            (response: any) =>
              this.onCategorySelectedSuccessHandeler(
                response,
                categoryId,
                this.subStore,
              ),
            (err) => {
              console.log('ERROR in fetching items');
            },
          );
      }
    }
  }
  onCategorySelectedSuccessHandeler(
    response: any,
    categoryId: any,
    storeType: any,
  ) {
    const mappedItem: any = [];
    this.itemFacilityMapList.forEach((element: any) => {
      if (element.facilityID === storeType.facilityID) {
        mappedItem.push(parseInt(element.itemID));
      }
    });
    console.log(mappedItem);
    this.itemsList = response.data.filter((item: any) => {
      console.log(
        item.itemID,
        'ddd',
        mappedItem.indexOf(item.itemID) === -1 &&
          item.itemCategoryID === categoryId,
      );
      return (
        mappedItem.indexOf(item.itemID) === -1 &&
        item.itemCategoryID === categoryId
      );
    });
  }
  addtoBufferArray(value: any) {
    const obj: any = {
      facilityID: value.mainStore.facilityID,
      facilityName: value.mainStore.facilityName,
      facilityCode: value.mainStore.facilityCode,
      itemID1: [],
      item: [],
      mappingType: 'Individual',
      createdBy: 'Akash',
      status: 'Active',
      providerServiceMapID: this.providerServiceMapID,
      itemCategoryName: value.itemCategory.itemCategoryName,
    };
    if (!value.storeType) {
      if (value.subStore !== undefined) {
        obj.facilityID = value.subStore.facilityID;
        obj.facilityName = value.subStore.facilityName;
      } else {
        this.dialogService.alert('Please select Substore Before Proceeding');
        return;
      }
    } else {
      if (value.mainStore === undefined) {
        this.dialogService.alert('Please select Substore Before Proceeding');
        return;
      }
    }

    if (value.mapType) {
      obj.mappingType = 'BULK';
      this.itemsList.forEach((element: any) => {
        obj.itemID1.push(element.itemID);
        obj.item.push(element);
      });
    } else {
      if (value.itemName !== undefined && value.itemName.length > 0) {
        value.itemName.forEach((element: any) => {
          obj.itemID1.push(element.itemID);
          obj.item.push(element);
        });
      } else {
        this.dialogService.alert('Please add Items Before Proceeding');
        return;
      }
    }
    if (obj.itemID1.length > 0) {
      if (this.checkinBuffer(obj)) {
        this.bufferarray.data.push(obj);
      }
    } else {
      this.dialogService.alert('No Items to add');
      return;
    }
    this.resetForm();
  }

  removeRow(index: any) {
    this.bufferarray.data.splice(index, 1);
  }

  removeItem(rowIndex: any, stateIndex: any) {
    this.bufferarray.data[rowIndex].itemID1.splice(stateIndex, 1);
    this.bufferarray.data[rowIndex].item.splice(stateIndex, 1);

    if (this.bufferarray.data[rowIndex].itemID1.length === 0) {
      this.bufferarray.data.splice(rowIndex, 1);
    }
  }

  checkinBuffer(obj: any) {
    let checkobj = [];
    checkobj = this.bufferarray.data.filter(function (item: any) {
      return item.facilityID === obj.facilityID; // This value has to go in constant
    });
    if (checkobj.length === 0) {
      return true;
    } else {
      const erroritems = [];
      for (let i = 0; i < obj.itemID1.length; i++) {
        if (checkobj[0].itemID1.indexOf(obj.itemID1[i]) === -1) {
          checkobj[0].itemID1.push(obj.itemID1[i]);
          checkobj[0].item.push(obj.item[i]);
        } else {
          erroritems.push(obj.item[i].itemName);
        }
      }
      if (erroritems.length > 0) {
        this.dialogService.alert(
          erroritems.toString() +
            ' already added for mapping in ' +
            obj.facilityName +
            ' facility',
        );
      }
    }
    return false;
  }

  checkInMain(input: any) {
    const obj = input;
    const faciltyitem = this.itemFacilityMapList.filter(function (item: any) {
      return item.facilityID === obj.facilityID; // This value has to go in constant
    });
    const erroritems = [];
    for (let i = 0; i < obj.itemID1.length; i++) {
      for (let j = 0; j < faciltyitem.length; j++) {
        if (faciltyitem[j].itemID === obj.itemID1[i]) {
          obj.itemID1.splice(i, 1);
          obj.item.splice(i, 1);
          erroritems.push(obj.item[i].itemName);
        }
      }
    }
    if (erroritems.length > 0) {
      this.dialogService.alert(
        erroritems.toString() +
          ' Already exists in ' +
          obj.facilityName +
          ' facility',
      );
    }
    return obj;
  }
  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          //this.mappingFieldsForm.resetForm();
          this.bufferarray.data = [];
          this.showTableFlag = true;
          this.showFormFlag = false;
          // this.disableSelection = false;
          this.create_filterTerm = '';
          this.resetForm();
          this.getAllItemFacilityMapping(this.providerServiceMapID);
        }
      });
  }
  resetForm() {
    // this.mappingFieldsForm.reset();
    this.storeType = true;
    this.mapType = false;
    this.mainstores = [];
    this.setStores(this.providerServiceMapID);
  }

  submitMapping() {
    this.itemFacilityMappingService
      .setFacilityItemMapping(this.bufferarray.data)
      .subscribe(
        (response: any) => {
          console.log(
            response,
            'after successful mapping of provider to service and state',
          );
          this.dialogService.alert('Saved successfully', 'success');
          this.getAllItemFacilityMapping(this.providerServiceMapID);
          this.bufferarray.data = [];
          this.resetForm();
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.create_filterTerm = '';
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.log(err, 'ERROR');
        },
      );
  }
  filterStore(store: any) {
    console.log('store', store);
    this.mainstores = store.filter(function (item: any) {
      return item.isMainFacility === true && item.deleted === false; // This value has to go in constant
    });
    console.log('this.mainstores', this.mainstores);
  }
  subStorelist(facID: any) {
    this.itemCategoryselected = {};
    console.log('Stores', this.stores);
    this.substores = this.stores.filter(function (item: any) {
      return (
        item.mainFacilityID === facID &&
        item.deleted === false &&
        item.isMainFacility === false
      ); // This value has to go in constant
    });
  }

  deleteMapping(
    id: any,
    bool: any,
    Message: any,
    facilitydeleted: any,
    itemdeleted: any,
  ) {
    if (itemdeleted || facilitydeleted) {
      if (itemdeleted) {
        this.dialogService.alert('Item is inactive', 'error');
      } else {
        this.dialogService.alert('Store is inactive', 'error');
      }
    } else {
      this.dialogService
        .confirm('Confirm', 'Are you sure you want to ' + Message + '?')
        .subscribe((response) => {
          if (response) {
            this.itemFacilityMappingService
              .deleteFacilityItemMapping(id, bool)
              .subscribe(
                (response) => {
                  this.dialogService.alert(
                    Message + 'd successfully',
                    'success',
                  );
                  this.getAllItemFacilityMapping(this.providerServiceMapID);
                  this.create_filterTerm = '';
                },
                (err) => {
                  this.dialogService.alert(err, 'error');
                  console.log(err, 'ERROR');
                },
              );
          }
        });
    }
  }
  activate(id: any, facilitydeleted: any, itemdeleted: any) {
    this.deleteMapping(id, false, 'Activate', facilitydeleted, itemdeleted);
  }
  deactivate(id: any, facilitydeleted: any, itemdeleted: any) {
    this.deleteMapping(id, true, 'Deactivate', facilitydeleted, itemdeleted);
  }
}
