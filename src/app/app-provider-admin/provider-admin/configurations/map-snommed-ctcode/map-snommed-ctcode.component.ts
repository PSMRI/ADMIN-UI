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
  Component,
  OnInit,
  ViewChild,
  Inject,
  AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { SnomedCodeSearchComponent } from '../snomed-code-search/snomed-code-search.component';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemService } from '../../inventory/services/item.service';
import { SnomedMasterService } from '../services/snomed-master.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-map-snommed-ctcode',
  templateUrl: './map-snommed-ctcode.component.html',
  styleUrls: ['./map-snommed-ctcode.component.css'],
})
export class MapSnommedCTCodeComponent implements OnInit, AfterViewInit {
  providerServiceMapID: any;
  providerID: any;
  userID: any;
  state: any;
  service: any;
  bool: any;
  discontinue = false;
  createdBy: any;
  confirmMessage: any;
  discontinueMessage: any;
  itemCodeExist: any;
  editMode = false;
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  tableMode = true;
  create_filterTerm: any;
  readFlag = false;
  editflag = true;
  //updateFlag: boolean = true;
  /*Arrays*/
  services: any = [];
  states: any = [];
  itemsList = [];
  // filteredItemList = [];
  categories: any = [];
  edit_categories: any = [];
  dosages: any = [];
  edit_dosages: any = [];
  pharmacologies: any = [];
  edit_pharmacologies: any = [];
  manufacturers: any = [];
  edit_Manufacturerlist: any = [];
  measures: any = [];
  edit_measures: any = [];
  routes: any = [];
  edit_routes: any = [];
  availableItemCodeInList: any = [];
  edit_serviceline: any;
  edit_state: any;
  edit_ItemType: any;
  edit_Code: any;
  editMasterName: any;
  edit_Category: any;
  edit_Dose: any;
  edit_Pharmacology: any;
  edit_Manufacturer: any;
  edit_Strength: any;
  edit_Uom: any;
  edit_DrugType: any;
  edit_Composition: any;
  edit_Route: any;
  edit_Description: any;
  itemID: any;
  drugType = false;
  masterTypes: any = ['Immunization', 'Optional Vaccination', 'Family History'];
  masterType: any;
  masterNames: any = [];
  showSearch = false;
  @ViewChild('searchForm') searchForm!: NgForm;
  @ViewChild('itemCreationForm') itemCreationForm!: NgForm;

  editDrug: any;
  testsnomedCode: any;
  snomedFlag = false;
  enableAlert = true;
  testSnomedName: any;
  editSnomedCode: any;
  editSnomedName: any;
  snomedEditFlag = true;
  disableSnomedCode = false;
  masterID: any;
  masterName: any;
  categoryWiseList: any;
  allItems: any;
  itemCodeExistEdit = true;
  displayedColumns = [
    'sno',
    'masterName',
    'sctCode',
    'sctTerm',
    'edit',
    'action',
  ];

  addItemColumns = ['sno', 'masterName', 'sctCode', 'sctTerm', 'delete'];

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<any>();

  @ViewChild(MatPaginator) itemsPaginator: MatPaginator | null = null;
  addedItems = new MatTableDataSource<any>();

  constructor(
    public itemService: ItemService,
    public commonServices: CommonServices,
    public dialogService: ConfirmationDialogsService,
    public dialog: MatDialog,
    public sctService: SnomedMasterService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.providerID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.createdBy = this.sessionstorage.getItem('uname');
    console.log('this.createdBy', this.createdBy);
    this.itemCodeExist = false;
    this.itemCodeExistEdit = true;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchWorklist(type: any) {
    this.masterType = type;
    console.log('catType', this.masterType);
    this.showSearch = true;
    this.showTableFlag = true;
    this.getAllItemsList(type);
  }

  getAllItemsList(type: any) {
    this.itemsSuccessHandler(type);
    this.sctService.getMasterList(type).subscribe(
      (itemListResponse: any) => this.itemsSuccessHandler(itemListResponse),
      (err) => {
        console.log('Error Master Name not found', err);
      },
    );
  }
  itemsSuccessHandler(itemListResponse: any) {
    console.log('All items', itemListResponse);
    // if(itemListResponse!=undefined)
    // {
    this.allItems = itemListResponse.data; //for use in add mapping
    this.itemsList = itemListResponse.data;
    console.log('values', this.itemsList);
    //}
    if (this.itemsList !== undefined) {
      this.itemsList = this.itemsList.filter(
        (master: any) => master.sctCode !== null,
      );
    }
    this.dataSource.data = this.itemsList;
    this.dataSource.data.forEach((item: any, index: number) => {
      item.sno = index + 1;
    });
    this.dataSource.paginator = this.paginator;
    console.log('liist', this.dataSource.data);
    this.showTableFlag = true;
  }
  showForm() {
    this.tableMode = false;
    this.showTableFlag = false;
    this.showFormFlag = true;
    this.readFlag = false;
    this.snomedFlag = false;
    //this.itemCodeExist=false;
    //this.itemCodeExistEdit=false;
    this.categoryWiseList = this.allItems;
    this.masterNames = this.categoryWiseList.filter(
      (master: any) => master.sctCode === null,
    );
  }
  filterItemFromList(searchTerm?: any) {
    // debugger;
    if (!searchTerm) {
      this.dataSource.data = this.itemsList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.itemsList.forEach((item) => {
        for (const key in item) {
          if (key === 'sctTerm' || key === 'masterName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
            this.dataSource.data.forEach((item: any, index: number) => {
              item.sno = index + 1;
            });
            this.dataSource.paginator = this.paginator;
          } else if (key === 'sctCode') {
            const value: any = '' + item[key];
            if (value.indexOf(searchTerm) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          }
          this.dataSource.data.forEach((item: any, index: number) => {
            item.sno = index + 1;
          });
          this.dataSource.paginator = this.paginator;
        }
      });
    }
  }

  resetAllForms() {
    this.searchForm.resetForm();
    this.itemCreationForm.resetForm();
  }
  resetItemCreationForm() {
    this.itemCreationForm.controls['masterName'].reset();
    this.testsnomedCode = null;
    this.testSnomedName = null;
    this.enableAlert = true;
    this.snomedFlag = false;
    this.readFlag = false;
    this.snomedFlag = false;
    this.itemCodeExist = false;
    this.itemCodeExistEdit = true;
  }

  showTable() {
    this.showTableFlag = true;
    this.showFormFlag = false;
    this.tableMode = true;
    this.editMode = false;
  }

  addMultipleItemArray(formValue: any) {
    if (this.enableAlert === true) {
      this.dialogService.alert('No SNOMED CT Code selected for the Master');

      //   this.dialogService.confirm('confirm',"No SNOMED CT Code selected for the Master, Do you want to proceed?").subscribe(response=>{
      //     if(response)
      //     {
      //       this.testsnomedCode=null;
      //      this.testSnomedName=null;
      //       console.log("formValue", formValue);
      // const multipleItem = {
      //   "masterID":formValue.masterName.masterID,
      //   "masterName":formValue.masterName.masterName,
      //   "sctCode":this.testsnomedCode,
      //   "sctTerm":this.testSnomedName,
      //   "modifiedBy":this.createdBy,
      //   "deleted":false,
      //   "processed":"N",
      //   "vaccinationTime":formValue.masterName.vaccinationTime,
      //   "createdBy":formValue.masterName.createdBy
      // }
      // console.log('multipleItem', multipleItem);
      // this.checkDuplicates(multipleItem);
      // this.resetItemCreationForm();
      //     }
      //   });
    } else {
      console.log('formValue', formValue);
      const multipleItem = {
        masterID: formValue.masterName.masterID,
        masterName: formValue.masterName.masterName,
        sctCode: this.testsnomedCode,
        sctTerm: this.testSnomedName,
        modifiedBy: this.createdBy,
        deleted: false,
        processed: 'N',
        vaccinationTime: formValue.masterName.vaccinationTime,
        createdBy: formValue.masterName.createdBy,
      };
      console.log('multipleItem', multipleItem);
      this.checkDuplicates(multipleItem);
      this.resetItemCreationForm();
    }
  }
  checkAlreadySelectedMaster() {
    let flag = false;
    for (let i = 0; i < this.addedItems.data.length; i++) {
      if (
        this.addedItems.data[i].masterName === this.masterName.masterName &&
        this.addedItems.data[i].masterID === this.masterName.masterID
      )
        flag = true;
    }
    if (flag) {
      this.dialogService.alert('Master Name already selected');
      this.resetItemCreationForm();
    }
  }
  checkDuplicates(multipleItem: any) {
    let duplicateStatus = 0;
    if (this.addedItems.data.length === 0) {
      this.addedItems.data.push(multipleItem);
      this.addedItems.paginator = this.itemsPaginator;
    } else {
      for (let i = 0; i < this.addedItems.data.length; i++) {
        if (this.addedItems.data[i].masterID === multipleItem.masterID) {
          duplicateStatus = duplicateStatus + 1;
        }
      }
      if (duplicateStatus === 0) {
        this.addedItems.data.push(multipleItem);
        this.addedItems.paginator = this.itemsPaginator;
      }
    }
  }
  removeRow(index: any) {
    this.addedItems.data.splice(index, 1);
    this.addedItems.paginator = this.itemsPaginator;
  }
  saveItem() {
    const saveObj = {
      masterType: this.masterType,
      mappingDetails: this.addedItems.data,
    };
    this.sctService.saveSctMapping(saveObj).subscribe(
      (response) => {
        if (response) {
          console.log(response, 'item created');
          this.resetItemCreationForm();
          this.addedItems.data = [];
          this.addedItems.paginator = this.itemsPaginator;
          this.dialogService.alert('Saved Successfully', 'success');
          this.showTable();
          this.getAllItemsList(this.masterType);
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  back() {
    this.dialogService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.resetItemCreationForm();
          this.addedItems.data = [];
          this.addedItems.paginator = this.itemsPaginator;
          this.tableMode = true;
          this.editMode = false;
          this.showTableFlag = true;
          this.showFormFlag = false;
          //this.disableSelection = false;
          this.readFlag = false;
          this.snomedFlag = false;
          this.editflag = true;
          this.snomedEditFlag = true;
          //this.updateFlag=true;
          this.getAllItemsList(this.masterType);
          this.create_filterTerm = '';
        }
      });
  }
  backEdit() {
    this.dialogService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          //this.resetItemCreationForm();
          this.addedItems.data = [];
          this.tableMode = true;
          this.editMode = false;
          this.showTableFlag = true;
          this.showFormFlag = false;
          //this.disableSelection = false;
          this.readFlag = false;
          this.snomedFlag = false;
          this.editflag = true;
          this.snomedEditFlag = true;
          //this.updateFlag=true;
          this.create_filterTerm = '';
          this.getAllItemsList(this.masterType);
        }
      });
  }
  editItem(itemlist: any) {
    this.itemCodeExistEdit = true;
    console.log('Existing Data', itemlist);
    this.masterID = itemlist.masterID;
    this.edit_serviceline = this.service;
    this.edit_Code = itemlist.itemCode;
    this.editMasterName = itemlist.masterName;
    this.editSnomedCode = itemlist.sctCode;
    this.editSnomedName = itemlist.sctTerm;
    if (
      itemlist.sctCode === null ||
      itemlist.sctCode === undefined ||
      itemlist.sctCode === ''
    ) {
      this.snomedEditFlag = true;
      this.enableAlert = true;
    } else {
      this.enableAlert = false;
      this.editflag = true;
      this.snomedEditFlag = false;
    }

    this.edit_Category = itemlist.itemCategoryID;
    this.showEditForm();
  }
  showEditForm() {
    this.tableMode = false;
    this.showFormFlag = false;
    this.editMode = true;
    //this.itemCodeExistEdit=false;
  }
  onDeleteClickEdit() {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to delete?')
      .subscribe((response) => {
        if (response) {
          this.enableAlert = true;
          this.editSnomedCode = null;
          this.editSnomedName = null;
          this.editflag = false;
          this.snomedEditFlag = true;
          //this.updateFlag=false;
          this.itemCodeExistEdit = true;
        }
      });
  }
  updateItem(editItemCreationForm: any) {
    if (this.enableAlert === true) {
      this.dialogService
        .confirm(
          'confirm',
          'No SNOMED CT Code selected for the Master, Do you want to proceed?',
        )
        .subscribe((response) => {
          if (response) {
            this.editSnomedCode = null;
            this.editSnomedName = null;
            this.update(editItemCreationForm);
          }
        });
    } else {
      this.update(editItemCreationForm);
    }
  }
  update(item: any) {
    // debugger;
    const updateItemObject = {
      masterType: this.masterType,
      masterID: this.masterID,
      masterName: this.editMasterName,
      sctCode: this.editSnomedCode,
      sctTerm: this.editSnomedName,
      modifiedBy: this.createdBy,
    };
    this.sctService.editSctMapping(updateItemObject).subscribe((response) => {
      this.dialogService.alert('Updated successfully', 'success');
      this.snomedEditFlag = false;
      //this.disableSnomedCode=false;
      this.enableAlert = true;
      this.getAllItemsList(this.masterType);
      this.showTable();
      console.log('Data to be update', response);
    });
  }

  searchSnomedEdit(term: any) {
    console.log('Tern', term);
    const searchTerm = term;
    if (searchTerm.length > 2) {
      const dialogRef = this.dialog.open(SnomedCodeSearchComponent, {
        data: { searchTerm: searchTerm },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('result', result);
        if (result) {
          this.editSnomedCode = result.snomedNo;
          this.editSnomedName = result.snomedTerm;
          this.enableAlert = false;
          this.editflag = true;
          this.snomedEditFlag = false;
          this.itemCodeExistEdit = false;
        } else {
          this.enableAlert = true;
          this.editSnomedCode = null;
          this.editSnomedName = null;
          this.editflag = false;
          this.snomedEditFlag = true;
          this.itemCodeExistEdit = true;
        }
      });
    }
  }

  activateDeactivate(item: any, flag: any) {
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    const status = {
      masterType: this.masterType,
      masterID: item.masterID,
      deleted: flag,
      modifiedBy: this.createdBy,
    };
    this.dialogService
      .confirm(
        'confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            this.sctService.updateBlock(status).subscribe(
              (res) => {
                console.log('Activation or deactivation response', res);
                this.dialogService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.getAllItemsList(this.masterType);
                this.create_filterTerm = '';
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

  searchSnomed(term: string): void {
    const searchTerm = term;
    if (searchTerm.length > 2) {
      const dialogRef = this.dialog.open(SnomedCodeSearchComponent, {
        data: { searchTerm: searchTerm },
      });

      dialogRef.afterClosed().subscribe((result) => {
        console.log('result', result);
        if (result) {
          this.testsnomedCode = result.snomedNo;
          this.testSnomedName = result.snomedTerm;
          this.snomedFlag = true;
          this.enableAlert = false;
          this.readFlag = true;
          this.snomedFlag = true;
          this.itemCodeExist = true;
        } else {
          this.enableAlert = true;
          this.testsnomedCode = null;
          this.testSnomedName = null;
          this.readFlag = false;
          this.snomedFlag = false;
          this.itemCodeExist = false;
        }
      });
    }
  }

  onDeleteClick() {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to delete?')
      .subscribe((response) => {
        if (response) {
          this.enableAlert = true;
          this.snomedFlag = false;
          this.testsnomedCode = null;
          this.testSnomedName = null;
          this.readFlag = false;
          this.snomedFlag = false;
          this.itemCodeExist = false;
        }
      });
  }
}
