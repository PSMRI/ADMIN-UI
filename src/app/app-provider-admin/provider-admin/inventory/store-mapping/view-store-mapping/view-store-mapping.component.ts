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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';

import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

import { StoreMappingService } from 'src/app/core/services/inventory-services/store-mapping.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-view-store-mapping',
  templateUrl: './view-store-mapping.component.html',
  styleUrls: ['./view-store-mapping.component.css'],
})
export class ViewStoreMappingComponent implements OnInit, OnDestroy {
  filteredStoreList = new MatTableDataSource<any>();
  // itemArrayObj = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  storeSearchForm!: FormGroup;
  providerID!: string;
  createdBy!: string;
  userID!: string;
  providerServiceMapID!: string;
  parkAndHub: any;
  vanAndSpoke: any;

  serviceLineList!: [any];
  stateList!: [any];
  storeList = [];
  // filteredStoreList = [];

  mode = 'view';

  constructor(
    private fb: FormBuilder,
    private commonDataService: dataService,
    private storeMappingService: StoreMappingService,
    private commonServices: CommonServices,
    private dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.providerID = this.commonDataService.service_providerID;
    this.createdBy = this.commonDataService.uname;
    this.userID = this.commonDataService.uid;

    this.storeSearchForm = this.createStoreSearchForm();
    this.subscribeToServiceLineChange();
    this.subscribeToStateChange();
    this.getServiceLine(this.userID);
  }

  ngOnDestroy() {
    if (this.serviceLineSubs) this.serviceLineSubs.unsubscribe();
  }

  createStoreSearchForm() {
    return this.fb.group({
      service: null,
      state: null,
    });
  }

  serviceLineSubs: any;
  getServiceLine(userID: string) {
    this.serviceLineSubs = this.commonServices
      .getServiceLines(userID)
      .subscribe(
        (response: any) => {
          this.serviceLineList = response.data.filter(function (item: any) {
            console.log('item', item);
            if (
              item.serviceID === 4 ||
              item.serviceID === 9 ||
              item.serviceID === 2
            )
              return item;
          });
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching serviceLines');
        },
      );
  }

  subscribeToServiceLineChange() {
    this.storeSearchForm.controls['service'].valueChanges.subscribe(
      (value: any) => {
        if (value) {
          this.filteredStoreList.data = [];
          this.filteredStoreList.paginator = this.paginator;
          this.storeList = [];
          this.getState(this.userID, value);
        }
      },
    );
  }

  stateSubs: any;
  getState(userID: string, service: any) {
    if (service.serviceID === 4) {
      this.parkAndHub = 'Hub';
      this.vanAndSpoke = 'Spoke';
    } else {
      this.parkAndHub = 'Parking Place';
      this.vanAndSpoke = 'Van';
    }
    this.stateSubs = this.commonServices
      .getStatesOnServices(userID, service.serviceID, false)
      .subscribe(
        (response: any) => {
          this.stateList = response.data;
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching states');
        },
      );
  }

  subscribeToStateChange() {
    this.storeSearchForm.controls['state'].valueChanges.subscribe(
      (value: any) => {
        if (value && value.providerServiceMapID) {
          this.providerServiceMapID = value.providerServiceMapID;
          this.getAllStore(value.providerServiceMapID);
        }
      },
    );
  }

  storeSubs: any;
  getAllStore(providerServiceMapID: any) {
    this.storeSubs = this.storeMappingService
      .getAllStore(providerServiceMapID)
      .subscribe(
        (response: any) => {
          this.storeList = response.data;
          this.filteredStoreList.data = response.data;
          this.filteredStoreList.paginator = this.paginator;
          console.log('Store', this.storeList);
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching store');
        },
      );
  }

  filterStoreList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredStoreList.data = this.storeList.slice();
      this.filteredStoreList.paginator = this.paginator;
    } else {
      this.filteredStoreList.data = [];
      this.storeList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'facilityName' ||
            key === 'storeType' ||
            key === 'parkingPlaceName' ||
            key === 'vanName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              if (this.filteredStoreList.data.indexOf(item) === -1)
                this.filteredStoreList.data.push(item);
            }
          }
        }
      });
      this.filteredStoreList.paginator = this.paginator;
    }
  }

  deleteMapping(store: any) {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to unmap?')
      .subscribe((res) => {
        if (res) {
          const temp = Object.assign(
            {},
            {
              createdBy: this.createdBy,
              facilityID: store.facilityID,
              parkingPlaceID: store.parkingPlaceID,
              vanID: store.vanID,
            },
          );
          this.storeMappingService.deleteMapping(temp).subscribe(
            (response) => {
              this.dialogService.alert('Unmapped successfully', 'success');
              this.getAllStore(this.providerServiceMapID);
            },
            (err) => {
              this.dialogService.alert(err.errorMessage, 'error');
            },
          );
        }
      });
  }

  otherDetails: any;
  switchToCreateMode() {
    this.otherDetails = Object.assign({}, this.storeSearchForm.value, {
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
    });
    this.mode = 'create';
  }

  switchToViewMode() {
    this.mode = 'view';
    this.getAllStore(this.providerServiceMapID);
  }

  storeDetails: any;
  switchToUpdateMode(store: any) {
    this.storeDetails = Object.assign(
      {},
      { store },
      {
        providerServiceMapID: this.providerServiceMapID,
        createdBy: this.createdBy,
      },
    );
    this.mode = 'update';
  }

  trackByFn(index: any, item: any) {
    return item.facilityID;
  }
}
