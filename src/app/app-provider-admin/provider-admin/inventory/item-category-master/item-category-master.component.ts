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
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemCategoryService } from 'src/app/core/services/inventory-services/item-category.service';
import { ItemService } from '../services/item.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';
@Component({
  selector: 'app-item-category-master',
  templateUrl: './item-category-master.component.html',
  styleUrls: ['./item-category-master.component.css'],
})
export class ItemCategoryMasterComponent implements OnInit, AfterViewInit {
  createdBy: any;
  uid: any;
  serviceProviderID: any;
  providerServiceMapID: any;
  services_array!: any[];
  states_array!: any[];

  codeExists = false;
  itemsList = [];
  // filteredItemList = [];
  filteredItemList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  edit_Serviceline: any;
  edit_State: any;
  edit_code: any;
  edit_name: any;
  edit_desc: any;
  itemCategoryID: any;
  create_filterTerm!: string;

  editMode = false;
  showTableFlag = false;
  showCreationForm = false;
  tableMode = true;

  //Creations

  itemCategoryCode = null;
  itemCategoryName = null;
  itemCategoryDesc = null;
  // forCreationObjects: any = [];
  forCreationObjects = new MatTableDataSource<any>();

  state: any;
  serviceline: any;

  @ViewChild('searchForm') searchForm!: NgForm;

  @ViewChild('categoryCreationForm') categoryCreationForm!: NgForm;

  constructor(
    public commonservice: CommonServices,
    public commonDataService: dataService,
    public itemService: ItemService,
    public dialogService: ConfirmationDialogsService,
    private itemCategoryService: ItemCategoryService,
    public dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uid = this.commonDataService.uid;
    this.createdBy = this.commonDataService.uname;
    console.log('this.createdBy', this.createdBy);
    this.getServices();
  }
  ngAfterViewInit() {
    this.filteredItemList.paginator = this.paginator;
  }
  getServices() {
    this.commonservice.getServiceLines(this.uid).subscribe((response: any) => {
      if (response && response.data) {
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
        this.state = '';
        this.serviceline = '';
        this.providerServiceMapID = '';
      }
    });
  }
  getStates(service: any) {
    this.commonservice
      .getStatesOnServices(this.uid, service.serviceID, false)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All states success based on service', response.data);
          this.states_array = response.data;
          this.state = '';
          this.providerServiceMapID = '';
        }
      });
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    console.log(this.providerServiceMapID);
    console.log(this.state);
    console.log(this.serviceline);
    this.getAllItemCategories();
  }

  getAllItemCategories() {
    if (this.providerServiceMapID) {
      this.itemCategoryService
        .getAllItemCategory(this.providerServiceMapID)
        .subscribe((res: any) => {
          if (res.statusCode === 200) {
            console.log(res.data);
            this.showTableFlag = true;
            this.itemsList = res.data;
            this.filteredItemList.data = res.data;
            this.filteredItemList.paginator = this.paginator;
          }
        });
    }
  }

  back() {
    this.tableMode = true;
    this.showTableFlag = true;
    this.editMode = false;
    this.showCreationForm = false;
    this.forCreationObjects.data = [];
    this.getAllItemCategories();
    this.create_filterTerm = '';
  }
  saveCategory() {
    this.itemCategoryService
      .saveNewCategory(this.forCreationObjects.data)
      .subscribe((res: any) => {
        if (res.statusCode === 200) {
          console.log(res);
          this.dialogService.alert('Saved successfully', 'success');
          this.categoryCreationForm.reset();
          this.forCreationObjects.data = [];
          this.back();
        }
      });
  }
  removeRow(index: any) {
    this.forCreationObjects.data.splice(index, 1);
    this.forCreationObjects = new MatTableDataSource<any>(
      this.forCreationObjects.data,
    );
  }

  addForCreation() {
    this.forCreationObjects.data.push({
      serviceName: this.serviceline.serviceName,
      stateName: this.state.stateName,
      itemCategoryCode: this.itemCategoryCode,
      itemCategoryName: this.itemCategoryName,
      itemCategoryDesc: this.itemCategoryDesc,
      createdBy: this.createdBy,
      providerServiceMapID: this.providerServiceMapID,
    });
    this.forCreationObjects = new MatTableDataSource<any>(
      this.forCreationObjects.data,
    );

    this.categoryCreationForm.reset();
  }

  filterItemFromList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredItemList.data = this.itemsList;
      this.filteredItemList = new MatTableDataSource<any>(
        this.filteredItemList.data,
      );
      this.filteredItemList.paginator = this.paginator;
    } else {
      this.filteredItemList.data = [];
      this.filteredItemList.paginator = this.paginator;
      this.itemsList.forEach((item) => {
        for (const key in item) {
          if (
            key === 'itemCategoryCode' ||
            key === 'itemCategoryName' ||
            key === 'itemCategoryDesc'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredItemList.data.push(item);
              this.filteredItemList = new MatTableDataSource<any>(
                this.filteredItemList.data,
              );
              this.filteredItemList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }

  activateDeactivate(categoryID: any, flag: any) {
    let confirmMessage: any;
    if (flag) {
      confirmMessage = 'Deactivate';
    } else {
      confirmMessage = 'Activate';
    }
    this.dialogService
      .confirm('confirm', 'Are you sure you want to ' + confirmMessage + '?')
      .subscribe(
        (res) => {
          if (res) {
            console.log('Deactivating or activating Obj', categoryID, flag);
            this.itemCategoryService
              .categoryActivationDeactivation(categoryID, flag)
              .subscribe(
                (result: any) => {
                  if (result.statusCode === 200) {
                    console.log('Activation or deactivation response', result);
                    this.dialogService.alert(
                      `${confirmMessage}d successfully`,
                      'success',
                    );
                    this.getAllItemCategories();
                    this.create_filterTerm = '';
                  }
                  // this.getAllItemsList(this.providerServiceMapID);
                },
                (err) => this.dialogService.alert(err, 'error'),
              );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  editItem(itemlist: any) {
    console.log('Existing Data', itemlist);
    this.itemCategoryID = itemlist.itemCategoryID;
    this.edit_Serviceline = this.serviceline;
    this.edit_State = this.state;
    this.edit_code = itemlist.itemCategoryCode;
    this.edit_desc = itemlist.itemCategoryDesc;
    this.edit_name = itemlist.itemCategoryName;
    this.showEditForm();
  }
  updateItem(editformvalues: any) {
    const editObj = {
      itemCategoryID: this.itemCategoryID,
      itemCategoryDesc: this.edit_desc,
      providerServiceMapID: this.providerServiceMapID,
      modifiedBy: this.createdBy,
    };
    this.itemCategoryService.editItemCategory(editObj).subscribe(
      (response) => {
        if (response) {
          this.back();
          console.log(response, 'after successful updation of Item category');
          this.dialogService.alert('Updated successfully', 'success');
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  showEditForm() {
    this.tableMode = false;
    this.showCreationForm = false;
    this.editMode = true;
  }
  showForm() {
    this.tableMode = false;
    this.showTableFlag = false;
    this.showCreationForm = true;
    this.editMode = false;
  }

  checkCodeExistance(code: any) {
    this.itemService
      .confirmItemCodeUnique(code, 'Itemcategory', this.providerServiceMapID)
      .subscribe((res: any) => {
        if (res && res.statusCode === 200 && res.data) {
          console.log(res);
          console.log(res.data);
          console.log(res.data.response);
          // this.itemCodeExist = res.data.response;
          this.localCodeExists(code, res.data.response);
        }
      });
  }

  localCodeExists(code: any, returned: any) {
    let duplicateStatus = 0;
    if (this.forCreationObjects.data.length > 0) {
      for (let i = 0; i < this.forCreationObjects.data.length; i++) {
        if (this.forCreationObjects.data[i].itemCategoryCode === code) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
    }
    if (duplicateStatus > 0 || returned === 'true') {
      this.codeExists = true;
    } else {
      this.codeExists = false;
    }
  }
}
