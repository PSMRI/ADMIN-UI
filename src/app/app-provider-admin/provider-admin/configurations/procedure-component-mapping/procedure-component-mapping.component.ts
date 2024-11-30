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
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ServicePointMasterService } from '../../activities/services/service-point-master-services.service';
import { ProviderAdminRoleService } from '../../activities/services/state-serviceline-role.service';
import { ProcedureComponentMappingServiceService } from '../../inventory/services/procedure-component-mapping-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-procedure-component-mapping',
  templateUrl: './procedure-component-mapping.component.html',
  styleUrls: ['./procedure-component-mapping.component.css'],
})
export class ProcedureComponentMappingComponent implements OnInit {
  filteredMappedList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  serviceline: any;
  searchStateID: any;
  provider_states: any = [];
  services_array: any = [];
  userID: any;
  state: any;
  service: any;
  tableMode = false;
  saveMode = false;

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
  selectedProcedure: any;
  selectedComponent: any;
  selectedComponentList: any = [];
  selectedProcedureDescription: any;
  selectedProcedureType: any;
  selectedComponentDescription: any;
  selectedLoincCode: any;

  procedureList: any;
  componentList: any;
  masterComponentList: any;

  mappedList: any = [];
  // filteredMappedList:any = [];
  selectedLoincComponent: any;
  displayedColumns: string[] = [
    'SNo',
    'ProcedureName',
    'Description',
    'MappedComponents',
  ];

  constructor(
    private commonDataService: dataService,
    public providerAdminRoleService: ProviderAdminRoleService,
    public alertService: ConfirmationDialogsService,
    private procedureComponentMappingServiceService: ProcedureComponentMappingServiceService,
    public stateandservices: ServicePointMasterService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.states = [];
    this.services = [];
  }

  ngOnInit() {
    this.initiateForm();
  }

  /**
   * Initiate Form
   */
  initiateForm() {
    if (this.commonDataService.service_providerID) {
      this.serviceProviderID = this.sessionstorage
        .getItem('service_providerID')
        ?.toString();
    }

    this.userID = this.commonDataService.uid;

    this.getProviderServices();
  }
  getProviderServices() {
    this.stateandservices.getServices(this.userID).subscribe(
      (response: any) => {
        this.services_array = response.data.filter(function (item: any) {
          console.log('item', item);
          if (
            item.serviceID === 2 ||
            item.serviceID === 4 ||
            item.serviceID === 9
          )
            return item;
        });
      },
      (err) => {},
    );
  }
  getStates(serviceID: any) {
    this.filteredMappedList.data = [];
    this.stateandservices.getStates(this.userID, serviceID, false).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response, false),
      (err) => {},
    );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response.data, 'Provider States');
      this.provider_states = response.data;
      // this.createButton = false;
    }
  }

  setProviderServiceMapID() {
    this.commonDataService.provider_serviceMapID =
      this.searchStateID.providerServiceMapID;
    this.providerServiceMapID = this.searchStateID.providerServiceMapID;

    console.log('psmid', this.searchStateID.providerServiceMapID);
    console.log(this.service);

    this.getProcedureDropDown();
    this.getComponentDropDown();
    this.getCurrentMappings();
  }
  getProcedureDropDown() {
    this.procedureComponentMappingServiceService
      .getProceduresList(this.providerServiceMapID)
      .subscribe((response: any) => {
        console.log('procedure List', response.data);
        this.procedureList = this.filterProcedureListforNull(response);
      });
  }
  getComponentDropDown() {
    this.procedureComponentMappingServiceService
      .getComponentsList(this.providerServiceMapID)
      .subscribe((response: any) => {
        console.log('component list', response.data);
        this.componentList = this.successhandeler(response.data);
        this.masterComponentList = this.successhandeler(response.data);
      });
  }

  getCurrentMappings() {
    this.procedureComponentMappingServiceService
      .getCurrentMappings(this.providerServiceMapID)
      .subscribe((res: any) => {
        this.mappedList = res.data;
        this.filteredMappedList.data = res.data;
        this.filteredMappedList.paginator = this.paginator;
        this.tableMode = true;
      });
  }

  configProcedureMapping(item: any, index: any) {
    this.showForm();
    this.selectedComponent = '';
    this.selectedComponentDescription = '';
    this.selectedLoincCode = '';
    this.selectedLoincComponent = '';
    console.log(item, 'here item');
    this.procedureComponentMappingServiceService
      .getSelectedProcedureMappings(item.procedureID)
      .subscribe((res: any) => {
        console.log('config procedure', res.data);
        if (res.data.length > 0) {
          console.log(JSON.stringify(res.data, null, 4), 'recheck');
          this.editMode = index >= 0 ? true : false;
          if (this.editMode) this.saveMode = false;
          // this.selectedProcedureType = item.procedureType;

          this.loadForConfig(res, item);
          //   this.configProcedureMapping(this.selectedProcedure, -1);
          this.procedureSelected_edit();
        } else {
          this.editMode = false;
          this.selectedComponentList = [];
          // this.selectedProcedureType = item.procedureType;

          const masters = Object.assign([], this.masterComponentList);
          this.filterComponentList(masters, item.procedureType);
        }
      });
  }

  loadForConfig(res: any, item: any) {
    console.log(this.masterComponentList, 'masterComponentList');
    const temp = this.procedureList.filter((procedure: any) => {
      return procedure.procedureID === res[0].procedureID;
    });
    console.log(temp, 'temp');
    if (temp.length > 0) {
      this.selectedProcedure = temp[0];
      res.forEach((mappedComponent: any) => {
        this.selectedComponentList.push(mappedComponent.compListDetails[0]);
      });
      this.selectedProcedureDescription = res[0].procedureDesc;
    } else {
      this.selectedComponentList = [];
    }
    this.componentList = [];
    const masters = Object.assign([], this.masterComponentList);
    this.filterComponentList(masters, temp[0].procedureType);
    console.log('loadCompList', this.componentList);
  }

  filterComponentList(compMaster: any, typeOfProcedure: any) {
    if (compMaster) {
      if (typeOfProcedure === 'Radiology') {
        this.componentList = compMaster.filter((comp: any) => {
          return comp.inputType === 'FileUpload';
        });
      } else if (typeOfProcedure !== 'Radiology') {
        this.componentList = compMaster.filter((comp: any) => {
          return comp.inputType !== 'FileUpload';
        });
      }
    }
    console.log(this.componentList, 'compList');
  }

  updateComponentMapList() {
    if (this.selectedComponent) {
      // const index = this.selectedComponentList.indexOf(this.selectedComponent);
      let index = -1;
      this.selectedComponentList.forEach((component: any, i: any) => {
        if (
          component.testComponentID === this.selectedComponent.testComponentID
        ) {
          index = i;
        }
      });
      if (index < 0) {
        console.log(
          this.selectedComponentList,
          this.selectedComponentList.length,
          'lengtho',
          this.selectedProcedureType,
          'type',
        );
        if (
          this.selectedComponentList.length > 0 &&
          this.selectedProcedureType === 'Radiology'
        ) {
          this.alertService.alert(
            'A Radiology Test can not have more than one component mapped',
          );
        } else {
          this.selectedComponentList.push(this.selectedComponent);
          this.postMappingData();
          this.clearComponentValue();
        }
      } else {
        this.alertService.alert('Already exists');
      }
    }
  }

  postMappingData() {
    const apiObject = Object.assign({}, this.selectedProcedure, {
      compList: this.selectedComponentList,
      createdBy: this.commonDataService.uname,
      providerServiceMapID: this.providerServiceMapID,
    });
    this.procedureComponentMappingServiceService
      .saveProcedureComponentMapping(apiObject)
      .subscribe((res: any) => {
        if (res && res.data.length > 0) {
          this.updateListAsPerFunction(res);
        }
        this.clearProcedureValue();
        this.clearComponentValue();
        this.clearSelectedComponentsList();
        this.getCurrentMappings();
      });
  }

  /**
   *
   * Update Mapped List as per 'Save' or 'Update'
   */
  updateListAsPerFunction(res: any) {
    if (!this.editMode) {
      this.mappedList.unshift(res.data[0]);
      if (!this.editMode)
        this.alertService.alert('Mapping saved successfully', 'success');
      else this.alertService.alert('Mapping updated successfully', 'success');
      this.showTable();
    } else if (this.editMode) {
      let index = -1;
      let filterIndex = -1;
      this.mappedList.forEach((procedure: any, i: any) => {
        if (procedure.procedureID === res.data[0].procedureID) {
          index = i;
        }
      });
      this.filteredMappedList.data.forEach((procedure: any, i: any) => {
        if (procedure.procedureID === res.data[0].procedureID) {
          filterIndex = i;
        }
      });
      if (index >= 0) {
        this.mappedList[index] = res.data[0];
        this.filteredMappedList.data[filterIndex] = res.data[0];
        this.alertService.alert('Mapping updated successfully', 'success');
        this.showTable();
      } else {
        this.mappedList.unshift(res.data[0]);
      }
    }
  }

  filterMappingList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredMappedList.data = this.mappedList;
    } else {
      this.filteredMappedList.data = [];
      this.mappedList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'procedureName' || key === 'compList') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredMappedList.data.push(item);
              break;
            }
          }
        }
      });
    }
  }

  removechip(component: any) {
    const index = this.selectedComponentList.indexOf(component);
    if (index >= 0) {
      this.selectedComponentList.splice(index, 1);
    }
  }

  filterProcedureListforNull(response: any) {
    const resp = response.data.filter((procedure: any) => {
      return procedure.procedureName !== null;
    });

    return resp;
  }
  procedureSelected_edit() {
    if (this.selectedProcedure) {
      console.log('selected procedure', this.selectedProcedure);
      this.selectedProcedureDescription = this.selectedProcedure.procedureDesc;
      this.selectedProcedureType = this.selectedProcedure.procedureType;
      console.log(this.selectedProcedureType);
    }
  }

  procedureSelected() {
    if (this.selectedProcedure) {
      console.log('selected procedure', this.selectedProcedure);
      this.selectedProcedureDescription = this.selectedProcedure.procedureDesc;
      this.selectedProcedureType = this.selectedProcedure.procedureType;
      console.log(this.selectedProcedureType);
      this.configProcedureMapping(this.selectedProcedure, -1);
    } else {
      this.clearSelectedComponentsList();
      this.selectedProcedureDescription = '';
      this.selectedProcedureType = '';
      this.editMode = false;
    }
  }

  componentSelected() {
    if (this.selectedComponent) {
      this.selectedComponentDescription =
        this.selectedComponent.testComponentDesc;
      this.selectedLoincCode = this.selectedComponent.lionicNum;
      this.selectedLoincComponent = this.selectedComponent.component;
    } else {
      this.selectedComponentDescription = '';
      this.selectedLoincCode = '';
      this.selectedLoincComponent = '';
    }
  }

  getServices(stateID: any) {
    console.log(this.serviceProviderID, stateID);
    this.providerAdminRoleService
      .getServices(this.serviceProviderID, stateID)
      .subscribe((response: any) => this.servicesSuccesshandeler(response));
  }
  showForm() {
    this.tableMode = false;
    this.saveMode = true;
    this.disableSelection = true;
  }
  showTable() {
    this.tableMode = true;
    this.editMode = false;
    this.saveMode = false;
    this.disableSelection = false;
  }
  back() {
    this.showTable();
    this.clearProcedureValue();
    this.clearComponentValue();
    this.clearSelectedComponentsList();
  }

  clearProcedureValue() {
    this.selectedProcedure = '';
    this.selectedProcedureDescription = '';
  }
  clearComponentValue() {
    this.selectedComponent = '';
    this.selectedComponentDescription = '';
    this.selectedLoincCode = '';
    this.selectedLoincComponent = '';
  }
  clearSelectedComponentsList() {
    this.selectedComponentList = [];
  }
  // For Service List
  servicesSuccesshandeler(response: any) {
    this.service = '';
    this.services = response.data;
    this.providerServiceMapID = null;
    this.clearProcedureValue();
    this.clearComponentValue();
    this.clearSelectedComponentsList();
    this.procedureList = [];
    this.componentList = [];
    this.mappedList = [];
    this.filteredMappedList.data = [];
  }
  // For State List
  successhandeler(response: any) {
    return response;
  }
}
