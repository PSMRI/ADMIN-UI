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
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { ProcedureMasterServiceService } from '../../inventory/services/procedure-master-service.service';
import { ServicePointMasterService } from '../services/service-point-master-services.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-procedure-master',
  templateUrl: './procedure-master.component.html',
  styleUrls: ['./procedure-master.component.css'],
})
export class ProcedureMasterComponent implements OnInit {
  alreadyExistcount!: boolean;
  state: any;
  service: any;
  serviceline: any;
  states: any;
  services: any;
  disableSelection = false;

  editMode = false;
  serviceProviderID: any;

  STATE_ID: any;
  SERVICE_ID: any;
  providerServiceMapID: any;
  unfilled = false;
  editProcedure: any;
  procedureForm!: FormGroup;
  tableMode = false;
  saveEditMode = false;
  alreadyExist = false;
  bufferArray: any = [];
  services_array: any = [];
  userID: any;
  provider_states: any = [];
  searchStateID: any;
  iotProcedurearray: any = [];

  displayedColumns = [
    'sno',
    'procedureName',
    'procedureType',
    'gender',
    'procedureDesc',
    'edit',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredprocedureList = new MatTableDataSource<any>();
  procedureList = new MatTableDataSource<any>();
  setDataSourceAttributes() {
    this.filteredprocedureList.paginator = this.paginator;
  }

  constructor(
    private commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    private fb: FormBuilder,
    public providerAdminRoleService: ProviderAdminRoleService,
    private procedureMasterServiceService: ProcedureMasterServiceService,
    public stateandservices: ServicePointMasterService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.states = [];
    this.services = [];
  }

  ngOnInit() {
    this.initiateForm();
    console.log(this.procedureForm);
  }
  /**
   * Initiate Form
   */
  initiateForm() {
    this.procedureForm = this.initProcedureForm();
    // By Default, it'll be set as enabled
    this.procedureForm.patchValue({
      disable: false,
    });

    // provide service provider ID, (As of now hardcoded, but to be fetched from login response)
    this.serviceProviderID = this.sessionstorage
      .getItem('service_providerID')
      ?.toString();
    this.userID = this.commonDataService.uid;
    this.getProviderServices();
    this.getDiagnosticProcedure();
  }
  getProviderServices() {
    this.stateandservices.getServices(this.userID).subscribe(
      (response: any) => {
        // this.services_array = response.data;
        this.services_array = response.data.filter(function (item: any) {
          console.log('item', item);
          if (
            item.serviceID === 4 ||
            item.serviceID === 9 ||
            item.serviceID === 2
          )
            return item;
        });
      },
      (err) => {},
    );
  }
  getStates(serviceID: any) {
    this.filteredprocedureList.data = [];
    this.stateandservices.getStates(this.userID, serviceID, false).subscribe(
      (response) => this.getStatesSuccessHandeler(response, false),
      (err) => {},
    );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response, 'Provider States');
      this.provider_states = response.data;
      // this.createButton = false;
    }
  }

  initProcedureForm(): FormGroup {
    return this.fb.group({
      id: null,
      name: [null, Validators.required],
      type: null,
      description: null,
      gender: null,
      male: null,
      female: null,
      disable: null,
      iotProcedureID: null,
      isMandatory: null,
      isCalibration: null,
    });
  }

  /**
   * Get Details of Procedures available for this Service PRovider
   */
  getAvailableProcedures() {
    this.procedureMasterServiceService
      .getCurrentProcedures(this.searchStateID.providerServiceMapID)
      .subscribe((res: any) => {
        this.procedureList.data = this.successhandeler(res.data);
        this.filteredprocedureList.data = this.successhandeler(res.data);
        this.tableMode = true;
      });
  }
  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showTable();
          this.alreadyExist = false;
          this.resetProcedure();
        }
      });
  }
  showTable() {
    this.tableMode = true;
    this.saveEditMode = false;
    this.disableSelection = false;
  }
  showForm() {
    this.editMode = false;
    this.tableMode = false;
    this.saveEditMode = true;
    this.disableSelection = true;
  }
  procedureUnique() {
    this.alreadyExist = false;
    console.log('filteredprocedureList', this.filteredprocedureList);
    let count = 0;
    for (let a = 0; a < this.filteredprocedureList.data.length; a++) {
      if (
        this.filteredprocedureList.data[a].procedureName === this.name &&
        !this.filteredprocedureList.data[a].deleted
      ) {
        count = count + 1;
        console.log('count', count);

        if (count > 0) {
          this.alreadyExist = true;
        }
      }
    }
  }
  procedureUnique_actvate(name: any) {
    console.log('name', name);
    this.alreadyExistcount = false;
    console.log('filteredprocedureList', this.filteredprocedureList);
    let count = 0;
    for (let a = 0; a < this.filteredprocedureList.data.length; a++) {
      if (
        this.filteredprocedureList.data[a].procedureName === name &&
        !this.filteredprocedureList.data[a].deleted
      ) {
        count = count + 1;
        console.log('count', count);

        if (count >= 1) {
          this.alreadyExistcount = true;
        }
      }
    }
  }

  get name() {
    return this.procedureForm.controls['name'].value;
  }
  saveProcedure() {
    const apiObject: any = this.objectManipulate();
    let count = 0;
    console.log('here to check available', apiObject);
    for (let a = 0; a < this.filteredprocedureList.data.length; a++) {
      if (
        this.filteredprocedureList.data[a].procedureName ===
          apiObject['procedureName'] &&
        !this.filteredprocedureList.data[a].deleted
      ) {
        count = count + 1;
        console.log('here to check available', count);
      }
    }
    if (count === 0) {
      console.log('here to check available', apiObject);

      if (apiObject) {
        delete apiObject['modifiedBy'];
        delete apiObject['procedureID'];
        console.log('here to check available', apiObject);

        this.procedureMasterServiceService
          .postProcedureData(apiObject)
          .subscribe((res) => {
            this.procedureList.data.unshift(res);
            this.procedureForm.reset();
            this.alertService.alert('Saved successfully', 'success');
            this.getAvailableProcedures();
            this.showTable();
          });
      }
    } else {
      this.alertService.alert('Already exists');
    }
  }

  /**
   * Update Changes for The Procedure
   */
  updateProcedure() {
    const apiObject: any = this.objectManipulate();
    if (apiObject) {
      delete apiObject['createdBy'];
      apiObject['procedureID'] = this.editMode;

      this.procedureMasterServiceService
        .updateProcedureData(apiObject)
        .subscribe((res) => {
          this.updateList(res);
          this.procedureForm.reset();
          this.editMode = false;
          this.alertService.alert('Updated successfully', 'success');
          this.getAvailableProcedures();
          this.showTable();
        });
    }
  }

  resetProcedure() {
    this.procedureForm.reset();
    this.editMode = false;
  }

  /**
   * Manipulate Form Object to as per API Need
   */
  objectManipulate() {
    const obj = Object.assign({}, this.procedureForm.value);

    console.log('this.procedureForm.value', this.procedureForm.value, obj);

    if (!obj.name || !obj.type || !obj.description || !obj.gender) {
      this.unfilled = true;
      return false;
    } else {
      this.unfilled = false;

      let apiObject = {};
      console.log(obj);
      apiObject = {
        procedureID: '',
        modifiedBy: this.commonDataService.uname,
        procedureName:
          obj.name !== undefined && obj.name !== undefined
            ? obj.name.trim()
            : null,
        procedureType: obj.type,
        procedureDesc: obj.description,
        createdBy: this.commonDataService.uname,
        providerServiceMapID: this.searchStateID.providerServiceMapID,
        gender: obj.gender,
        iotProcedureID: obj.iotProcedureID,
        isMandatory: obj.isMandatory,
        isCalibration: obj.isCalibration,
      };

      // console.log(obj.male, 'obj');
      // if (obj.gender) {
      //   apiObject = {
      //     procedureID: '',
      //     modifiedBy: this.commonDataService.uname,
      //     procedureName: obj.name,
      //     procedureType: obj.type,
      //     procedureDesc: obj.description,
      //     createdBy: this.commonDataService.uname,
      //     providerServiceMapID: this.searchStateID.providerServiceMapID,
      //     gender: 'Unisex'
      //   };
      // } else if (obj.male && !obj.female) {
      //   apiObject = {
      //     procedureID: '',
      //     modifiedBy: this.commonDataService.uname,
      //     procedureName: obj.name,
      //     procedureType: obj.type,
      //     procedureDesc: obj.description,
      //     createdBy: this.commonDataService.uname,
      //     providerServiceMapID: this.searchStateID.providerServiceMapID,
      //     gender: 'Male'
      //   };
      // } else if (!obj.male && obj.female) {
      //   apiObject = {
      //     procedureID: '',
      //     modifiedBy: this.commonDataService.uname,
      //     procedureName: obj.name,
      //     procedureType: obj.type,
      //     procedureDesc: obj.description,
      //     createdBy: this.commonDataService.uname,
      //     providerServiceMapID: this.searchStateID.providerServiceMapID,
      //     gender: 'Female'
      //   };
      // }
      console.log(JSON.stringify(apiObject, null, 3), 'apiObject');
      return apiObject;
    }
  }

  setProviderServiceMapID() {
    this.commonDataService.provider_serviceMapID =
      this.searchStateID.ProviderServiceMapID;
    this.providerServiceMapID = this.searchStateID.ProviderServiceMapID;

    console.log('psmid', this.searchStateID.ProviderServiceMapID);
    console.log(this.service);
    this.getAvailableProcedures();
  }

  // For State List
  successhandeler(response: any) {
    return response;
  }

  /**
   *Enable/ Disable Procedure
   *
   */
  toggleProcedure(
    procedureID: any,
    index: any,
    toggle: any,
    procedureName: any,
  ) {
    const activateProcdure = false;
    this.procedureUnique_actvate(procedureName);
    if (this.alreadyExistcount) {
      this.alertService
        .confirm(
          'Confirm',
          'Duplicate procedure already exists do you want to enable it?',
        )
        .subscribe((response) => {
          if (response) {
            this.activate(procedureID, index, toggle);
          }
        });
    } else {
      this.activate(procedureID, index, toggle);
    }
  }
  activate(procedureID: any, index: any, toggle: any) {
    let text;
    if (!toggle) text = 'Are you sure you want to Activate?';
    else text = 'Are you sure you want to Deactivate?';

    this.alertService.confirm('Confirm', text).subscribe((response) => {
      if (response) {
        console.log(procedureID, index, 'index');
        this.procedureMasterServiceService
          .toggleProcedure({ procedureID: procedureID, deleted: toggle })
          .subscribe((res) => {
            console.log(res, 'changed');
            if (res) {
              if (!toggle)
                this.alertService.alert('Activated successfully', 'success');
              else
                this.alertService.alert('Deactivated successfully', 'success');
              this.updateList(res);
              // this.procedureList[index] = res;
            }
          });
      }
    });
  }
  deactivatetoggleProcedure(procedureID: any, index: any, toggle: any) {
    let text;
    if (!toggle) text = 'Are you sure you want to Activate?';
    else text = 'Are you sure you want to Deactivate?';
    this.alertService.confirm('Confirm', text).subscribe((response) => {
      if (response) {
        console.log(procedureID, index, 'index');
        this.procedureMasterServiceService
          .toggleProcedure({ procedureID: procedureID, deleted: toggle })
          .subscribe((res) => {
            console.log(res, 'changed');
            if (res) {
              if (!toggle)
                this.alertService.alert('Activated successfully', 'success');
              else
                this.alertService.alert('Deactivated successfully', 'success');
              this.updateList(res);
              // this.procedureList[index] = res;
            }
          });
      }
    });
  }

  updateList(res: any) {
    this.procedureList.data.forEach((element: any, i: any) => {
      console.log(element, 'elem', res, 'res');
      if (element.procedureID === res.procedureID) {
        this.procedureList.data[i] = res;
      }
    });

    this.filteredprocedureList.data.forEach((element: any, i: any) => {
      console.log(element, 'elem', res, 'res');
      if (element.procedureID === res.procedureID) {
        this.filteredprocedureList.data[i] = res;
      }
    });
  }

  filterprocedureList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredprocedureList.data = this.procedureList.data;
    } else {
      this.filteredprocedureList.data = [];
      this.procedureList.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'procedureName' || key === 'procedureType') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredprocedureList.data.push(item);
              break;
            }
          }
        }
      });
    }
  }

  configProcedure(item: any, index: any) {
    this.editMode = true;
    let male: any;
    let female: any;
    let unisex: any;
    if (item.gender === 'unisex') {
      unisex = 'unisex';
    } else if (item.gender === 'male') {
      male = 'male';
    } else if (item.gender === 'female') {
      female = 'female';
    }
    this.editMode = index >= 0 ? item.procedureID : false; // setting edit mode on
    console.log(JSON.stringify(item, null, 4));
    this.procedureForm.patchValue({
      id: item.procedureID,
      name:
        item.procedureName !== undefined && item.procedureName !== null
          ? item.procedureName.trim()
          : null,
      type: item.procedureType,
      description: item.procedureDesc,
      gender: item.gender,
      disable: item.deleted,
      iotProcedureID: item.iotProcedureID,
      isMandatory: item.isMandatory,
      isCalibration: item.isCalibration,
    });
  }

  // This is called for IOT
  getDiagnosticProcedure() {
    this.procedureMasterServiceService.getDiagnosticProcedure().subscribe(
      (response: any) => {
        this.iotProcedurearray = response.data;
      },
      (err) => {},
    );
  }
}
