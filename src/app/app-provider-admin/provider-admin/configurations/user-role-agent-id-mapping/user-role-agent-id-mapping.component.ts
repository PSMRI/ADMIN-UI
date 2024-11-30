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
import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserRoleAgentID_MappingService } from '../services/user-role-agentID-mapping-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-user-role-agent-id-mapping',
  templateUrl: './user-role-agent-id-mapping.component.html',
  styleUrls: ['./user-role-agent-id-mapping.component.css'],
})
export class UserRoleAgentIDMappingComponent implements OnInit {
  /*ngModels*/
  userID: any;
  serviceProviderID: any;
  state: any;
  service: any;
  role: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  roles: any = [];

  searchResultArray: any = [];

  /*flags*/
  showTableFlag = false;
  isNational = false;
  displayedColumns = ['sno', 'employeeName', 'userName', 'agentID', 'action'];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResultArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResultArray.paginator = this.paginator;
  }

  @ViewChild('searchCriteria') searchCriteria!: NgForm;
  constructor(
    public _UserRoleAgentID_MappingService: UserRoleAgentID_MappingService,
    public commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    public dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServices(this.userID);
  }

  setIsNational(value: any) {
    this.isNational = value;
  }

  getStates(serviceID: any, isNational: any) {
    this._UserRoleAgentID_MappingService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, isNational),
        (err) => console.log(err, 'error'),
      );
  }

  clear() {
    this.state = '';
    this.service = '';
    this.role = '';

    this.states = [];
    this.roles = [];

    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
    this.showTableFlag = false;
  }

  getStatesSuccessHandeler(response: any, isNational: any) {
    this.searchCriteria.controls['state'].reset();
    this.searchCriteria.controls['role'].reset();
    this.states = [];
    this.roles = [];
    console.log('STATE', response);
    this.states = response.data;

    if (isNational) {
      this.getRoles(this.states[0].providerServiceMapID);
    }
  }

  getServices(userID: any) {
    this._UserRoleAgentID_MappingService.getServices(userID).subscribe(
      (response: any) => this.getServicesSuccessHandeler(response),
      (err) => console.log(err, 'error'),
    );
  }

  getServicesSuccessHandeler(response: any) {
    console.log('SERVICES', response);
    // this.services = response.data;
    this.services = response.data.filter(function (item: any) {
      console.log('item', item);
      if (
        item.serviceID === 1 ||
        item.serviceID === 3 ||
        item.serviceID === 6 ||
        item.serviceID === 10
      )
        return item;
    });
  }

  getRoles(providerServiceMapID: any) {
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
    this.searchCriteria.controls['role'].reset();
    this._UserRoleAgentID_MappingService
      .getRoles(providerServiceMapID)
      .subscribe(
        (response: any) => this.rolesSuccesshandeler(response),
        (err) => console.log(err, 'error'),
      );
  }

  rolesSuccesshandeler(response: any) {
    if (response.data.length === 0) {
      console.log('No Roles Found');
    }
    this.roles = response.data.filter(function (obj: any) {
      return obj.deleted === false;
    });
    console.log(response, 'roles of provider for that state');
  }

  searchEmployee(
    state: any,
    service: any,
    role: any,
    empname: any,
    empid: any,
  ) {
    console.log(
      state + '--' + service + '--' + role + '--' + empname + '--' + empid,
    );
    const request_obj = {
      serviceProviderID: this.serviceProviderID,
      pSMStateID: state,
      serviceID: service,
      roleID: role,
      userName: empname,
      userID: empid,
    };
    if (request_obj.pSMStateID === undefined || request_obj.pSMStateID === '') {
      request_obj.pSMStateID = null;
    }
    if (request_obj.serviceID === undefined || request_obj.pSMStateID === '') {
      request_obj.serviceID = null;
    }
    if (request_obj.roleID === undefined || request_obj.pSMStateID === '') {
      request_obj.roleID = null;
    }
    if (request_obj.userName === undefined) {
      request_obj.userName = null;
    }
    if (request_obj.userID === undefined) {
      request_obj.userID = null;
    }
    console.log(request_obj, 'reqOBJ');
    this._UserRoleAgentID_MappingService.getEmployees(request_obj).subscribe(
      (response: any) => this.getEmployeesSuccessHandeler(response),
      (err) => console.log(err, 'error'),
    );
  }

  getEmployeesSuccessHandeler(response: any) {
    console.log(response, 'employees fetched as per condition');
    if (response) {
      this.searchResultArray = response.data.filter(function (obj: any) {
        return obj.uSRMDeleted === false && obj.roleName === 'ProviderAdmin';
      });
      this.filteredsearchResultArray.data = response.data.filter(function (
        obj: any,
      ) {
        return obj.uSRMDeleted === false && obj.roleName !== 'ProviderAdmin';
      });

      this.showTableFlag = true;
    }
  }

  openMappingModal(obj: any) {
    console.log('modal object', obj);

    const dialog_Ref = this.dialog.open(AgentIDMappingModalComponent, {
      height: '500px',
      width: '500px',
      data: obj,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.searchEmployee(
          this.state,
          this.service,
          this.role,
          undefined,
          undefined,
        );
      }
    });
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
      this.filteredsearchResultArray.paginator = this.paginator;
    } else {
      this.filteredsearchResultArray.data = [];
      this.filteredsearchResultArray.paginator = this.paginator;
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'firstName' ||
            key === 'middleName' ||
            key === 'lastName' ||
            key === 'userName' ||
            key === 'agentID'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResultArray.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-agent-id-mapping-modal',
  templateUrl: './agent-id-mapping-modal.html',
})
export class AgentIDMappingModalComponent implements OnInit {
  filteredsearchResultArray: any;
  /*ngModels*/
  providerServiceMapID: any;
  agentPassword: any;
  usrAgentMappingID: any;

  employeeName: any;
  service: any;
  role: any;

  campaign: any;
  agentID: any;
  oldAgentID: any;

  campaigns: any = [];
  agentIDs: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public _UserRoleAgentID_MappingService: UserRoleAgentID_MappingService,
    public commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    public dialogReff: MatDialogRef<AgentIDMappingModalComponent>,
  ) {}

  ngOnInit() {
    console.log('dialog data', this.data);
    if (this.data.middleName === undefined || this.data.middleName === null) {
      this.employeeName = this.data.firstName + ' ' + this.data.lastName;
    } else {
      this.employeeName =
        this.data.firstName +
        ' ' +
        this.data.middleName +
        ' ' +
        this.data.lastName;
    }
    this.service = this.data.serviceName;
    this.role = this.data.roleName;

    this.oldAgentID = this.data.agentID;

    this.providerServiceMapID = this.data.providerServiceMapID;

    if (this.providerServiceMapID !== undefined) {
      this._UserRoleAgentID_MappingService
        .getAvailableCampaigns(this.providerServiceMapID)
        .subscribe(
          (response: any) =>
            this.getAvailableCampaignsSuccessHandeler(response),
          (err) => console.log(err, 'error'),
        );
    }
  }

  getAvailableCampaignsSuccessHandeler(response: any) {
    if (response) {
      this.campaigns = response.data;
      console.log(response);
    }
  }

  getAgentIDs(campaign_name: any) {
    this._UserRoleAgentID_MappingService
      .getAgentIDs(this.providerServiceMapID, campaign_name)
      .subscribe(
        (response: any) => this.getAgentIDsSuccessHandeler(response),
        (err) => console.log(err, 'error'),
      );
  }

  getAgentIDsSuccessHandeler(response: any) {
    if (response) {
      console.log('agentIDs', response);
      this.agentIDs = response.data;
    }
  }

  setAgentPassword_usrAgentMappingID(
    agentPassword: any,
    usrAgentMappingID: any,
  ) {
    this.agentPassword = agentPassword;
    this.usrAgentMappingID = usrAgentMappingID;
  }

  mapAgentID(agentID: any) {
    const req_array = [
      {
        uSRMappingID: this.data.uSRMappingID,
        agentID: agentID,
        agentPassword: this.agentPassword,
        usrAgentMappingID: this.usrAgentMappingID,
        isAvailable: 'false',
        oldAgentID: this.oldAgentID,
        providerServiceMapID: this.providerServiceMapID,
      },
    ];

    this._UserRoleAgentID_MappingService.mapAgentID(req_array).subscribe(
      (response: any) => this.mapAgentIDSuccessHandeler(response),
      (err) => console.log(err, 'error'),
    );
  }

  mapAgentIDSuccessHandeler(response: any) {
    if (response) {
      this.alertService.alert('Mapping saved successfully', 'success');
      this.dialogReff.close('success');
    }
  }

  /*
	SAVE req obj
	[
		{ "uSRMappingID" : 947, "agentID" : "2001", "agentPassword":"jara" },

		{ "uSRMappingID" : 948, "agentID" : "2002", "agentPassword":"hai" }
		]*/
}
