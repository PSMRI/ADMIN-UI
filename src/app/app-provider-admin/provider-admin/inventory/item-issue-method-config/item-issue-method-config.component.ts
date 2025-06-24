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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-item-issue-method-config',
  templateUrl: './item-issue-method-config.component.html',
  styleUrls: ['./item-issue-method-config.component.css'],
})
export class ItemIssueMethodConfigComponent implements OnInit, AfterViewInit {
  object: any = [];
  ItemIssue_array: any = [];
  itemCategory_array: any = [];
  // bufferArray:any=[];
  bufferArray = new MatTableDataSource<any>();
  filterItemCategory: any = [];
  // filteredItemCategory_array: any = [];
  filteredItemCategory_array = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  providerServiceMapID: any;
  states_array: any = [];
  services_array: any = [];
  serviceProviderID: any;
  create_filterTerm!: string;
  createdBy: any;
  category: any;
  itemIssue: any;
  state: any;
  serviceline: any;
  uid: any;
  edit_Serviceline: any;
  edit_State: any;
  edit_category: any;
  edit_itemIssue: any;
  formMode = false;
  tableMode = true;
  editMode = false;
  displayTable = false;
  createButton = false;
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
    this.setItemIssue();
    this.getServices();
  }
  ngAfterViewInit() {
    this.filteredItemCategory_array.paginator = this.paginator;
  }
  setItemIssue() {
    this.ItemIssue_array = [
      { value: 1, Name: 'First In First Out' },
      { value: 2, Name: 'First Expiry First Out' },
      { value: 3, Name: 'Last In First Out' },
    ];
  }

  getServices() {
    this.commonservice.getServiceLines(this.uid).subscribe((response: any) => {
      if (response && response.data) {
        console.log('All services success', response);
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
        if (response && response.data) {
          console.log('All states success based on service', response);
          this.states_array = response.data;
        }
      });
  }
  getItemCategory(providerServiceMapID: any) {
    this.createButton = true;
    this.providerServiceMapID = providerServiceMapID;
    this.storeService
      .getItemCategory(providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          console.log('All Item Categories success based on service', response);
          this.itemCategory_array = response.data.filter(
            (category: any) =>
              category.deleted !== true && category.issueType !== undefined,
          );
          this.filteredItemCategory_array.data = this.itemCategory_array;
          this.filteredItemCategory_array.paginator = this.paginator;
          this.filterItemCategory = response.data.filter(
            (category: any) =>
              category.issueType === undefined && category.deleted !== true,
          );
          this.displayTable = true;
          this.setItemIssue();
        }
      });
  }
  editIssueType(editformvalues: any) {
    this.edit_Serviceline = this.serviceline;
    this.edit_State = this.state;
    this.edit_category = editformvalues.itemCategoryID;
    this.edit_itemIssue = editformvalues.issueType;
    this.showEditForm();
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }
  getIssueType(itemCategoryID: any) {
    const item = this.itemCategory_array.filter(
      (category: any) => category.itemCategoryID === itemCategoryID,
    );
    const issueType = this.ItemIssue_array.filter(
      (itemissue: any) => itemissue.Name === item[0].issueType,
    );
    this.itemIssue = issueType;
  }
  filterItemIssueList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredItemCategory_array.data = this.itemCategory_array;
      this.filteredItemCategory_array = new MatTableDataSource<any>(
        this.filteredItemCategory_array.data,
      );
      this.filteredItemCategory_array.paginator = this.paginator;
    } else {
      this.filteredItemCategory_array.data = [];
      this.filteredItemCategory_array.paginator = this.paginator;
      this.itemCategory_array.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'issueType' ||
            key === 'itemCategoryCode' ||
            key === 'itemCategoryName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredItemCategory_array.data.push(item);
              this.filteredItemCategory_array = new MatTableDataSource<any>(
                this.filteredItemCategory_array.data,
              );
              this.filteredItemCategory_array.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  updateConfig(editvalue: any) {
    const obj = {
      issueType: editvalue.itemissue,
      itemCategoryID: this.edit_category,
      providerServiceMapID: this.providerServiceMapID,
    };
    this.object.push(obj);

    this.storeService.saveItemIssueConfig(this.object).subscribe((response) => {
      if (response) {
        this.dialogService.alert('Updated successfully', 'success');
        this.showTable();
      }
    });
  }
  removeRow(index: any) {
    this.bufferArray.data.splice(index, 1);
    this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
  }
  add2buffer(formvalues: any) {
    const obj = {
      itemCategoryName: formvalues.itemcategory.itemCategoryName,
      issueType: formvalues.itemissue.Name,
      providerServiceMapID: this.providerServiceMapID,
      itemCategoryID: this.category.itemCategoryID,
    };
    this.checkDuplictes(obj);
  }
  checkDuplictes(object: any) {
    let duplicateStatus = 0;
    if (this.bufferArray.data.length === 0) {
      this.bufferArray.data.push(object);
    } else {
      for (let i = 0; i < this.bufferArray.data.length; i++) {
        if (
          this.bufferArray.data[i].itemCategoryName === object.itemCategoryName
        ) {
          duplicateStatus = duplicateStatus + 1;
          this.dialogService.alert('Item Category is already added in list');
        }
      }
      if (duplicateStatus === 0) {
        this.bufferArray.data.push(object);
        this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
      }
    }
  }
  saveConfig() {
    this.storeService
      .saveItemIssueConfig(this.bufferArray.data)
      .subscribe((response) => {
        if (response) {
          this.dialogService.alert('Saved successfully', 'success');
          this.showTable();
        }
      });
  }
  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.displayTable = true;
    this.getItemCategory(this.providerServiceMapID);
    // this.countryCheck = false;
    this.create_filterTerm = '';
  }
}
