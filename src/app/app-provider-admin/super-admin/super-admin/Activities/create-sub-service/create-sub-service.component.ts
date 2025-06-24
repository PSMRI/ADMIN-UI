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
import { BlockProvider } from 'src/app/core/services/adminServices/AdminServiceProvider/block-provider-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
declare let jQuery: any;
@Component({
  selector: 'app-create-sub-service',
  templateUrl: './create-sub-service.component.html',
  styleUrls: ['./create-sub-service.component.css'],
})
export class CreateSubServiceComponent implements OnInit {
  displayedColumns = ['sno', 'SubService', 'Description', 'action'];

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
  // filtereddata: any;
  providerServiceMapID: any;
  services: any = [];
  subServices: any = [];
  services_array: any = [];
  serviceProviders: any = [];
  states: any = [];
  data: any = [];
  // ngModels
  serviceObj: any;
  subService: any;
  subServiceDesc: any;
  showTable = false;
  subServiceAvailable = false;
  allServicesAdded = false;
  serviceProvider: any;
  state: any;
  dummmy: any = [];
  searchServiceProvider: any;
  searchState: any;
  searchServiceObj: any;
  searchForm = true;
  statesSearched: any = [];
  servicesSearched: any = [];
  existingSubService: any = [];
  added = false;

  isNational = false;
  @ViewChild('form')
  form!: NgForm;
  constructor(
    private sub_service: BlockProvider,
    private commonData: dataService,
    private message: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.subServiceAvailable = false;
    this.sub_service.getAllProviders().subscribe(
      (response: any) => this.getAllProvidersSuccesshandeler(response),
      (err) => {
        //  this.message.alert(err, 'error');
        console.log(err, 'error response');
      },
    );
  }
  getAllProvidersSuccesshandeler(response: any) {
    this.serviceProviders = response.data;
  }

  getAllStatesInService(serviceProviderID: any, serviceID: any) {
    const data = {
      serviceProviderID: serviceProviderID,
      serviceID: serviceID,
    };
    this.state = undefined;
    this.data = [];
    this.filtereddata.data = [];
    this.sub_service.getStatesInServices(data).subscribe(
      (response: any) => {
        console.log(response.data, 'successful response');
        // this.states = undefined;
        this.states = response.data;
      },
      (err) => {
        console.log(err, 'error response');
        //   this.message.alert(err, 'error');
      },
    );
  }

  getServicesFromProvider(serviceProviderID: any) {
    this.sub_service.getServicesOfProvider(serviceProviderID).subscribe(
      (response: any) => {
        console.log(response.data, 'Success in getting Services from Provider');
        this.serviceObj = undefined;
        this.state = undefined;
        this.data = [];
        this.filtereddata.data = [];
        this.services = response.data.filter(function (obj: any) {
          return obj.serviceID === 3 || obj.serviceID === 1;
        });
      },
      (err) => {
        console.log(err, 'Error in getting Services from Provider');
        //   this.message.alert(err, 'error');
      },
    );
  }

  setIsNational(value: any, psmID: any) {
    this.isNational = value;

    if (value) {
      this.getExistingOnSearch(psmID);
    }
  }

  getExistingOnSearch(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.sub_service.getSubServiceDetails(providerServiceMapID).subscribe(
      (response: any) => this.populateTable(response, providerServiceMapID),
      (err) => {
        console.log(err, 'error response');
        //  this.message.alert(err, 'error');
      },
    );
  }
  populateTable(response: any, providerServiceMapID: any) {
    this.showTable = true;
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.getExistingSubService(providerServiceMapID);
  }
  getExistingSubService(providerServiceMapID: any) {
    this.sub_service.getSubServiceDetails(providerServiceMapID).subscribe(
      (response: any) => this.existingSubServiceHandler(response),
      (err) => {
        console.log(err, 'error response');
        //   this.message.alert(err, 'error');
      },
    );
  }

  existingSubServiceHandler(response: any) {
    this.existingSubService = [];
    this.existingSubService = response.data;
    if (this.state) {
      this.getSubServices(this.state);
    } else {
      this.getSubServices(this.serviceObj);
    }
  }

  add(
    serviceProvider: any,
    state: any,
    service: any,
    subServices: any,
    subServiceDesc: any,
  ) {
    const array: any = [];
    const obj: any = {};
    if (state) {
      obj['providerServiceMapID'] = state.providerServiceMapID;
    } else {
      obj['providerServiceMapID'] = this.states[0].providerServiceMapID;
    }
    obj['serviceID'] = service.serviceID;
    obj['subServiceDetails'] = [
      {
        subServiceName: subServices.subServiceName,
        subServiceDesc: subServiceDesc,
      },
    ];
    obj['createdBy'] = this.commonData.uname;
    array.push(obj);
    this.sub_service.save_SubService(array).subscribe(
      (response: any) => {
        if (response.data.length > 0) {
          this.message.alert('Saved successfully', 'success');
          this.searchForm = true;
          this.getExistingOnSearch(this.providerServiceMapID);
          this.sub_service
            .getSubServiceDetails(service.providerServiceMapID)
            .subscribe(
              (res) => {
                // this.showSubService(res, service.serviceName);
                this.clearFields();
              },
              (err) => {
                console.log(err, 'error response');
                //  this.message.alert(err, 'error');
              },
            );
        } else {
          this.message.alert('Something went wrong', 'error');
        }
      },
      (err) => {
        console.log(err, 'error response');
        //  this.message.alert(err, 'error');
      },
    );
  }
  getSubServices(service: any) {
    this.allServicesAdded = false;
    this.subServices = [];
    this.sub_service.getAllSubService(service.serviceID).subscribe(
      (res: any) => {
        if (res) {
          if (res.data.length === 0) {
            this.subServiceAvailable = true;
            // this.message.alert('No Sub Service available please select different service');
          } else {
            let tempService = {};
            let temp: boolean;
            for (let i = 0; i < res.data.length; i++) {
              temp = true;
              for (let a = 0; a < this.existingSubService.length; a++) {
                if (
                  res.data[i].subServiceName ===
                  this.existingSubService[a].subServiceName
                ) {
                  temp = false;
                }
              }
              if (temp) {
                tempService = res.data[i];
                this.subServices.push(tempService);
                tempService = {};
              }
            }
            this.subServiceAvailable = false;
            if (this.subServices.length === 0) {
              this.allServicesAdded = true;
              // this.message.alert('All services Mapped');
            }
          }
        }
      },
      (err) => {
        console.log(err, 'error response');
        //  this.message.alert(err, 'error');
      },
    );
  }

  showSubService(response: any, serviceName: any) {
    this.added = true;
    // this.getAllStatesInService(this.serviceProvider, this.serviceID);
    this.searchServiceProvider = this.serviceProvider;
    this.getServicesFromProvider(this.serviceProvider);
    this.searchState = this.state;
    this.searchServiceObj = this.serviceObj;
    if (this.state) {
      this.getExistingOnSearch(this.state.providerServiceMapID);
    } else {
      this.getExistingOnSearch(this.states[0].providerServiceMapID);
    }
  }
  addSubService(flag: any) {
    this.searchForm = flag;
    // if (flag) {
    if (this.state) {
      this.getExistingOnSearch(this.state.providerServiceMapID);
    } else {
      this.getExistingOnSearch(this.states[0].providerServiceMapID);
    }
  }
  back() {
    this.message
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.addSubService(true);
          this.form.controls['subServiceDesc'].reset();
        }
      });
  }
  confirmMessage: any;
  deleteSubService(subserviceID: any, flag: any) {
    const obj = {
      subServiceID: subserviceID,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.message
      .confirm('Confirm', 'Are you sure want to ' + this.confirmMessage + '?')
      .subscribe(
        (res) => {
          if (res) {
            this.sub_service.deleteSubService(obj).subscribe((response) => {
              this.deletedSuccessHandler(response);
            });
          }
        },
        (err) => {
          console.log(err, 'error response');
          //  this.message.alert(err, 'error');
        },
      );
  }
  clearFields() {
    this.subServiceDesc = '';
    jQuery('#form2').trigger('reset');
    if (this.state) {
      this.getExistingSubService(this.state.providerServiceMapID);
    } else {
      this.getExistingSubService(this.states[0].providerServiceMapID);
    }
  }
  deletedSuccessHandler(res: any) {
    this.message.alert(this.confirmMessage + 'd successfully', 'success');
    if (this.state) {
      this.getExistingOnSearch(this.state.providerServiceMapID);
    } else {
      this.getExistingOnSearch(this.states[0].providerServiceMapID);
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
      this.filtereddata.paginator = this.paginator;
    } else {
      this.filtereddata.data = [];
      this.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'subServiceName') {
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
