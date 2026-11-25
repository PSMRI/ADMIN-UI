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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

@Component({
  selector: 'app-expiry-date-alert-configuration',
  templateUrl: './expiry-date-alert-configuration.component.html',
  styleUrls: ['./expiry-date-alert-configuration.component.css'],
})
export class ExpiryDateAlertConfigurationComponent implements OnInit {
  createdBy!: string;
  serviceProviderID!: string;
  providerServiceMapID: any;
  uid!: string;

  mode!: string;
  filterTerm: any;
  serviceline: any;
  state: any;

  services_array: any;
  states_array: any;
  itemCategory_array: any;
  // filteredItemCategory_array: any;
  filteredItemCategory_array = new MatTableDataSource<any>();
  unmappedItemCategory: any;
  // expiryAlertConfigList: any = [];
  expiryAlertConfigList = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  setDataSourceAttributes() {
    this.filteredItemCategory_array.paginator = this.paginator;
  }
  displayedColumns: string[] = [
    'sno',
    'itemCategoryCode',
    'itemCategoryName',
    'alertBeforeDays',
    'edit',
  ];
  constructor(
    public commonservice: CommonServices,
    private storeService: Mainstroreandsubstore,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.serviceProviderID = this.commonDataService.service_providerID;
    this.uid = this.commonDataService.uid;

    this.getServices();
  }

  getServices() {
    this.commonservice.getServiceLines(this.uid).subscribe((response: any) => {
      if (response && response.data) {
        this.services_array = response.data.filter(function (item: any) {
          console.log('item', item);
          if (
            item.serviceID === 4 ||
            item.serviceID === 9 ||
            item.serviceID === 2 ||
            item.serviceID === 12
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
        if (response && response.data) {
          this.states_array = response.data;
        }
      });
  }

  getItemCategory(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;

    this.storeService
      .getItemCategory(providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          this.unmappedItemCategory = response.data.filter(
            (category: any) =>
              category.deleted !== true &&
              category.alertBeforeDays === undefined,
          );

          this.itemCategory_array = response.data.filter(
            (category: any) =>
              category.deleted !== true &&
              category.alertBeforeDays !== undefined,
          );
          console.log('this.itemCategory_array', this.itemCategory_array);
          this.filteredItemCategory_array.data = this.itemCategory_array;
          this.filteredItemCategory_array.paginator = this.paginator;
          console.log(
            'this.filteredItemCategory_array.data',
            this.filteredItemCategory_array.data,
          );
          this.mode = 'view';
          console.log('this.mode', this.mode);
        }
      });
  }

  filterItemCategory(filterTerm: any) {
    if (!filterTerm) {
      this.filteredItemCategory_array.data = this.itemCategory_array.slice();
      this.filteredItemCategory_array.paginator = this.paginator;
      this.filteredItemCategory_array = new MatTableDataSource<any>(
        this.filteredItemCategory_array.data,
      );
    } else {
      this.filteredItemCategory_array.data = this.itemCategory_array.filter(
        (item: any) => {
          let flag = false;
          for (const key in item) {
            if (
              key === 'itemCategoryCode' ||
              key === 'itemCategoryName' ||
              key === 'alertBeforeDays'
            ) {
              const value: string = '' + item[key];
              if (value.toLowerCase().indexOf(filterTerm.toLowerCase()) >= 0) {
                flag = true;
                break;
              }
            }
          }
          return flag;
        },
      );
    }
  }

  itemCategory: any;
  alertBeforeDays: any;
  createExpiryAlertConfig() {
    if (this.unmappedItemCategory.length > 0) {
      this.mode = 'create';
    } else {
      this.dialogService.alert('All item category mapped');
    }
  }

  viewExpiryAlertConfig(expiryAlertConfigForm?: NgForm) {
    this.mode = 'view';
    this.getItemCategory(this.providerServiceMapID);
    if (expiryAlertConfigForm) {
      expiryAlertConfigForm.reset();
    }
    this.resetExpiryAlertConfigList();
  }

  edit_itemCategory: any;
  edit_alertBeforeDays: any;
  editExpiryAlertConfig(expiryAlertConfig: any) {
    this.mode = 'edit';

    this.edit_itemCategory = expiryAlertConfig.itemCategoryID;
    this.edit_alertBeforeDays = expiryAlertConfig.alertBeforeDays;
  }

  addToExpiryAlertConfigList(expiryAlertConfigForm: NgForm) {
    const expiryAlertConfig: any = Object.assign(
      {},
      expiryAlertConfigForm.value,
    );

    if (!this.checkDuplicateExpiryAlertConfig(expiryAlertConfig)) {
      this.expiryAlertConfigList.data.push(expiryAlertConfig);
      this.expiryAlertConfigList = new MatTableDataSource<any>(
        this.expiryAlertConfigList.data,
      );
      expiryAlertConfigForm.reset();
    } else {
      this.dialogService.alert(
        'Item expiry alert config is already added in list',
      );
    }
  }

  checkDuplicateExpiryAlertConfig(expiryAlertConfig: any) {
    const temp = this.expiryAlertConfigList.data.filter((item: any) => {
      return (
        item.itemCategory.itemCategoryID ===
        expiryAlertConfig.itemCategory.itemCategoryID
      );
    });

    return temp.length > 0 ? true : false;
  }

  removeFromExpiryAlertConfigList(index: any) {
    this.expiryAlertConfigList.data.splice(index, 1);
    this.expiryAlertConfigList = new MatTableDataSource<any>(
      this.expiryAlertConfigList.data,
    );
  }

  submitExpiryAlertConfig(expiryAlertConfigForm: NgForm) {
    const temp = JSON.parse(JSON.stringify(this.expiryAlertConfigList.data));
    temp.map((item: any) => {
      item.alertBeforeDays = item.alertBeforeDays
        ? +item.alertBeforeDays
        : undefined;
      item.itemCategoryID = item.itemCategory.itemCategoryID;
      item.itemCategory = undefined;
    });

    this.storeService.saveExpiryAlertConfig(temp).subscribe((response: any) => {
      if (response.statusCode === 200) {
        this.dialogService.alert('Saved successfully', 'success');
        console.log(response);
        expiryAlertConfigForm.reset();
        this.viewExpiryAlertConfig();
      }
    });
  }

  updateExpiryAlertConfig(expiryAlertConfigForm: NgForm) {
    const temp = JSON.parse(JSON.stringify(expiryAlertConfigForm.value));
    temp.alertBeforeDays = temp.edit_alertBeforeDays
      ? +temp.edit_alertBeforeDays
      : undefined;
    temp.itemCategoryID = this.edit_itemCategory;
    temp.edit_alertBeforeDays = undefined;

    this.storeService
      .saveExpiryAlertConfig([temp])
      .subscribe((response: any) => {
        if (response.statusCode === 200) {
          this.dialogService.alert('Updated successfully', 'success');
          console.log(response);
          expiryAlertConfigForm.reset();
          this.viewExpiryAlertConfig();
        }
      });
  }

  resetExpiryAlertConfigList() {
    this.expiryAlertConfigList.data.length = 0;
  }
}
