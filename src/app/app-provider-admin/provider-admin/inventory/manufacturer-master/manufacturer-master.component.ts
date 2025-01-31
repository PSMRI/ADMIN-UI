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
import { MatSelectChange } from '@angular/material/select';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ManufacturemasterService } from 'src/app/core/services/inventory-services/manufacturemaster.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuppliermasterService } from 'src/app/core/services/inventory-services/suppliermaster.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-manufacturer-master',
  templateUrl: './manufacturer-master.component.html',
  styleUrls: ['./manufacturer-master.component.css'],
})
export class ManufacturerMasterComponent implements OnInit, AfterViewInit {
  createButton = false;

  createdBy: any;
  uid: any;
  serviceProviderID: any;
  providerServiceMapID: any;
  edit_manufactureName: any;
  edit_manufactureDesc: any;
  edit_contactPerson: any;
  edit_manufactureCode: any;
  edit_status: any;
  edit_cstNo: any;
  edit_AddressLine1: any;
  edit_AddressLine2: any;
  edit_permanentstate: any;
  edit_Country: any;
  edit_District: any;
  edit_Pincode: any;
  manufactureId: any;
  services_array: any = [];
  states_array: any = [];
  permnantstates_array: any = [];
  country_array: any = [];
  districts_array: any = [];
  manufactureList: any = [];
  // filteredManufactureList: any = [];
  filteredManufactureList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  availableManufactureCode: any = [];
  // bufferArray: any = [];
  bufferArray = new MatTableDataSource<any>();
  state: any;
  edit_State: any;
  serviceline: any;
  edit_Serviceline: any;
  create_filterTerm!: string;
  create_manufactureCode: any;
  create_manufactureName: any;
  create_manufactureDesc: any;
  create_contactPerson: any;
  create_cstNo: any;
  AddressLine1: any;
  AddressLine2: any;
  create_country: any;
  create_permanentstate: any;
  District: any;
  Pincode: any;
  gstNoPattern =
    /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9]{1}/;

  formMode = false;
  tableMode = true;
  editMode = false;
  displayTable = false;
  countryCheck = false;
  @ViewChild('manufactureAddForm') manufactureAddForm!: NgForm;
  displayedColumns: string[] = [
    'sno',
    'manufacturerCode',
    'manufacturerName',
    'manufacturerDesc',
    'contactPerson',
    'edit',
    'action',
  ];

  constructor(
    public commonservice: CommonServices,
    public commonDataService: dataService,
    private manufactureService: ManufacturemasterService,
    private supplierService: SuppliermasterService,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    console.log(this.createdBy, 'CreatedBy');
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uid = this.commonDataService.uid;
    this.getServices();
    this.getAllCountry();
  }

  ngAfterViewInit() {
    this.filteredManufactureList.paginator = this.paginator;
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
    this.supplierService
      .getStates(this.uid, service.serviceID, false)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All states success based on service', response.data);
          this.states_array = response.data;
        }
      });
  }
  // Inside your component class
  onStateChange(event: MatSelectChange) {
    const selectedValue = event.source.value;
    this.getAllManufactures(selectedValue);
  }

  getAllManufactures(providerServiceMapID: any) {
    this.createButton = true;
    this.providerServiceMapID = providerServiceMapID;
    this.manufactureService
      .getAllManufacture(providerServiceMapID)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All stores services success', response);
          this.manufactureList = response.data;
          this.filteredManufactureList.data = response.data;
          this.filteredManufactureList.paginator = this.paginator;
          this.displayTable = true;
          for (const availableManufactureCode of this.manufactureList) {
            this.availableManufactureCode.push(
              availableManufactureCode.manufactureCode,
            );
          }
        }
      });
  }
  getDistricts(stateID: any) {
    //  this.addressStateID = stateID;
    this.manufactureService.getAllDistricts(stateID).subscribe(
      (response: any) => {
        this.getPermanentDistrictsSuccessHandler(response);
      },
      (err) => console.log(err, 'error'),
    );
  }
  getPermanentDistrictsSuccessHandler(response: any) {
    console.log('Display all Districts', response);
    this.districts_array = response.data;
  }
  getAllStates(countryID: any) {
    if (countryID !== 1) {
      this.countryCheck = true;
    } else {
      this.manufactureService.getAllStates(countryID).subscribe(
        (response: any) => {
          this.getPermanentStatesSuccessHandler(response);
        },
        (err) => console.log(err, 'error'),
      );
    }
  }
  getPermanentStatesSuccessHandler(response: any) {
    console.log('Display all State', response);
    this.permnantstates_array = response.data;
  }
  getAllCountry() {
    this.manufactureService.getAllCountry().subscribe(
      (response) => {
        this.getCountrySuccessHandler(response);
      },
      (err) => console.log(err, 'error'),
    );
  }
  getCountrySuccessHandler(response: any) {
    console.log('Display all Country', response);
    this.country_array = response.data;
  }
  filterManufactureList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredManufactureList.data = this.manufactureList;
      this.filteredManufactureList = new MatTableDataSource<any>(
        this.filteredManufactureList.data,
      );
      this.filteredManufactureList.paginator = this.paginator;
    } else {
      this.filteredManufactureList.data = [];
      this.filteredManufactureList.paginator = this.paginator;
      this.manufactureList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'manufacturerCode' ||
            key === 'manufacturerName' ||
            key === 'manufacturerDesc' ||
            key === 'contactPerson'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredManufactureList.data.push(item);
              this.filteredManufactureList = new MatTableDataSource<any>(
                this.filteredManufactureList.data,
              );
              this.filteredManufactureList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  add2buffer(formvalues: any) {
    console.log('form values', formvalues);
    const obj = {
      manufacturerCode: formvalues.manufactureCode,
      manufacturerName: formvalues.manufactureName,
      manufacturerDesc: formvalues.manufactureDesc,
      contactPerson: formvalues.contactPerson,
      status: formvalues.status1,
      cST_GST_No: formvalues.cstNo,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
      addressLine1:
        formvalues.addressLine1 !== undefined &&
        formvalues.addressLine1 !== null
          ? formvalues.addressLine1.trim()
          : null,
      addressLine2:
        formvalues.addressLine2 !== undefined &&
        formvalues.addressLine2 !== null
          ? formvalues.addressLine2.trim()
          : null,
      districtID: formvalues.district,
      stateID: formvalues.state.stateID,
      countryID: formvalues.country.countryID,
      pinCode: formvalues.pincode,
      stateName: formvalues.state.stateName,
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
          this.bufferArray.data[i].manufacturerCode ===
            object.manufacturerCode &&
          this.bufferArray.data[i].manufacturerName === object.manufacturerName
        ) {
          duplicateStatus = duplicateStatus + 1;
          this.dialogService.alert('Manufacturer is already added in list');
        }
      }
      if (duplicateStatus === 0) {
        this.bufferArray.data.push(object);
        this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
      }
    }
  }
  editManufacture(editformvalues: any) {
    this.edit_Serviceline = this.serviceline;
    this.edit_State = this.state;
    console.log('this.edit_State', this.edit_State);
    console.log('states_array', this.states_array);
    this.manufactureId = editformvalues.manufacturerID;
    this.getAllStates(editformvalues.countryID);
    this.getDistricts(editformvalues.stateID);
    this.edit_manufactureCode = editformvalues.manufacturerCode;
    this.edit_manufactureName = editformvalues.manufacturerName;
    this.edit_manufactureDesc = editformvalues.manufacturerDesc;
    this.edit_contactPerson = editformvalues.contactPerson;
    this.edit_status = editformvalues.status;
    this.edit_cstNo = editformvalues.cST_GST_No;
    this.edit_AddressLine1 =
      editformvalues.addressLine1 !== undefined &&
      editformvalues.addressLine1 !== null
        ? editformvalues.addressLine1.trim()
        : null;
    (this.edit_AddressLine2 =
      editformvalues.addressLine2 !== undefined &&
      editformvalues.addressLine2 !== null
        ? editformvalues.addressLine2.trim()
        : null),
      (this.edit_permanentstate = editformvalues.stateID);
    this.edit_Country = editformvalues.countryID;
    this.edit_District = editformvalues.districtID;
    this.edit_Pincode = editformvalues.pinCode;
    this.showEditForm();
  }
  updatemanufactre(editformvalues: any) {
    const editObj = {
      manufacturerDesc: editformvalues.manufactureDesc,
      modifiedBy: this.createdBy,
      manufacturerID: this.manufactureId,
      addressLine1:
        editformvalues.addressLine1 !== undefined &&
        editformvalues.addressLine1 !== null
          ? editformvalues.addressLine1.trim()
          : null,
      addressLine2:
        editformvalues.addressLine2 !== undefined &&
        editformvalues.addressLine2 !== null
          ? editformvalues.addressLine2.trim()
          : null,
      districtID: editformvalues.edit_District,
      stateID: editformvalues.edit_permanentstate,
      countryID: editformvalues.country,
      pinCode: editformvalues.pincode,
      contactPerson: editformvalues.contactPerson,
      cST_GST_No: editformvalues.cstNo,
    };
    this.manufactureService.updateManufacture(editObj).subscribe(
      (response) => {
        if (response) {
          this.showTable();
          console.log(response, 'after successful updation of manufacure');
          this.dialogService.alert('Updated successfully', 'success');
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
    this.countryCheck = false;
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  removeRow(index: any) {
    this.bufferArray.data.splice(index, 1);
    this.bufferArray = new MatTableDataSource<any>(this.bufferArray.data);
  }
  activate(manufacturerID: any) {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to Activate?')
      .subscribe((response) => {
        if (response) {
          const object = {
            manufacturerID: manufacturerID,
            deleted: false,
          };

          this.manufactureService.deleteManufacture(object).subscribe(
            (response) => {
              if (response) {
                this.dialogService.alert('Activated successfully', 'success');
                this.getAllManufactures(this.providerServiceMapID);
                this.create_filterTerm = '';
              }
            },
            (err) => {
              console.log('error', err);
            },
          );
        }
      });
  }
  deactivate(manufacturerID: any) {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response) => {
        if (response) {
          const object = {
            manufacturerID: manufacturerID,
            deleted: true,
          };

          this.manufactureService.deleteManufacture(object).subscribe(
            (response) => {
              if (response) {
                this.dialogService.alert('Deactivated successfully', 'success');
                this.getAllManufactures(this.providerServiceMapID);
                this.create_filterTerm = '';
              }
            },
            (err) => {
              console.log('error', err);
            },
          );
        }
      });
  }
  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.displayTable = true;
    this.getAllManufactures(this.providerServiceMapID);
    this.countryCheck = false;
    this.create_filterTerm = '';
    // this.filteredManufactureList = this.manufactureList;
  }
  saveManufacture() {
    console.log('object before saving the store', this.bufferArray.data);
    this.manufactureService.saveManufacture(this.bufferArray.data).subscribe(
      (response: any) => {
        if (response) {
          console.log(response, 'after successful creation of store');
          this.dialogService.alert('Saved successfully', 'success');
          this.showTable();
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }

  ManufactureCodeExist: any = false;
  checkExistance(manufactureCode: any) {
    if (manufactureCode) {
      this.manufactureService
        .checkForUniqueManufacturerCode(
          manufactureCode,
          this.providerServiceMapID,
        )
        .subscribe((response: any) => {
          const temp = this.bufferArray.data.filter(
            (item: any) => item.manufacturerCode === manufactureCode,
          );
          if (response.response === 'true' || temp.length > 0) {
            this.ManufactureCodeExist = true;
            this.manufactureAddForm.controls['manufactureCode'].setErrors({
              unique: true,
            });
          } else {
            this.ManufactureCodeExist = false;
            this.manufactureAddForm.controls['manufactureCode'].setErrors(null);
          }
          console.log(response, temp.length, this.ManufactureCodeExist);
        });
    }
  }
}
