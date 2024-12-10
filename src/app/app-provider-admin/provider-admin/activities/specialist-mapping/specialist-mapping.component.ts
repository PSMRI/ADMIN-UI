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
import { FormBuilder } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SpecialistMappingService } from '../services/specialist-mapping.service';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-specialist-mapping',
  templateUrl: './specialist-mapping.component.html',
  styleUrls: ['./specialist-mapping.component.css'],
})
export class SpecialistMappingComponent implements OnInit {
  // [x: string]: any;
  // @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  // // dataSource = new MatTableDataSource<any>();
  // filteredspecializationList = new MatTableDataSource<any>();
  displayedColumns = ['SNo', 'UserName', 'specializationName', 'action'];

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredspecializationList = new MatTableDataSource<any>();
  setDataSourceAttributes() {
    this.filteredspecializationList.paginator = this.paginator;
  }

  serviceProviderID: any;
  uname: any;
  screenName = 'TC Specialist';

  tableMode = false;
  creationMode = false;

  specializationList: any;
  // filteredspecializationList: any;

  alreadyExist = false;
  bufferArray: any = [];
  services_array: any = [];

  specializations: any;
  users: any;
  filterUsers: any;

  userSelected: any;
  specializationSelected: any;

  constructor(
    public alertService: ConfirmationDialogsService,
    private fb: FormBuilder,
    public providerAdminRoleService: ProviderAdminRoleService,
    // private procedureMasterServiceService: ProcedureMasterServiceService,
    // public stateandservices: ServicePointMasterService,
    private specialistMappingService: SpecialistMappingService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.initiateTable();
    this.getSpecializationsList();
    this.getUsersList();
    console.log(this.specializations, this.users, 'called');
  }
  /**
   * Initiate Form
   */
  initiateTable() {
    // provide service provider ID, (As of now hardcoded, but to be fetched from login response)
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.uname = this.sessionstorage.getItem('uname');

    this.specializationList = [];
    this.filteredspecializationList.data = [];
    this.getAvailableMapping();
  }

  getSpecializationsList() {
    this.specialistMappingService
      .getSpecializationList()
      .subscribe((res: any) => (this.specializations = res.data));
  }

  getUsersList() {
    this.specialistMappingService
      .getDoctorList(this.serviceProviderID, this.screenName)
      .subscribe((res: any) => {
        console.log(res);
        this.users = res.data;
      });
  }

  getAvailableMapping() {
    this.specialistMappingService
      .getCurrentMappings(this.serviceProviderID)
      .subscribe((res: any) => {
        console.log(res, 'current mappings');
        this.specializationList = this.successhandeler(res.data);
        this.filteredspecializationList.data = this.successhandeler(res.data);
        console.log(
          ' this.filteredspecializationList.data',
          this.filteredspecializationList.data,
        );
        this.tableMode = true;
      });
  }

  activateMapping(id: any, obj: any, val: any) {
    if (!obj.specializationDeleted && !obj.userDeleted) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            this.specialistMappingService
              .toggleMapping(id, val, this.uname)
              .subscribe((res) => {
                if (res) {
                  this.filteredspecializationList.data[obj].deleted = val;
                  this.setChangeMainList(id, val);
                  if (!val) {
                    this.alertService.alert(
                      'Activated successfully',
                      'success',
                    );
                  }
                }
              });
          }
        });
    } else {
      if (obj.specializationDeleted) {
        this.alertService.alert('Specialization is not Active');
      } else {
        this.alertService.alert('User is not Active.');
      }
    }
  }
  deActivateMapping(id: any, obj: any, val: any) {
    this.alertService
      .confirm('confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response) => {
        if (response) {
          this.specialistMappingService
            .toggleMapping(id, val, this.uname)
            .subscribe((res) => {
              if (res) {
                this.filteredspecializationList.data[obj].deleted = val;
                this.setChangeMainList(id, val);
                if (val) {
                  this.alertService.alert(
                    'Deactivated successfully',
                    'success',
                  );
                }
              }
            });
        }
      });
  }

  setChangeMainList(id: any, val: any) {
    this.specializationList.map((element: any) => {
      if (element.userSpecializationMapID === id) {
        element.deleted = val;
      }
    });
    console.log(this.specializationList);
  }

  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showTable();
        }
      });
  }
  showTable() {
    this.clearForm();
    this.tableMode = true;
    this.creationMode = false;
  }

  clearForm() {
    this.userSelected = null;
    this.specializationSelected = null;
  }
  showForm() {
    this.clearForm();
    this.filterList();
    this.tableMode = false;
    this.creationMode = true;
  }

  filterList() {
    console.log(this.filterUsers);
  }

  proceed() {
    const exists = this.checkExists();

    if (exists) {
      this.alertService.alert('Already exists');
    } else {
      const apiObj = [
        {
          specializationID: this.specializationSelected,
          userID: this.userSelected,
          createdBy: this.uname,
          deleted: false,
        },
      ];
      this.specialistMappingService
        .saveMappings(apiObj)
        .subscribe((res: any) => {
          this.alertService.alert('Mapping saved successfully', 'success');
          this.getAvailableMapping();
          this.showTable();
        });
    }
  }

  checkExists() {
    let exists = false;
    console.log(this.specializationList, 'listed');
    this.specializationList.map((element: any) => {
      if (
        element.userID.toString() === this.userSelected &&
        element.specializationID === this.specializationSelected
      ) {
        exists = true;
      }
    });
    return exists;
  }

  successhandeler(response: any) {
    return response;
  }

  filterSpecializationList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredspecializationList.data = this.specializationList;
    } else {
      this.filteredspecializationList.data = [];
      this.specializationList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'userName' || key === 'specializationName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredspecializationList.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}
