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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';


@Component({
  selector: 'app-service-provider-master',
  templateUrl: './service-provider-master.component.html',
  styleUrls: ['./service-provider-master.component.css'],
})

/* Created By: Diamond Khanna , 11 Jan,2018
   Intention: Only creates 'New Providers' (without any service-state mappings),
              can view Existing Providers, edit details and can Activate/Deactivate
              the Providers
 */
export class ServiceProviderMasterComponent implements OnInit {
  displayedColumns = [
    'sno',
    'serviceProviderName',
    'primaryContactName',
    'primaryContactNo',
    'primaryContactAddress',
    'edit',
    'action',
  ];

  paginator!: MatPaginator;
  j: any;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResult = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResult.paginator = this.paginator;
  }
  // filteredsearchResult: any = [];
  // ngModel
  validFrom: any;
  validTill!: Date;
  today!: Date;

  providerName: any;
  primaryName: any;
  primaryNumber: any;
  primaryEmail: any;
  primaryAddress: any;
  address1: any;
  address2: any;

  // array
  searchResult: any = [];

  // flags
  tableMode = true;
  formMode = false;
  editMode = false;
  providerNameExist = false;

  // constants & variables
  emailPattern = /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;
  mobileNoPattern = /^[1-9][0-9]{9}/;
  createdBy: any;
  providerNameBeforeEdit: any;
  serviceProviderID: any;

  @ViewChild('providerCreationForm')
  providerCreationForm!: NgForm;

  constructor(
    public superadminService: SuperAdmin_ServiceProvider_Service,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.today = new Date();
    this.validFrom = this.today;
    this.validTill = this.today;

    this.getAllProviders();
  }

  @ViewChild(MatSort) sort!: MatSort;
  ngAfterViewInit() {
  this.filteredsearchResult.sort = this.sort;
  }
  
  showTable() {
    if (this.editMode) {
      this.tableMode = true;
      this.formMode = false;
      this.editMode = false;

      /* resetting ngModels used in editing if moving BACK from edit mode*/
      this.resetNGmodels();

      /* resetting date if moving BACK from edit mode */
      this.today = new Date();
      this.validFrom = this.today;
      this.validTill = this.today;
    } else {
      this.tableMode = true;
      this.formMode = false;
      this.editMode = false;
    }
  }

  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }

  showEditForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = true;
  }

  checkProviderNameAvailability(serviceProviderName: any) {
    this.superadminService
      .checkProviderNameAvailability(serviceProviderName)
      .subscribe(
        (response: any) => {
          console.log(response.data, 'Check Provider Name Success Handeler');
          if (
            response.data.toUpperCase() === 'provider_name_exists'.toUpperCase()
          ) {
            if (this.editMode && this.formMode) {
              if (
                serviceProviderName.toUpperCase() ===
                this.providerNameBeforeEdit.toUpperCase()
              ) {
                this.providerNameExist = false;
              } else {
                this.providerNameExist = true;
              }
            }
            if (this.formMode === true && this.editMode === false) {
              this.providerNameExist = true;
            }
          }
          if (
            response.data.toUpperCase() ===
            'provider_name_doesnt_exist'.toUpperCase()
          ) {
            this.providerNameExist = false;
          }
        },
        (err) => {
          console.log(err, 'Error');
        },
      );
  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }
  back() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showTable();
          this.providerCreationForm.resetForm();
        }
      });
  }
  save(form_value: any) {
    console.log(form_value, 'Form Value');
    // console.log(
    //   'address',
    //   form_value.address2 === undefined,
    //   form_value.address2.trim(),
    // );
    const valid_till: Date = new Date(form_value.valid_till);

    valid_till.setHours(23);
    valid_till.setMinutes(59);
    valid_till.setSeconds(59);
    valid_till.setMilliseconds(0);

    const object = {
      serviceProviderName: form_value.provider_name,
      createdBy: this.createdBy,
      primaryContactName: form_value.contact_person,
      primaryContactNo: form_value.contact_number,
      primaryContactEmailID: form_value.email,
      primaryContactAddress:
        (form_value.address1 !== undefined && form_value.address1 !== null
          ? form_value.address1.trim()
          : '') +
        (form_value.address2 === undefined
          ? ''
          : ',' + form_value.address2.trim()),
      statusID: '2',
      validFrom: new Date(
        this.validFrom - 1 * (this.validFrom.getTimezoneOffset() * 60 * 1000),
      ),
      validTill: new Date(
        valid_till.valueOf() - 1 * (valid_till.getTimezoneOffset() * 60 * 1000),
      ),
      deleted: false,
    };
    console.log('object', object);

    const requestArray = [];
    requestArray.push(object);

    this.superadminService.createProvider(requestArray).subscribe(
      (response: any) => {
        console.log(response, 'Provider Creation Success Handeler');
        if (response.data.length > 0) {
          this.dialogService.alert('Saved successfully', 'success');

          /* resetting form,ngModels and Dates */
          this.providerCreationForm.reset();
          this.resetNGmodels();
          this.resetDates();

          /* show and refresh table*/
          this.showTable();
          this.getAllProviders();
        }
      },
      (err) => {
        console.log(err, 'Error');
      },
    );
  }

  getAllProviders() {
    this.superadminService.getAllProvider_provider().subscribe(
      (response: any) => {
        if (response) {
          console.log('All Providers Success Handeler', response);
          this.searchResult = response.data;
          this.filteredsearchResult.data = response.data;
          this.filteredsearchResult.paginator = this.paginator;
        }
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  activate(serviceProviderID: any) {
    const object = { serviceProviderId: serviceProviderID, deleted: false };
    this.dialogService
      .confirm('Confirm', 'Are you sure want to Activate?')
      .subscribe((res) => {
        if (res) {
          this.superadminService.deleteProvider(object).subscribe(
            (response: any) => {
              if (response) {
                this.dialogService.alert('Activated successfully', 'success');
                /* refresh table */
                this.getAllProviders();
              }
            },
            (err) => {
              console.log(err);
            },
          );
        }
      });
  }
  filterValidFrom = (date: Date | null): boolean => {
    const today = new Date();
    // Allow dates from today and onwards
    return date !== null && date >= today;
  };
  deactivate(serviceProviderID: any) {
    const object = { serviceProviderId: serviceProviderID, deleted: true };
    this.dialogService
      .confirm('Confirm', 'Are you sure want to Deactivate?')
      .subscribe((res) => {
        if (res) {
          this.superadminService.deleteProvider(object).subscribe(
            (response: any) => {
              if (response) {
                this.dialogService.alert('Deactivated successfully', 'success');
                /* refresh table */
                this.getAllProviders();
              }
            },
            (err) => {
              console.log(err);
            },
          );
        }
      });
  }

  edit(row: any) {
    this.showEditForm();
    this.providerNameBeforeEdit = row.serviceProviderName; // saving the existing-name of the Provider before editing
    this.serviceProviderID = row.serviceProviderId;

    this.providerName = row.serviceProviderName;
    this.primaryName = row.primaryContactName;
    this.primaryNumber = row.primaryContactNo;
    this.primaryEmail = row.primaryContactEmailID;
    this.primaryAddress =
      row.primaryContactAddress !== undefined &&
      row.primaryContactAddress !== null
        ? row.primaryContactAddress.trim()
        : null;

    this.validFrom = new Date(row.validFrom);
    this.validTill = new Date(row.validTill);
  }

  update(form_value: any) {
    const object: any = {
      serviceProviderId: this.serviceProviderID,
      serviceProviderName: form_value.provider_name,
      primaryContactName: form_value.contact_person,
      primaryContactNo: form_value.contact_number,
      primaryContactEmailID: form_value.email,
      primaryContactAddress:
        form_value.address !== undefined && form_value.address !== null
          ? form_value.address.trim()
          : null,
      validTill: new Date(
        form_value.valid_till -
          1 * (form_value.valid_till.getTimezoneOffset() * 60 * 1000),
      ),
      modifiedBy: this.createdBy,
    };

    this.superadminService.updateProviderDetails(object).subscribe(
      (response) => {
        console.log('Edit success callback', response);
        this.dialogService.alert('Updated successfully', 'success');
        /* resetting form and ngModels used in editing */
        this.providerCreationForm.reset();
        this.resetNGmodels();

        /* resetting dates */
        this.resetDates();

        /* showing and refreshing table */
        this.getAllProviders();
        this.showTable();
      },
      (err) => {
        console.log('error', err);
      },
    );
  }

  resetNGmodels() {
    this.providerName = '';
    this.primaryName = '';
    this.primaryNumber = '';
    this.primaryEmail = '';
    this.primaryAddress = '';

    this.address1 = '';
    this.address2 = '';
  }
  filterComponentList(searchTerm?: string) {
    console.log('searchTerm', searchTerm);
    if (!searchTerm) {
      this.filteredsearchResult.data = this.searchResult;
      this.filteredsearchResult.paginator = this.paginator;
    } else {
      this.filteredsearchResult.data = [];
      this.searchResult.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'serviceProviderName' ||
            key === 'primaryContactName' ||
            key === 'primaryContactNo'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResult.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredsearchResult.paginator = this.paginator;
    }
  }

  resetDates() {
    this.today = new Date();
    this.validFrom = this.today;
    this.validTill = this.today;
  }
}
