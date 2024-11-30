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
import { SuppliermasterService } from 'src/app/core/services/inventory-services/suppliermaster.service';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-supplier-master',
  templateUrl: './supplier-master.component.html',
  styleUrls: ['./supplier-master.component.css'],
})
export class SupplierMasterComponent implements OnInit, AfterViewInit {
  createButton = false;
  supplierID: any;
  state: any;
  edit_emergencyContactNo: any;
  edit_contactNo: any;
  edit_emailID: any;
  edit_Pincode: any;
  edit_district: any;
  edit_country: any;
  edit_AddressLine2: any;
  edit_AddressLine1: any;
  edit_tinNo: any;
  edit_cstNo: any;
  edit_drugLicense: any;
  edit_contactPerson: any;
  edit_supplierDesc: any;
  edit_supplierName: any;
  edit_supplierCode: any;
  edit_state: any;
  edit_state1: any;
  edit_serviceline: any;
  serviceline: any;
  uid: any;
  permnantstates_array: any = [];
  country_array: any = [];
  emailPattern =
    /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|in|co.in|ORG|COM|IN|CO.IN)\b$/;
  gstNoPattern =
    /^[0-9]{2}[a-zA-Z]{5}[0-9]{4}[a-zA-Z]{1}[1-9A-Za-z]{1}[Z]{1}[0-9]{1}/;
  mobileNoPattern = /^[1-9][0-9]{9}/;
  create_filterTerm!: string;

  formMode = false;
  tableMode = true;
  editMode = false;
  displayTable = false;
  countryCheck = false;

  addressStateID: any;
  createdBy: any;
  serviceProviderID: any;
  providerServiceMapID: any;
  services_array: any = [];
  states_array: any = [];
  supplierList: any = [];
  // filteredsupplierList: any = [];
  filteredsupplierList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  bufferArray = new MatTableDataSource<any>();
  // bufferArray: any = [];
  districts_array: any = [];
  availableSupplierCode: any = [];
  create_supplierCode: any;
  create_supplierName: any;
  create_supplierDesc: any;
  create_contactPerson: any;
  create_drugLicense: any;
  create_cstNo: any;
  create_tinNo: any;
  AddressLine1: any;
  AddressLine2: any;
  create_country: any;
  create_state: any;
  District: any;
  Pincode: any;
  contactNo: any;
  emergency_contactNo: any;
  emailID: any;
  @ViewChild('supplierAddForm') supplierAddForm!: NgForm;

  constructor(
    public commonservice: CommonServices,
    private supplierService: SuppliermasterService,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.sessionstorage.getItem('uname');
    console.log(this.createdBy, 'CreatedBy');
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uid = this.sessionstorage.getItem('uid');
    this.getServices();
    this.getAllCountry();
  }
  ngAfterViewInit() {
    this.filteredsupplierList.paginator = this.paginator;
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
    this.supplierService
      .getStates(this.uid, service.serviceID, false)
      .subscribe((response: any) => {
        if (response && response.data) {
          console.log('All states success based on service', response);
          this.states_array = response.data;
        }
      });
  }
  getDistricts(stateID: any) {
    this.addressStateID = stateID;
    this.supplierService.getAllDistricts(this.addressStateID).subscribe(
      (response) => {
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
      this.supplierService.getAllStates().subscribe(
        (response) => {
          this.getPermanentStatesSuccessHandler(response);
        },
        (err) => console.log(err, 'error'),
      );
    }
  }
  getPermanentStatesSuccessHandler(response: any) {
    console.log('Display all Districts', response);
    this.permnantstates_array = response.data;
  }
  getAllCountry() {
    this.supplierService.getAllCountry().subscribe(
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

  getAllSuppliers(providerServiceMapID: any) {
    this.createButton = true;
    this.providerServiceMapID = providerServiceMapID;
    this.supplierService
      .getAllSuppliers(providerServiceMapID)
      .subscribe((response: any) => {
        if (response) {
          console.log('All stores services success', response);
          this.supplierList = response.data;
          this.filteredsupplierList.data = response.data;
          this.filteredsupplierList.paginator = this.paginator;
          this.displayTable = true;
          for (const availableSupplierCode of this.supplierList) {
            this.availableSupplierCode.push(availableSupplierCode.supplierCode);
          }
        }
      });
  }
  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.resetDropdowns();
    this.getAllSuppliers(this.providerServiceMapID);
    this.create_filterTerm = '';
    //this.filteredsupplierList = this.supplierList;
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
  filtersupplierList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsupplierList.data = this.supplierList;
      this.filteredsupplierList = new MatTableDataSource<any>(
        this.filteredsupplierList.data,
      );
      this.filteredsupplierList.paginator = this.paginator;
    } else {
      this.filteredsupplierList.data = [];
      this.supplierList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'supplierName' ||
            key === 'supplierCode' ||
            key === 'supplierDesc' ||
            key === 'drugLicenseNo' ||
            key === 'contactPerson' ||
            key === 'tIN_No'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsupplierList.data.push(item);
              this.filteredsupplierList = new MatTableDataSource<any>(
                this.filteredsupplierList.data,
              );
              this.filteredsupplierList.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
  activate(supplierID: any) {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to Activate?')
      .subscribe((response) => {
        if (response) {
          const object = {
            supplierID: supplierID,
            deleted: false,
          };

          this.supplierService.deleteSupplier(object).subscribe(
            (response) => {
              if (response) {
                this.dialogService.alert('Activated successfully', 'success');
                this.getAllSuppliers(this.providerServiceMapID);
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
  deactivate(supplierID: any) {
    this.dialogService
      .confirm('confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response) => {
        if (response) {
          const object = {
            supplierID: supplierID,
            deleted: true,
          };

          this.supplierService.deleteSupplier(object).subscribe(
            (response) => {
              if (response) {
                this.dialogService.alert('Deactivated successfully', 'success');
                this.getAllSuppliers(this.providerServiceMapID);
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
  add2buffer(formvalues: any) {
    //this.resetDropdowns();
    this.districts_array = [];
    console.log('form values', formvalues);
    const obj = {
      serviceName: this.serviceline.serviceName,
      stateName: formvalues.state.stateName,
      supplierCode: formvalues.supplierCode,
      supplierName: formvalues.supplierName,
      supplierDesc: formvalues.supplierDesc,
      contactPerson: formvalues.contactPerson,
      drugLicenseNo: formvalues.drugLicense,
      cST_GST_No: formvalues.cstNo,
      tIN_No: formvalues.tinNo,
      email: formvalues.primaryEmail,
      status: 'active',
      phoneNo1: formvalues.primaryMobileNo,
      phoneNo2: formvalues.emergencyContactNo,
      createdBy: this.createdBy,
      providerServiceMapID: this.providerServiceMapID,
      addressLine1: formvalues.addressLine1,
      addressLine2: formvalues.addressLine2,
      districtID: formvalues.district,
      stateID: formvalues.state.stateID,
      pinCode: formvalues.pincode,
      countryID: formvalues.country.countryID,
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
          this.bufferArray.data[i].supplierCode === object.supplierCode &&
          this.bufferArray.data[i].supplierName === object.supplierName
        ) {
          duplicateStatus = duplicateStatus + 1;
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
  saveSupplier() {
    console.log('object before saving the supplier', this.bufferArray.data);
    this.supplierService.saveSupplier(this.bufferArray.data).subscribe(
      (response: any) => {
        if (response) {
          console.log(response, 'after successful creation of supplier');
          this.dialogService.alert('Saved successfully', 'success');
          this.resetDropdowns();
          this.showTable();
          this.getAllSuppliers(this.providerServiceMapID);
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }
  editsupplier(editFormValues: any) {
    this.edit_serviceline = this.serviceline.serviceID;
    this.edit_state = this.state.stateID;
    this.getAllStates(editFormValues.countryID);
    this.getDistricts(editFormValues.stateID);
    this.supplierID = editFormValues.supplierID;
    this.edit_supplierCode = editFormValues.supplierCode;
    this.edit_supplierName = editFormValues.supplierName;
    this.edit_supplierDesc = editFormValues.supplierDesc;
    this.edit_contactPerson = editFormValues.contactPerson;
    this.edit_drugLicense = editFormValues.drugLicenseNo; //facilityTypeID
    this.edit_cstNo = editFormValues.cST_GST_No;
    this.edit_tinNo = editFormValues.tIN_No;
    this.edit_AddressLine1 = editFormValues.addressLine1;
    this.edit_AddressLine2 = editFormValues.addressLine2;
    this.edit_state1 = editFormValues.stateID;
    this.edit_Pincode = editFormValues.pinCode;
    this.edit_contactNo = editFormValues.phoneNo1;
    this.edit_emergencyContactNo = editFormValues.phoneNo2;
    this.edit_emailID = editFormValues.email;
    this.edit_district = editFormValues.districtID;
    this.edit_country = editFormValues.countryID;
    this.showEditForm();
    console.log('edit form values', editFormValues);
  }
  updatesupplier(editedFormValues: any) {
    const editObj = {
      supplierID: this.supplierID,
      supplierDesc: editedFormValues.supplierDesc,
      modifiedBy: this.createdBy,
      addressLine1: editedFormValues.addressLine1,
      addressLine2: editedFormValues.addressLine2,
      districtID: editedFormValues.edit_district,
      stateID: editedFormValues.edit_state1,
      pinCode: editedFormValues.pincode,
      countryID: editedFormValues.country,
      contactPerson: editedFormValues.contactPerson,
      drugLicenseNo: editedFormValues.drugLicense,
      cST_GST_No: editedFormValues.cstNo,
      tIN_No: editedFormValues.tinNo,
      email: editedFormValues.primaryEmail,
      phoneNo1: editedFormValues.primaryMobileNo,
      phoneNo2: editedFormValues.emergencyContactNo,
    };

    this.supplierService.updateSupplier(editObj).subscribe(
      (response) => {
        if (response) {
          console.log(response, 'after successful updation of Store');
          this.dialogService.alert('Updated successfully', 'success');
          this.resetDropdowns();
          this.showTable();
          this.getAllSuppliers(this.providerServiceMapID);
        }
      },
      (err) => {
        console.log(err, 'ERROR');
      },
    );
  }

  resetDropdowns() {}

  SupplierCodeExist: any = false;
  checkExistance(supplierCode: any) {
    if (supplierCode) {
      this.supplierService
        .checkForUniqueSupplierCode(supplierCode, this.providerServiceMapID)
        .subscribe((response: any) => {
          const temp = this.bufferArray.data.filter(
            (item: any) => item.supplierCode === supplierCode,
          );
          if (response.response === 'true' || temp.length > 0) {
            this.SupplierCodeExist = true;
            this.supplierAddForm.controls['supplierCode'].setErrors({
              unique: true,
            });
          } else {
            this.SupplierCodeExist = false;
            this.supplierAddForm.controls['supplierCode'].setErrors(null);
          }
          console.log(response.response, temp.length, this.SupplierCodeExist);
        });
    }
  }
}
