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
import { HostListener } from '@angular/core';
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { BlockProvider } from 'src/app/core/services/adminServices/AdminServiceProvider/block-provider-service.service';
declare let jQuery: any;
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-block-service-provider',
  templateUrl: './block-service-provider.component.html',
  styleUrls: ['./block-service-provider.component.css'],
})
export class BlockServiceProviderComponent implements OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  // dataSource = new MatTableDataSource<any>();
  filtereddata = new MatTableDataSource<any>();

  // filtereddata: any = [];
  data: any = [];
  showBlock = false;
  showUnblock = false;
  status_array: any = [];
  service_provider_array: any = [];
  states_array: any = [];
  services_array: any = [];
  stateProviderArray: any = [];
  pastValue: any = [];
  userEnteredWord: any;

  // ngModels

  service_provider: any;
  state: any;
  serviceline: any;

  // flags
  showTable: boolean;
  case_one: boolean;
  case_two: boolean;
  case_three: boolean;
  case_four: boolean;
  show_card = false;
  isNational = false;
  status: any;
  reason: any;

  @ViewChild('statusSettingFields')
  _statusSettingFields!: NgForm;

  constructor(
    public block_provider: BlockProvider,
    private message: ConfirmationDialogsService,
  ) {
    //this.service_provider = '';
    // this.state = '';
    // this.serviceline = '';
    this.showTable = false;

    this.case_one = false;
    this.case_two = false;
    this.case_three = false;
    this.case_four = false;
  }

  ngOnInit() {
    this.block_provider.getAllProviders().subscribe(
      (response) => this.getAllProvidersSuccesshandeler(response),
      (err) => {
        console.log('Error', err);
        // this.message.alert(err, 'error');
      },
    );
    this.getAllStatusList();
  }

  setIsNationalFlag(value: any) {
    if (value) {
      this.state = '';
    }
    this.isNational = value;
    this.getStatus(this.service_provider, this.state, this.serviceline);
    this.getstatesBasedOnService(this.service_provider, this.serviceline);
  }
  getstatesBasedOnService(provider: any, serviceID: any) {
    const data = {
      serviceProviderID: provider,
      serviceID: serviceID,
    };
    this.block_provider.getStatesInServices(data).subscribe(
      (response: any) => {
        this.getStatesSuccesshandeler_1(response);
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }
  getAllStatusList() {
    this.block_provider.getAllStatus().subscribe(
      (response: any) => this.getSuccess(response),
      (err) => {
        console.log('Error', err);
        //this.message.alert(err, 'error');
      },
    );
  }
  getSuccess(response: any) {
    console.log('status', response.data);
    this.status_array = response.data;
    let index = 0;
    for (let i = 0; i < this.status_array.length; i++) {
      if (this.status_array[i] === 'New') {
        index = i;
        break;
      }
    }

    this.status_array.splice(index, 1);
  }

  selectKeyPress($event: any) {
    let firstWordMatchingStatus = 0;
    if ($event.keyCode !== 123) {
      // To elemenate '{' which key is 123 from the word
      const char = String.fromCharCode($event.keyCode);
      if ($event.keyCode === 8) {
        // Back space key logic
        if (this.userEnteredWord !== undefined)
          this.userEnteredWord = this.userEnteredWord.slice(0, -1);
      } // formation of a word from user entered keys
      else {
        this.userEnteredWord === undefined
          ? (this.userEnteredWord = char)
          : (this.userEnteredWord += char);
      }
      if (/[a-zA-Z]/.test(this.userEnteredWord)) {
        // allowing only alphabets from keys
        for (let i = 0; i < this.service_provider_array.length; i++) {
          if (
            this.service_provider_array[i].serviceProviderName
              .toLowerCase()
              .startsWith(String(this.userEnteredWord.toLowerCase()))
          ) {
            if (firstWordMatchingStatus === 0) {
              firstWordMatchingStatus = 1;
              this.stateProviderArray = [];
            }
            this.stateProviderArray.push(this.service_provider_array[i]); // loading matched usernames
          }
        }
        if (firstWordMatchingStatus === 0) {
          this.loadingValues(); // clearing user the user entered key and reloading the array from DB
        }
      } else {
        this.loadingValues();
      }
    }
  }
  loadingValues() {
    this.userEnteredWord = undefined;
    this.stateProviderArray = Object.assign([], this.service_provider_array);
  }

  //** end **/

  getStates(serviceProviderID: any) {
    this.block_provider.getStates(serviceProviderID).subscribe(
      (response: any) => {
        this.getStatesSuccesshandeler(response);
        this.getAllServicesOfProvider(serviceProviderID);
        this.getStatus(this.service_provider, this.state, this.serviceline);
        this.loadingValues();
      },
      (err) => {
        console.log('Error', err);
        //this.message.alert(err, 'error');
      },
    );
  }
  getStates_serviceline(serviceProviderID: any) {
    this.block_provider.getStates(serviceProviderID).subscribe(
      (response: any) => {
        this.getStatesSuccesshandeler_1(response);
        //  this.getAllServicesOfProvider(serviceProviderID);
        this.getStatus(this.service_provider, this.state, this.serviceline);
        this.loadingValues();
      },
      (err) => {
        console.log('Error', err);
        //this.message.alert(err, 'error');
      },
    );
  }

  getAllServicesOfProvider(serviceProviderID: any) {
    this.block_provider.getServicesOfProvider(serviceProviderID).subscribe(
      (response: any) => this.getAllServicesOfProviderSuccesshandeler(response),
      (err) => {
        console.log('Error', err);
        //this.message.alert(err, 'error');
      },
    );
  }

  getServicesInState(serviceProviderID: any, stateID: any) {
    this.getStatus(this.service_provider, this.state, this.serviceline);
    // this.block_provider.getServicesInState(serviceProviderID, stateID)
    //   .subscribe(response => this.getServicesInStatesSuccesshandeler(response));
  }
  // success handelers
  reset() {
    this.state = '';
    this.serviceline = '';
    this.states_array = [];
    this.services_array = [];
  }
  resetForm() {
    this.message.confirm('Confirm', 'Are you sure want to clear?').subscribe(
      (response) => {
        if (response) {
          jQuery('#myForm').trigger('reset');
          this.data = [];
          this.filtereddata.data = [];
          this.states_array = [];
          this.services_array = [];
          this.showTable = false;
          this.case_one = false;
          this.case_two = false;
          this.case_three = false;
          this.case_four = false;
        }
      },
      (err) => {},
    );
  }

  getAllProvidersSuccesshandeler(response: any) {
    this.service_provider_array = response.data;
    this.stateProviderArray = this.service_provider_array;
  }

  getStatesSuccesshandeler(response: any) {
    this.reset();
    this.states_array = response.data;
    this.stateProviderArray = this.service_provider_array;
  }
  getStatesSuccesshandeler_1(response: any) {
    // this.reset();
    this.states_array = response.data;
    this.stateProviderArray = this.service_provider_array;
  }

  getAllServicesOfProviderSuccesshandeler(response: any) {
    this.serviceline = '';
    this.isNational = false;
    this.services_array = response.data;
    this.getStatus(this.service_provider, this.state, this.serviceline);
  }

  getServicesInStatesSuccesshandeler(response: any) {
    this.serviceline = '';
    this.services_array = response.data;
    this.getStatus(this.service_provider, this.state, this.serviceline);
  }

  // Get STATUS function

  getStatus(service_provider: any, state: any, serviceline: any) {
    this.showTable = true;
    this.show_card = true;

    if (
      service_provider !== '' &&
      service_provider !== null &&
      (state === '' || state === undefined) &&
      (serviceline === '' || serviceline === undefined)
    ) {
      this.case_one = true;
      this.case_two = false;
      this.case_three = false;
      this.case_four = false;

      this.getStatusOnProviderLevel(service_provider);
    }
    if (
      service_provider !== '' &&
      service_provider !== null &&
      state !== '' &&
      state !== null &&
      (serviceline === '' || serviceline === undefined)
    ) {
      this.case_one = false;
      this.case_two = true;
      this.case_three = false;
      this.case_four = false;

      this.getStatusOnProviderStateLevel(service_provider, state);
    }
    if (
      service_provider !== '' &&
      service_provider !== null &&
      state === '' &&
      serviceline !== '' &&
      serviceline !== null
    ) {
      this.case_one = false;
      this.case_two = false;
      this.case_three = true;
      this.case_four = false;

      this.getStatusOnProviderServiceLevel(service_provider, serviceline);
    }
    if (
      service_provider !== '' &&
      state !== '' &&
      serviceline !== '' &&
      service_provider !== null &&
      state !== null &&
      serviceline !== null
    ) {
      this.case_one = false;
      this.case_two = false;
      this.case_three = false;
      this.case_four = true;

      this.getStatusOnProviderStateServiceLevel(
        service_provider,
        state,
        serviceline,
      );
    }
  }

  getStatusOnProviderLevel(service_provider: any) {
    this.block_provider.getProviderLevelStatus(service_provider).subscribe(
      (response: any) => this.successhandeler1(response),
      (err) => {
        console.log('Error', err);
        //this.message.alert(err, 'error');
      },
    );
  }

  getStatusOnProviderServiceLevel(service_provider: any, serviceline: any) {
    this.block_provider
      .getProvider_ServiceLineLevelStatus(service_provider, serviceline)
      .subscribe(
        (response: any) => this.successhandeler2(response),
        (err) => {
          console.log('Error', err);
          //this.message.alert(err, 'error');
        },
      );
  }

  getStatusOnProviderStateLevel(service_provider: any, state: any) {
    this.block_provider
      .getProvider_StateLevelStatus(service_provider, state)
      .subscribe(
        (response: any) => this.successhandeler3(response),
        (err) => {
          console.log('Error', err);
          // this.message.alert(err, 'error');
        },
      );
  }

  getStatusOnProviderStateServiceLevel(
    service_provider: any,
    state: any,
    serviceline: any,
  ) {
    this.block_provider
      .getProvider_State_ServiceLineLevelStatus(
        service_provider,
        state,
        serviceline,
      )
      .subscribe(
        (response: any) => this.successhandeler4(response),
        (err) => {
          console.log('Error', err);
          //this.message.alert(err, 'error');
        },
      );
  }

  successhandeler1(response: any) {
    // this._statusSettingFields.reset();
    console.log(response.data, 'RESPONSE');
    // this.states_array = response;
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.filtereddata.paginator = this.paginator;
  }

  successhandeler2(response: any) {
    // this._statusSettingFields.reset();
    console.log(response.data, 'RESPONSE');
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.filtereddata.paginator = this.paginator;
  }

  successhandeler3(response: any) {
    //  this._statusSettingFields.reset();
    console.log(response.data, 'RESPONSE');
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.filtereddata.paginator = this.paginator;
  }

  successhandeler4(response: any) {
    // this._statusSettingFields.reset();

    console.log(response.data, 'RESPONSE');
    this.data = response.data;
    this.filtereddata.data = response.data;
    this.filtereddata.paginator = this.paginator;
  }

  // blocking

  blockProvider() {
    const serviceProviderID = this.filtereddata.data[0].serviceProviderID;
    const statusID = this.status;
    const reason = this.reason; // needs to be 3, but as of now being sent as 2 for checking as no val in table
    this.block_provider
      .block_unblock_provider(serviceProviderID, statusID, reason)
      .subscribe(
        (response: any) =>
          this.block_unblock_providerSuccessHandeler(
            response,
            serviceProviderID,
          ),
        (err) => {
          console.log('Error', err);
          // this.message.alert(err, 'error');
        },
      );
  }

  block_unblock_providerSuccessHandeler(response: any, serviceProviderID: any) {
    console.log('b u provider success handeler', response.data);
    this.message.alert('Updated successfully', 'success');
    this.getStatusOnProviderLevel(response.data.serviceProviderID);
    this.getStates(serviceProviderID);
  }

  blockState() {
    const serviceProviderID = this.filtereddata.data[0].serviceProviderID;
    const statusID = this.status;
    const stateID = this.filtereddata.data[0].stateID;
    const reason = this.reason;
    this.block_provider
      .block_unblock_state(serviceProviderID, stateID, statusID, reason)
      .subscribe(
        (response) => this.block_unblock_stateSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          //this.message.alert(err, 'error');
        },
      );
  }

  block_unblock_stateSuccessHandeler(response: any) {
    console.log('b u state success handeler', response);
    this.message.alert('Updated successfully', 'success');
    this.getStatusOnProviderStateLevel(
      response[0].serviceProviderID,
      response[0].stateID,
    );
  }

  blockService() {
    const serviceProviderID = this.filtereddata.data[0].serviceProviderID;
    const statusID = this.status;
    const serviceID = this.filtereddata.data[0].serviceID;
    const reason = this.reason;
    this.block_provider
      .block_unblock_serviceline(serviceProviderID, serviceID, statusID, reason)
      .subscribe(
        (response) =>
          this.block_unblock_serviceSuccessHandeler(
            response,
            serviceProviderID,
          ),
        (err) => {
          console.log('Error', err);
          //this.message.alert(err, 'error');
        },
      );
  }

  block_unblock_serviceSuccessHandeler(response: any, serviceProviderID: any) {
    console.log('b u service success handeler', response);
    this.message.alert('Updated successfully', 'success');
    this.getStatusOnProviderServiceLevel(
      response[0].serviceProviderID,
      response[0].serviceID,
    );
    this.getstatesBasedOnService(serviceProviderID, this.serviceline);
  }

  blockServiceOfState() {
    const serviceProviderID = this.filtereddata.data[0].serviceProviderID;
    const serviceID = this.filtereddata.data[0].serviceID;
    const stateID = this.filtereddata.data[0].stateID;
    const statusID = this.status;
    const reason = this.reason;
    this.block_provider
      .block_unblock_serviceOfState(
        serviceProviderID,
        stateID,
        serviceID,
        statusID,
        reason,
      )
      .subscribe(
        (response: any) =>
          this.block_unblock_serviceOfStateSuccessHandeler(response),
        (err) => {
          console.log('Error', err);
          //this.message.alert(err, 'error');
        },
      );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
    } else {
      this.filtereddata.data = [];
      this.data.forEach((item: any) => {
        for (const key in item) {
          const value: string = '' + item[key];
          if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
            this.filtereddata.data.push(item);
            break;
          }
        }
      });
    }
  }
  block_unblock_serviceOfStateSuccessHandeler(response: any) {
    console.log('b u service of state success handeler', response.data);
    this.message.alert('Updated successfully', 'success');
    this.getStatusOnProviderStateServiceLevel(
      response.data.serviceProviderID,
      response.data.stateID,
      response.data.serviceID,
    );
  }
}
