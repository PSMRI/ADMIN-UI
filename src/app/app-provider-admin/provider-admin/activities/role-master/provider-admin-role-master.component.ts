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
import {
  AbstractControl,
  FormControl,
  NgForm,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

// declare var jQuery: any;

@Component({
  selector: 'app-provider-admin-role-master',
  templateUrl: './provider-admin-role-master.component.html',
  styleUrls: ['./provider-admin-role-master.component.css'],
})
export class RoleMasterComponent implements OnInit, AfterViewInit {
  role: any;
  description: any;
  feature: any;
  screen_name: any;
  sRSMappingID: any;
  editedFeatureID: any;
  existingFeatureID: any;
  serviceProviderID: any;
  state: any;
  service: any;
  toBeEditedRoleObj: any;
  states: any;
  services: any;
  searchresultarray: any;
  userID: any;
  finalResponse: any;
  selectedRole: any;
  STATE_ID: any;
  SERVICE_ID: any;
  confirmMessage: any;
  editScreenName: any;
  filterScreens: any;

  tempFilterScreens: any = [];
  combinedFilterArray: any = [];
  bufferArray: any = [];
  // objs: any = [];
  features: any = [];
  editFeatures: any = [];
  tempfeatureMaster: any = [];
  // filteredsearchresultarray: any = [];

  // flags
  showRoleCreationForm = false;
  setEditSubmitButton = false;
  showAddButtonFlag = false;
  updateFeaturesToRoleFlag = false;
  showUpdateFeatureButtonFlag = false;
  correctInput = false;
  showAddButton = false;
  disableSelection = false;
  hideAdd = false;
  noRecordFound = false;
  othersExist = false;
  nationalFlag = false;

  multipleFeaturesServiceList = [3, 7];
  displayedColumns = [
    'sno',
    'role',
    'description',
    'featureName',
    'edit',
    'action',
  ];
  displayAddedColumns = ['sno', 'role', 'description', 'featureName', 'action'];

  @ViewChild('addingForm') addingForm!: NgForm;

  @ViewChild(MatSort) sort: MatSort | null = null;
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  dataSource = new MatTableDataSource<any>();
  addRole = new MatTableDataSource<any>();
  constructor(
    public ProviderAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    private alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.role = '';
    this.description = '';

    // provide service provider ID, (As of now hardcoded, but to be fetched from login response)
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');

    // array initialization
    this.states = [];
    this.services = [];
    this.searchresultarray = [];
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginatorFirst;
    this.dataSource.sort = this.sort;
    this.filterScreens = [];
  }

  ngOnInit() {
    console.log('commonDataService', this.commonDataService);
    this.userID = this.commonDataService.uid;
    this.getServiceLines();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginatorFirst;
    this.dataSource.sort = this.sort;
  }

  getServiceLines() {
    this.ProviderAdminRoleService.getServiceLinesNew(this.userID).subscribe(
      (response: any) => {
        this.services = this.successhandeler(response);
      },
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  successhandeler(response: any) {
    if (response && response.data) return response.data;
  }
  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.ProviderAdminRoleService.getStatesNew(obj).subscribe(
      (response: any) => this.statesSuccesshandeler(response, value),
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  statesSuccesshandeler(response: any, value: any) {
    this.state = '';
    this.states = response.data;
    this.searchresultarray = [];
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginatorFirst;
    this.dataSource.sort = this.sort;

    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(response.data[0].providerServiceMapID);
      this.findRoles(undefined, value.serviceID, true);
    } else {
      this.nationalFlag = value.isNational;
    }
  }
  setProviderServiceMapID(ProviderServiceMapID: any) {
    this.commonDataService.provider_serviceMapID = ProviderServiceMapID;
  }
  filterRoleIDs: any = [];
  findRoles(stateID: any, serviceID: any, flagValue: any) {
    this.showAddButtonFlag = flagValue;
    this.STATE_ID = stateID;
    this.SERVICE_ID = serviceID;

    const obj = {
      serviceProviderID: this.serviceProviderID,
      stateID: stateID,
      serviceID: serviceID,
      isNational: this.nationalFlag,
    };
    console.log(this.serviceProviderID, stateID, serviceID);
    this.ProviderAdminRoleService.getRole(obj).subscribe(
      (response: any) => {
        this.searchresultarray = this.fetchRoleSuccessHandeler(response);
        this.dataSource.data = this.fetchRoleSuccessHandeler(response);
        this.filterScreens = [];
        this.dataSource.data.forEach((item: any, index: number) => {
          item.sno = index + 1;
        });
        this.dataSource.paginator = this.paginatorFirst;
        this.dataSource.sort = this.sort;
        if (this.service.serviceID !== 7) {
          for (let i = 0; i < this.searchresultarray.length; i++) {
            this.filterScreens.push(this.searchresultarray[i].screenName);
          }
        } else {
          this.filterScreens = [];
          // for (var i = 0; i < this.searchresultarray.length; i++) {
          //   this.filterScreens.push(this.searchresultarray[i].screenName);
          //   this.filterRoleIDs.push(this.searchresultarray[i].roleID);
          // }
        }
      },
      (err: any) => {
        console.log(err, 'error');
      },
    );

    if (serviceID === '' || serviceID === undefined) {
      this.correctInput = false;
    } else {
      this.correctInput = true;
      this.showAddButton = true;
    }
  }
  fetchRoleSuccessHandeler(response: any) {
    if (response.data && response.data.length === 0) {
      this.noRecordFound = true;
    } else {
      this.noRecordFound = false;
    }
    return response.data;
  }
  setRoleFormFlag(flag: any) {
    this.hideAdd = true;
    this.setEditSubmitButton = false;
    this.showRoleCreationForm = flag;
    this.showAddButtonFlag = !flag;
    this.disableSelection = flag;
    this.editFeatures = undefined;

    if (!flag) {
      this.role = '';
      this.description = '';
      this.feature = undefined;
      this.selectedRole = undefined;
      this.addRole.data = [];
      this.addRole.paginator = this.paginatorSecond;
      this.tempFilterScreens = [];
      this.editScreenName = undefined;
      this.showUpdateFeatureButtonFlag = false;
      this.updateFeaturesToRoleFlag = false;
    } else {
      this.getFeatures(this.service.serviceID);
    }
  }
  getFeatures(serviceID: any) {
    this.filterScreens = [];
    if (serviceID === 7 && this.editScreenName !== undefined) {
      for (let i = 0; i < this.searchresultarray.length; i++) {
        if (
          this.searchresultarray[i].roleID === this.toBeEditedRoleObj.roleID
        ) {
          this.filterScreens.push(this.searchresultarray[i].screenName);
        }
      }
    }
    this.ProviderAdminRoleService.getFeature(serviceID).subscribe(
      (response: any) => this.getFeaturesSuccessHandeler(response),
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  getFeaturesSuccessHandeler(response: any) {
    const tempFeaturesArray: any = [];
    this.tempfeatureMaster = response.data;
    this.combinedFilterArray = [];
    this.combinedFilterArray = this.filterScreens.concat(
      this.tempFilterScreens,
    );
    response.data.forEach((screenNames: any) => {
      const index = this.combinedFilterArray.indexOf(screenNames.screenName);
      if (index < 0) {
        tempFeaturesArray.push(screenNames);
      }
    });
    this.features = tempFeaturesArray.slice();
    this.editFeatures = response.data.filter((obj: any) => {
      if (obj.screenName === this.editScreenName) {
        this.editedFeatureID = obj.screenID;
      }
      return (
        this.combinedFilterArray.indexOf(obj.screenName) === -1 ||
        obj.screenName === this.editScreenName
      );
    }, this);
  }

  add_obj(role: any, desc: any, feature: any) {
    const result = this.validateRole(role);
    let selected_features = [];
    if (feature === null) {
      this.alertService.alert('No more features to add');
    }
    if (Array.isArray(feature)) {
      selected_features = feature;
    } else {
      selected_features.push(feature);
    }
    if (result) {
      if (this.addRole.data.length < 1) {
        const obj = this.addtempRoleScreenMap(selected_features, role, desc);
        if (
          obj.roleName !== undefined &&
          obj.roleName !== null &&
          obj.roleName.trim().length > 0
        ) {
          this.addRole.data.push(obj);
          this.addRole.paginator = this.paginatorSecond;
          this.tempFilterScreens = this.tempFilterScreens.concat(
            obj.screen_name,
          );
          this.getFeatures(this.service.serviceID);
        }
      } else {
        for (let i = 0; i < this.addRole.data.length; i++) {
          if (
            this.addRole.data[i].roleName !== undefined &&
            this.addRole.data[i].roleName !== null &&
            role !== undefined &&
            role !== null &&
            this.addRole.data[i].roleName.toLowerCase().trim() ===
              role.toLowerCase().trim()
          ) {
            this.alertService.alert('Role name already exists');
            return;
          }
        }
        const obj = this.addtempRoleScreenMap(selected_features, role, desc);
        if (
          obj.roleName.trim().length > 0 &&
          obj.roleName !== undefined &&
          obj.roleName !== null
        ) {
          this.addRole.data.push(obj);
          this.addRole.paginator = this.paginatorSecond;
          if (this.service.serviceID !== 7) {
            this.tempFilterScreens = this.tempFilterScreens.concat(
              obj.screen_name,
            );
            this.getFeatures(this.service.serviceID);
          }
        }
      }
    }
    // jQuery("#roleAddForm").trigger('reset');
    this.addingForm.reset();
    this.feature = undefined;
  }

  validateRole(role: any) {
    if (
      this.selectedRole !== undefined &&
      this.selectedRole !== null &&
      this.selectedRole.trim().toUpperCase() === role.trim().toUpperCase()
    ) {
      this.othersExist = false;
    } else {
      let count = 0;
      for (let i = 0; i < this.searchresultarray.length; i++) {
        console.log(this.searchresultarray[i].roleName.toUpperCase());
        if (
          this.searchresultarray[i].roleName !== undefined &&
          this.searchresultarray[i].roleName !== null &&
          role !== undefined &&
          role !== null &&
          this.searchresultarray[i].roleName.trim().toUpperCase() ===
            role.trim().toUpperCase()
        ) {
          count = count + 1;
        }
      }
      console.log(count);
      if (count > 0) {
        this.othersExist = true;
        return false;
      } else {
        this.othersExist = false;
        return true;
      }
    }
    return false;
  }
  addtempRoleScreenMap(selected_features: any, role: any, desc: any) {
    const screenIDs = [];
    const screenNames = [];
    for (let z = 0; z < selected_features.length; z++) {
      screenIDs.push(selected_features[z].screenID);
      screenNames.push(selected_features[z].screenName);
    }
    const obj = {
      roleName: role !== undefined && role !== null ? role.trim() : null,
      roleDesc: desc !== undefined && desc !== null ? desc.trim() : null,
      screenID: screenIDs,
      screen_name: screenNames,
      createdBy: this.commonDataService.uname,
      createdDate: new Date(),
      providerServiceMapID: this.commonDataService.provider_serviceMapID,
    };
    return obj;
  }
  deleteRole(roleID: any, flag: any) {
    const obj = {
      roleID: roleID,
      deleted: flag,
    };

    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('obj', obj);
            this.ProviderAdminRoleService.deleteRole(obj).subscribe(
              (response: any) => {
                console.log('data', response);
                this.findRoles(
                  this.state.stateID,
                  this.service.serviceID,
                  true,
                );
                this.edit_delete_RolesSuccessHandeler('response', 'delete');
              },
              (err: any) => {
                console.log(err, 'error');
              },
            );
          }
        },
        (err) => {},
      );
  }
  finalsave() {
    console.log(this.addRole.data);
    this.ProviderAdminRoleService.createRoles(this.addRole.data).subscribe(
      (response: any) => this.createRolesSuccessHandeler(response),
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  createRolesSuccessHandeler(response: any) {
    this.alertService.alert('Saved successfully', 'success');
    console.log(response.data, 'in create role success in component.ts');
    this.finalResponse = response.data;
    if (this.finalResponse[0].roleID) {
      this.addRole.data = []; //empty the buffer array
      this.addRole.paginator = this.paginatorSecond;
      this.tempFilterScreens = [];
      this.setRoleFormFlag(false);
      this.findRoles(this.STATE_ID, this.SERVICE_ID, true);
    }
  }
  toBeEditedRoleObject: any;
  editHeading = false;
  editRole(roleObj: any) {
    this.existingFeatureID = null;
    this.editHeading = true;
    this.showRoleCreationForm = false;
    this.updateFeaturesToRoleFlag = false;
    this.toBeEditedRoleObj = roleObj;
    this.editScreenName = roleObj.screenName;

    this.setRoleFormFlag(true);

    if (this.service.serviceID === 3) {
      this.showUpdateFeatureButtonFlag = true;
    }

    this.sRSMappingID = roleObj.sRSMappingID;
    this.role = roleObj.roleName;
    this.selectedRole = roleObj.roleName;
    this.description = roleObj.roleDesc;
    this.setEditSubmitButton = true;
    this.hideAdd = false;
    this.showAddButtonFlag = false;

    for (let x = 0; x < this.features.length; x++) {
      if (this.features[x].screenName === roleObj.screenName) {
        this.existingFeatureID = this.features[x].screenID;
        break;
      }
    }
    this.editedFeatureID = this.existingFeatureID;
  }
  saveEditChanges() {
    const obj = {
      roleID: this.toBeEditedRoleObj.roleID,
      roleName:
        this.role !== undefined && this.role !== null ? this.role.trim() : null,
      roleDesc:
        this.description !== undefined && this.description !== null
          ? this.description.trim()
          : null,
      // "providerServiceMapID": this.toBeEditedRoleObj.providerServiceMapID,
      sRSMappingID: this.sRSMappingID,
      screenID: this.editedFeatureID,
      createdBy: this.commonDataService.uname,
      createdDate: new Date(),
    };
    this.ProviderAdminRoleService.editRole(obj).subscribe(
      (response: any) =>
        this.edit_delete_RolesSuccessHandeler(response, 'edit'),
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  edit_delete_RolesSuccessHandeler(response: any, choice: any) {
    if (choice === 'edit') {
      this.alertService.alert('Updated successfully', 'success');
    } else {
      this.alertService.alert(
        this.confirmMessage + 'd successfully',
        'success',
      );
    }
    console.log(response, 'edit/delete response');
    this.showRoleCreationForm = false;
    this.setEditSubmitButton = false;
    this.findRoles(this.STATE_ID, this.SERVICE_ID, true);
    this.role = '';
    this.description = '';
    this.addRole.data = [];
    this.addRole.paginator = this.paginatorSecond;
    this.tempFilterScreens = [];
    this.selectedRole = undefined;
    this.disableSelection = false;
    this.editHeading = false;
    this.showUpdateFeatureButtonFlag = false;
    this.toBeEditedRoleObj = undefined;
    this.editScreenName = null;
  }
  back(flag: any) {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.editHeading = false;
          this.toBeEditedRoleObj = undefined;
          this.setRoleFormFlag(flag);
        }
      });
  }
  remove_obj(index: any) {
    for (let k = 0; k < this.addRole.data[index].screen_name.length; k++) {
      const delIndex = this.tempFilterScreens.indexOf(
        this.addRole.data[index].screen_name[k],
      );
      if (delIndex !== -1) {
        this.tempFilterScreens.splice(delIndex, 1);
        this.getFeatures(this.service.serviceID);
      }
    }
    this.addRole.data.splice(index, 1);
    this.addRole.paginator = this.paginatorSecond;
  }
  removeFeature(rowIndex: any, FeatureIndex: any) {
    this.findRoles(this.STATE_ID, this.SERVICE_ID, false);
    if (rowIndex === 0) {
      for (let h = 0; h < this.tempFilterScreens.length; h++) {
        if (
          this.tempFilterScreens !== undefined &&
          this.addRole.data[0].screen_name[h] !== undefined &&
          this.tempFilterScreens[h].toUpperCase() ===
            this.addRole.data[0].screen_name[h].toUpperCase()
        ) {
          this.tempFilterScreens.splice(FeatureIndex, 1);
          this.getFeatures(this.service.serviceID);
        } else {
          continue;
        }
      }
    } else {
      let indexDel = 0;
      for (let i = 0; i < rowIndex; i++) {
        indexDel += this.addRole.data[i].screen_name.length;
      }
      for (let h = 0; h < this.tempFilterScreens.length; h++) {
        if (
          this.tempFilterScreens !== undefined &&
          this.addRole.data[0].screen_name[h] !== undefined &&
          this.tempFilterScreens[h].toUpperCase() ===
            this.addRole.data[0].screen_name[h].toUpperCase()
        ) {
          this.tempFilterScreens.splice(indexDel + FeatureIndex, 1);
          this.getFeatures(this.service.serviceID);
        } else {
          continue;
        }
      }
    }
    this.addRole.data[rowIndex].screen_name.splice(FeatureIndex, 1);
    this.addRole.data[rowIndex].screenID.splice(FeatureIndex, 1);
    this.addRole.paginator = this.paginatorSecond;
    if (
      this.addRole.data[rowIndex].screen_name.length === 0 &&
      this.addRole.data[rowIndex].screenID.length === 0
    ) {
      this.addRole.data.splice(rowIndex, 1);
      this.addRole.paginator = this.paginatorSecond;
    }
  }

  clear() {
    this.services = [];
    this.searchresultarray = [];
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginatorFirst;
    this.dataSource.sort = this.sort;
    this.filterScreens = [];
    this.showAddButtonFlag = false;
  }

  // UPDATE MORE FEATURES TO ROLE

  role_update: any;
  description_update: any;
  feature_update: any;
  roleID_update: any;

  addMoreFeatures(toBeEditedRoleObject: any) {
    this.updateFeaturesToRoleFlag = true;
    this.showUpdateFeatureButtonFlag = false;
    this.showRoleCreationForm = false;
    console.log('available features', this.features);
    console.log('Role object to be edited', toBeEditedRoleObject);
    this.role_update = toBeEditedRoleObject.roleName;
    this.description_update = toBeEditedRoleObject.roleDesc;
    this.roleID_update = toBeEditedRoleObject.roleID;
  }
  saveUpdateFeatureChanges() {
    const requestArray = [];

    for (let i = 0; i < this.feature_update.length; i++) {
      const reqObj = {
        roleID: this.roleID_update,
        providerServiceMapID: this.commonDataService.provider_serviceMapID,
        screenID: this.feature_update[i].screenID,
        createdBy: this.commonDataService.uname,
      };
      requestArray.push(reqObj);
    }
    console.log('RequestArray for feature update to role', requestArray);

    this.ProviderAdminRoleService.updateFeatureToRole(requestArray).subscribe(
      (response: any) => {
        console.log(response, 'RESPONSE AFTER UPDATING FEATURE TO ROLE');
        if (response.length > 1) {
          this.alertService.alert('Updated successfully', 'success');
        }
        if (response.length === 1) {
          this.alertService.alert('Updated successfully', 'success');
        }
        this.editHeading = false;
        this.setRoleFormFlag(false);
        this.findRoles(this.STATE_ID, this.SERVICE_ID, true);
      },
      (err: any) => {
        console.log('ERROR while updating feature to role', err);
        console.log(err, 'error');
      },
    );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.searchresultarray;
      this.dataSource.paginator = this.paginatorFirst;
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginatorFirst;
      this.dataSource.sort = this.sort;
      this.searchresultarray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'roleName' || key === 'screenName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          }
        }
        this.dataSource.data.forEach((item: any, index: number) => {
          item.sno = index + 1;
        });
        this.dataSource.paginator = this.paginatorFirst;
        this.dataSource.sort = this.sort;
      });
    }
  }
}
