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
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { PharmacologicalMasterService } from 'src/app/core/services/inventory-services/pharmacological-category-service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-pharmacological-category-master',
  templateUrl: './pharmacological-category-master.component.html',
  styleUrls: ['./pharmacological-category-master.component.css'],
})
export class PharmacologicalCategoryMasterComponent
  implements OnInit, AfterViewInit
{
  createButton = false;
  createdBy: any;
  uid: any;
  serviceProviderID: any;
  providerServiceMapID: any;
  services_array: any = [];
  states_array: any = [];
  pharmacologicalList: any = [];
  // filteredPharmacologicalList: any = [];
  filteredPharmacologicalList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  availablepharmacologicalCode: any = [];
  // bufferArray: any = [];
  bufferArray = new MatTableDataSource<any>();
  edit_pharmaName: any;
  edit_pharmaDesc: any;
  edit_pharmaCode: any;
  pharmCategoryID: any;
  confirmMessage: any;
  state: any;
  edit_State: any;
  serviceline: any;
  edit_Serviceline: any;
  create_pharmaCode: any;
  create_pharmaName: any;
  create_pharmaDesc: any;

  formMode = false;
  tableMode = true;
  editMode = false;
  displayTable = false;
  @ViewChild('PharmaAddForm') PharmaAddForm!: NgForm;

  constructor(
    public commonservice: CommonServices,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    private pharmacologicalService: PharmacologicalMasterService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    console.log(this.createdBy, 'CreatedBy');
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uid = this.commonDataService.uid;
    this.getServices();
  }
  ngAfterViewInit() {
    this.filteredPharmacologicalList.paginator = this.paginator;
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
      }
    });
  }
  getstates(service: any) {
    this.commonservice
      .getStatesOnServices(this.uid, service.serviceID, false)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All states success based on service', response.data);
          this.states_array = response.data;
        }
      });
  }
  getAllPharmacology(providerServiceMapID: any) {
    this.createButton = true;
    this.providerServiceMapID = providerServiceMapID;
    this.pharmacologicalService
      .getAllPharmacologyList(providerServiceMapID)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All stores services success', response);
          this.pharmacologicalList = response.data;
          this.filteredPharmacologicalList.data = response.data;
          this.filteredPharmacologicalList.paginator = this.paginator;
          this.displayTable = true;
          for (const availablepharmacologicalCode of this.pharmacologicalList) {
            this.availablepharmacologicalCode.push(
              availablepharmacologicalCode.pharmCategoryCode,
            );
          }
        }
      });
  }
  add2buffer(formvalues: any) {
    console.log('form values', formvalues);
    const obj = {
      pharmCategoryCode: formvalues.pharmaCode,
      pharmCategoryName: formvalues.pharmaName,
      pharmCategoryDesc: formvalues.pharmaDesc,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
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
          this.bufferArray.data[i].pharmCategoryCode ===
            object.pharmCategoryCode &&
          this.bufferArray.data[i].pharmCategoryName ===
            object.pharmCategoryName
        ) {
          duplicateStatus = duplicateStatus + 1;
          this.dialogService.alert('Pharmacology is already added in list');
        }
      }
      if (duplicateStatus === 0) {
        this.bufferArray.data.push(object);
        this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
      }
    }
  }
  removeRow(index: any) {
    this.bufferArray.data.splice(index, 1);
    this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
  }
  savePharmacology() {
    console.log('object before saving the pharmacology', this.bufferArray.data);
    this.pharmacologicalService
      .savePharmacology(this.bufferArray.data)
      .subscribe(
        (response) => {
          if (response) {
            console.log(response, 'after successful creation of pharmacology');
            this.dialogService.alert('Saved successfully', 'success');
            this.showTable();
            this.getAllPharmacology(this.providerServiceMapID);
          }
        },
        (err) => {
          console.log(err, 'ERROR');
        },
      );
  }
  filterPharmacologicalList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredPharmacologicalList.data = this.pharmacologicalList;
      this.filteredPharmacologicalList = new MatTableDataSource<any>(
        this.filteredPharmacologicalList.data,
      );
      this.filteredPharmacologicalList.paginator = this.paginator;
    } else {
      this.filteredPharmacologicalList.data = [];
      this.filteredPharmacologicalList.paginator = this.paginator;
      this.pharmacologicalList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'pharmCategoryCode' ||
            key === 'pharmCategoryName' ||
            key === 'pharmCategoryDesc'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredPharmacologicalList.data.push(item);
              this.filteredPharmacologicalList = new MatTableDataSource<any>(
                this.filteredPharmacologicalList.data,
              );
              this.filteredPharmacologicalList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  editPharm(editformvalues: any) {
    this.edit_Serviceline = this.serviceline;
    this.edit_State = this.state;
    console.log('this.edit_State', this.edit_State);
    this.pharmCategoryID = editformvalues.pharmacologyCategoryID;
    this.edit_pharmaCode = editformvalues.pharmCategoryCode;
    this.edit_pharmaName = editformvalues.pharmCategoryName;
    this.edit_pharmaDesc = editformvalues.pharmCategoryDesc;
    this.showEditForm();
  }
  updatepharmacology(editformvalues: any) {
    const editObj = {
      pharmCategoryDesc: editformvalues.pharmaDesc,
      modifiedBy: this.createdBy,
      pharmacologyCategoryID: this.pharmCategoryID,
    };
    this.pharmacologicalService.updatePharmacology(editObj).subscribe(
      (response) => {
        if (response) {
          this.showTable();
          this.getAllPharmacology(this.providerServiceMapID);
          console.log(response, 'after successful updation of Pharmacology');
          this.dialogService.alert('Updated successfully', 'success');
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  activateDeactivate(pharmaCategoryID: any, flag: any) {
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.dialogService
      .confirm(
        'confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe((response) => {
        if (response) {
          const object = {
            pharmacologyCategoryID: pharmaCategoryID,
            deleted: flag,
          };
          this.pharmacologicalService.deletePharmacology(object).subscribe(
            (res: any) => {
              if (res.response !== undefined) {
                this.dialogService.alert(res.response, 'error');
              } else {
                this.dialogService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.getAllPharmacology(this.providerServiceMapID);
              }
            },
            (err) => {
              console.log('error', err);
            },
          );
        }
      });
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.displayTable = true;
    this.filteredPharmacologicalList.data = this.pharmacologicalList;
    this.filteredPharmacologicalList.paginator = this.paginator;
    // this.getAllPharmacology(this.providerServiceMapID);
  }

  PharmaCodeExist: any = false;
  checkExistance(pharmaCode: any) {
    if (pharmaCode) {
      this.pharmacologicalService
        .checkForUniquePharmacolgyCategory(
          pharmaCode,
          this.providerServiceMapID,
        )
        .subscribe((response: any) => {
          const temp = this.bufferArray.data.filter(
            (item: any) => item.pharmCategoryCode === pharmaCode,
          );
          if (response.response === 'true' || temp.length > 0) {
            this.PharmaCodeExist = true;
            this.PharmaAddForm.controls['pharmaCode'].setErrors({
              unique: true,
            });
          } else {
            this.PharmaCodeExist = false;
            this.PharmaAddForm.controls['pharmaCode'].setErrors(null);
          }
          console.log(response.response, this.PharmaCodeExist, temp.length);
        });
    }
  }
}
