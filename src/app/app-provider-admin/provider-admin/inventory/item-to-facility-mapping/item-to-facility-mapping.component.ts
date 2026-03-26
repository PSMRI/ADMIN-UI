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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemFacilityMappingService } from 'src/app/core/services/inventory-services/item-facility-mapping.service';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';
import { ItemService } from '../services/item.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-item-to-facility-mapping',
  templateUrl: './item-to-facility-mapping.component.html',
  styleUrls: ['./item-to-facility-mapping.component.css'],
})
export class ItemToFacilityMappingComponent implements OnInit {
  itemFacilityMapView = new MatTableDataSource<any>();
  bufferarray = new MatTableDataSource<any>();

  displayedColumns: string[] = [
    'sno',
    'facilityName',
    'itemName',
    'itemCategoryName',
    'action',
  ];

  bufferColumns: string[] = ['sno', 'facilityName', 'items', 'remove'];

  providerServiceMapID: any;
  createdBy: any;
  userID: any;

  // Service line
  services: any = [];
  service: any;

  // Location dropdowns
  state: any;
  district: any;
  taluk: any;
  states_array: any = [];
  districts_array: any = [];
  taluks_array: any = [];

  showFormFlag = false;
  showTableFlag = false;
  create_filterTerm!: string;

  facilities: any = [];
  itemCategory: any = [];
  itemsList: any = [];
  itemFacilityMapList: any = [];
  mapType: any = false;

  selectedFacility: any;
  itemCategoryselected: any = {};
  itemselected: any;

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.itemFacilityMapView.paginator = this.paginator;
  }

  @ViewChild('mappingFieldsForm')
  mappingFieldsForm!: NgForm;

  constructor(
    public commonDataService: dataService,
    public itemService: ItemService,
    public dialogService: ConfirmationDialogsService,
    public itemFacilityMappingService: ItemFacilityMappingService,
    public facilityService: FacilityMasterService,
    public commonServices: CommonServices,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.userID = this.commonDataService.uid;
    this.getAllServices();
  }

  getAllServices() {
    this.commonServices
      .getServiceLines(this.userID)
      .subscribe((response: any) => {
        this.services = response.data.filter((item: any) => {
          return (
            item.serviceID === 4 || item.serviceID === 9 || item.serviceID === 2
          );
        });
      });
  }

  getStates(service: any) {
    this.commonServices
      .getStatesOnServices(this.userID, service.serviceID, false)
      .subscribe((response: any) => {
        this.states_array = response.data;
      });
  }

  onStateSelect(state: any) {
    this.providerServiceMapID = state.providerServiceMapID;
    this.setItemCat(this.providerServiceMapID);
    this.getDistricts(state.stateID);
  }

  getDistricts(stateId: number) {
    this.districts_array = [];
    this.taluks_array = [];
    this.district = undefined;
    this.taluk = undefined;
    this.facilities = [];
    this.showTableFlag = false;
    this.facilityService.getDistricts(stateId).subscribe((response: any) => {
      if (response && response.data) {
        this.districts_array = response.data;
      }
    });
  }

  getTaluks(districtId: number) {
    this.taluks_array = [];
    this.taluk = undefined;
    this.facilities = [];
    this.showTableFlag = false;
    this.facilityService.getTaluks(districtId).subscribe((response: any) => {
      if (response && response.data) {
        this.taluks_array = response.data;
      }
    });
  }

  loadFacilitiesByBlock(blockID: number) {
    this.facilityService
      .getAllFacilitiesByBlock(blockID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.facilities = response.data.filter((f: any) => !f.deleted);
        } else {
          this.facilities = [];
        }
        this.showTableFlag = true;
        this.selectedViewFacility = undefined;
        this.itemFacilityMapList = [];
        this.itemFacilityMapView.data = [];
      });
  }

  selectedViewFacility: any;

  onViewFacilitySelect(facility: any) {
    this.selectedViewFacility = facility;
    this.loadMappingsByFacility(facility.facilityID);
  }

  loadMappingsByFacility(facilityID: number) {
    this.itemFacilityMappingService
      .getItemMappingsByFacilityID(facilityID)
      .subscribe(
        (response: any) => {
          if (response && response.data) {
            this.itemFacilityMapList = response.data;
            this.itemFacilityMapView.data = response.data;
          } else {
            this.itemFacilityMapList = [];
            this.itemFacilityMapView.data = [];
          }
        },
        () => {
          this.itemFacilityMapList = [];
          this.itemFacilityMapView.data = [];
        },
      );
  }

  setItemCat(providerServiceMapID: any) {
    this.itemService.getAllItemsCategory(providerServiceMapID, 0).subscribe(
      (response: any) => {
        this.itemCategory = response.data;
      },
      () => {
        console.log('ERROR in fetching item categories');
      },
    );
  }

  onCategorySelected(categoryId: any) {
    if (!this.selectedFacility || !this.providerServiceMapID) return;

    this.itemFacilityMappingService
      .getItemsOnCategory(this.providerServiceMapID, categoryId)
      .subscribe(
        (response: any) => {
          const mappedItem: number[] = [];
          this.itemFacilityMapList.forEach((element: any) => {
            if (element.facilityID === this.selectedFacility.facilityID) {
              mappedItem.push(parseInt(element.itemID));
            }
          });
          this.itemsList = response.data.filter(
            (item: any) =>
              mappedItem.indexOf(item.itemID) === -1 &&
              item.itemCategoryID === categoryId,
          );
        },
        () => {
          console.log('ERROR in fetching items');
        },
      );
  }

  addtoBufferArray(value: any) {
    if (!value.facility) {
      this.dialogService.alert('Please select a Facility');
      return;
    }

    const obj: any = {
      facilityID: value.facility.facilityID,
      facilityName: value.facility.facilityName,
      facilityCode: value.facility.facilityCode,
      itemID1: [],
      item: [],
      mappingType: 'Individual',
      createdBy: this.createdBy,
      status: 'Active',
      providerServiceMapID: this.providerServiceMapID,
      itemCategoryName: value.itemCategory.itemCategoryName,
    };

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
        this.bufferarray.data = [...this.bufferarray.data, obj];
      }
    } else {
      this.dialogService.alert('No Items to add');
      return;
    }
    this.resetForm();
  }

  checkinBuffer(obj: any) {
    const checkobj = this.bufferarray.data.filter(
      (item: any) => item.facilityID === obj.facilityID,
    );
    if (checkobj.length === 0) {
      return true;
    } else {
      const erroritems: string[] = [];
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
            obj.facilityName,
        );
      }
    }
    return false;
  }

  removeRow(index: any) {
    const data = [...this.bufferarray.data];
    data.splice(index, 1);
    this.bufferarray.data = data;
  }

  removeItem(rowIndex: any, itemIndex: any) {
    this.bufferarray.data[rowIndex].itemID1.splice(itemIndex, 1);
    this.bufferarray.data[rowIndex].item.splice(itemIndex, 1);
    if (this.bufferarray.data[rowIndex].itemID1.length === 0) {
      this.removeRow(rowIndex);
    }
  }

  submitMapping() {
    this.itemFacilityMappingService
      .setFacilityItemMapping(this.bufferarray.data)
      .subscribe(
        () => {
          this.dialogService.alert('Saved successfully', 'success');
          this.bufferarray.data = [];
          this.resetForm();
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.create_filterTerm = '';
          if (this.selectedViewFacility) {
            this.loadMappingsByFacility(this.selectedViewFacility.facilityID);
          }
        },
        (err) => {
          this.dialogService.alert(err, 'error');
        },
      );
  }

  showForm() {
    this.create_filterTerm = '';
    this.showFormFlag = true;
    this.showTableFlag = false;
  }

  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.bufferarray.data = [];
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.create_filterTerm = '';
          this.resetForm();
        }
      });
  }

  resetForm() {
    this.selectedFacility = undefined;
    this.itemCategoryselected = {};
    this.itemsList = [];
    this.itemselected = undefined;
    this.mapType = false;
  }

  filterItemFromList(searchTerm?: string) {
    if (!searchTerm) {
      this.itemFacilityMapView.data = this.itemFacilityMapList;
    } else {
      this.itemFacilityMapView.data = this.itemFacilityMapList.filter(
        (item: any) => {
          for (const key of ['facilityName', 'itemName', 'itemCategoryName']) {
            const value: string = '' + (item[key] || '');
            if (value.toLowerCase().includes(searchTerm.toLowerCase())) {
              return true;
            }
          }
          return false;
        },
      );
    }
    this.itemFacilityMapView.paginator = this.paginator;
  }

  activate(id: any, facilitydeleted: any, itemdeleted: any) {
    this.deleteMapping(id, false, 'Activate', facilitydeleted, itemdeleted);
  }

  deactivate(id: any, facilitydeleted: any, itemdeleted: any) {
    this.deleteMapping(id, true, 'Deactivate', facilitydeleted, itemdeleted);
  }

  deleteMapping(
    id: any,
    bool: any,
    message: any,
    facilitydeleted: any,
    itemdeleted: any,
  ) {
    if (itemdeleted || facilitydeleted) {
      if (itemdeleted) {
        this.dialogService.alert('Item is inactive', 'error');
      } else {
        this.dialogService.alert('Facility is inactive', 'error');
      }
    } else {
      this.dialogService
        .confirm('Confirm', 'Are you sure you want to ' + message + '?')
        .subscribe((response) => {
          if (response) {
            this.itemFacilityMappingService
              .deleteFacilityItemMapping(id, bool)
              .subscribe(
                () => {
                  this.dialogService.alert(
                    message + 'd successfully',
                    'success',
                  );
                  this.create_filterTerm = '';
                  if (this.selectedViewFacility) {
                    this.loadMappingsByFacility(
                      this.selectedViewFacility.facilityID,
                    );
                  }
                },
                (err) => {
                  this.dialogService.alert(err, 'error');
                },
              );
          }
        });
    }
  }
}
