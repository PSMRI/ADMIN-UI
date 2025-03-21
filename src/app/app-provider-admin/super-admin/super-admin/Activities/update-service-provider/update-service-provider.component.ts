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
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { EditProviderDetailsComponent } from '../edit-provider-details/edit-provider-details.component';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-update-service-provider',
  templateUrl: './update-service-provider.component.html',
  styleUrls: ['./update-service-provider.component.css'],
})
export class UpdateServiceProviderComponent implements OnInit {
  // @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  // filtereddata = new MatTableDataSource<any>();

  // filtereddata: any = [];
  allProviders: any = [];
  providerSelected: any;
  data: any = [];
  showProvider = false;
  searchPage = true;
  countryID = 1;
  states: any = [];
  servicelines: any = [];
  state: any;
  filteredStates: any = [];
  serviceline: any;
  provider: any;
  allServicesMapped: any;

  isNational = false;

  constructor(
    public super_admin_service: SuperAdmin_ServiceProvider_Service,
    public dialog: MatDialog,
    private message: ConfirmationDialogsService,
    public commonAppData: dataService,
  ) {}
  displayedColumns = ['sno', 'serviceName', 'stateName', 'edit', 'status'];

  paginator!: MatPaginator;
  j: any;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filtereddata = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filtereddata.paginator = this.paginator;
  }
  ngOnInit() {
    this.super_admin_service.getAllProvider().subscribe(
      (response: any) => this.providerData_successHandler(response),
      (err) => {
        console.log(err, 'error');
      },
    );
    this.super_admin_service.getAllStates(this.countryID).subscribe(
      (response: any) => this.getAllStates(response),
      (err) => {
        console.log(err, 'error');
      },
    );

    this.getAllServicelines_new();
  }

  getAllStates(response: any) {
    this.states = response.data;
  }

  getAllServicelines_new() {
    this.super_admin_service.getAllServiceLines().subscribe(
      (response: any) => {
        this.servicelines = response.data;
      },
      (err) => {
        console.log('Servicelines fetching error', err);
        console.log(err, 'error');
      },
    );
  }

  setIsNationalFlag(value: any) {
    this.isNational = value;
  }

  getAvailableStates(serviceID: any) {
    console.log('all states', this.states);
    const mappedStateIDs = [];
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i].serviceID === serviceID) {
        if (this.data[i].stateID === undefined) {
          this.message.alert(
            'This national level service has already been mapped',
          );
        }
        if (this.data[i].stateID !== undefined) {
          // in case of isNational=false, this code will work
          mappedStateIDs.push(this.data[i].stateID);
        }
      }
    }

    console.log('all mapped states IDs', mappedStateIDs);

    // filtering logic
    const filtered_states = [];
    for (let j = 0; j < this.states.length; j++) {
      let state_exists = false;
      for (let k = 0; k < mappedStateIDs.length; k++) {
        if (this.states[j].stateID === mappedStateIDs[k]) {
          state_exists = true;
        }
      }
      if (!state_exists) {
        filtered_states.push(this.states[j]);
      }
    }

    console.log('Filtered States', filtered_states);
    this.filteredStates = filtered_states;
    if (this.states.length < 1) {
      this.message.alert('All states have been mapped to this serviceline');
    }
  }

  providerData_successHandler(response: any) {
    this.allProviders = response.data;
    console.log(response.data.length);
  }
  selectedProvider(provider: any) {
    this.showProvider = true;
    this.provider = provider;
    this.super_admin_service.getProviderStatus(provider).subscribe(
      (response: any) => this.providerInfo_handler(response),
      (err) => {
        console.log(err, 'error');
      },
    );
  }
  providerInfo_handler(response: any) {
    console.log(response);
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.filtereddata.paginator = this.paginator;
  }
  addOrModify() {
    this.searchPage = false;
  }
  back() {
    this.message
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe(
        (res) => {
          if (res) {
            this.searchPage = true;
            this.state = '';
            this.serviceline = '';
            // this.servicelines = [];
            this.allServicesMapped = false;
            this.isNational = false;
          }
        },
        (err) => {},
      );
  }

  modifyProvider(value: any) {
    const obj = {
      serviceProviderID: this.providerSelected,
      stateID1: value.state ? value.state : [],
      createdBy: this.commonAppData.uname,
      serviceID: value.serviceLine,
      statusID: 2,
    };
    const reqArray = [];
    reqArray.push(obj);
    console.log('REQUEST Array', reqArray);
    this.super_admin_service
      .addProviderStateAndServiceLines(reqArray)
      .subscribe(
        (response: any) => this.servicelineAddedSuccesshandler(response),
        (err) => {
          console.log(err, 'error');
        },
      );
  }
  servicelineAddedSuccesshandler(response: any) {
    this.message.alert('Saved successfully', 'success');
    this.super_admin_service.getProviderStatus(this.provider).subscribe(
      (res: any) => this.providerInfo_handler(res),
      (err) => {
        console.log(err, 'error');
      },
    );
    this.searchPage = true;
    this.state = '';
    this.serviceline = '';
    // this.servicelines = [];
  }
  edit(providerID: any) {
    const dialogRef = this.dialog.open(EditProviderDetailsComponent, {
      height: '550px',
      width: '750px',
      data: this.allProviders.filter(function (item: any) {
        return item.serviceProviderId === providerID;
      }),
    });
    dialogRef.afterClosed().subscribe((result) => {
      this.super_admin_service.getAllProvider().subscribe(
        (response: any) => this.providerData_successHandler(response),
        (err) => {
          console.log(err, 'error');
        },
      );
    });
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
      this.filtereddata.paginator = this.paginator;
    } else {
      this.filtereddata.data = [];
      this.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'serviceName' || key === 'stateName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filtereddata.data.push(item);
              break;
            }
          }
        }
      });
      this.filtereddata.paginator = this.paginator;
    }
  }
}
