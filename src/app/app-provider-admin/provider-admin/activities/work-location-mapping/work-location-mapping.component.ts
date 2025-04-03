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
import { VillageMasterService } from 'src/app/core/services/adminServices/AdminVillage/village-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { WorkLocationMapping } from '../services/work-location-mapping.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-work-location-mapping',
  templateUrl: './work-location-mapping.component.html',
  styleUrls: ['./work-location-mapping.component.css'],
})
export class WorkLocationMappingComponent implements OnInit {
  userID: any;
  serviceProviderID: any;
  createdBy: any;
  uSRMappingID: any;
  workLocationID: any;
  providerServiceMapID: any;
  edit = false;
  Role: any;
  User: any;
  State: any;
  Serviceline: any;
  District: any;
  WorkLocation: any;
  Serviceblock: any;
  Servicevillage: any;
  blockId: any;

  // Arrays
  filteredRoles: any = '';
  userNamesList: any = [];
  services_array: any = [];
  states_array: any = [];
  districts_array: any = [];
  filteredStates: any = [];
  mappedWorkLocationsList: any = [];
  workLocationsList: any = [];
  RolesList: any = [];
  edit_Details: any = [];
  previleges: any = [];
  workLocations: any = [];
  blocks: any = [];
  editblocks: any = [];
  village: any = [];
  editVillageArr: any = [];
  villageEditNameArr: any = [];

  //  flag values
  formMode = false;
  tableMode = true;
  editMode = false;
  disableUsername = false;
  saveButtonStatus = false;
  duplicatestatus = false;
  duplicatestatus_editPart = false;

  isNational = false;
  blockFlag = false;

  villageFlag = false;
  searchTerm: any;
  enableEditBlockFlag = false;
  enableEditVillageFlag = false;
  eSanjivaniFlag = false;
  isSanjeevani = false;
  eSanjivaniEditFlag = false;
  esanjFlag = false;
  eSanjeevaniEdit = false;
  foundDuplicate = false;

  displayedColumns: string[] = [
    'SNo',
    'UserName',
    'Serviceline',
    'State',
    'District',
    'Block',
    'Village',
    'WorkLocation',
    'Role',
    'Inbound',
    'Outbound',
    'edit',
    'action',
  ];
  displayedColumnsTable2: string[] = [
    'SNo',
    'UserName',
    'Serviceline',
    'State',
    'District',
    'Block',
    'Village',
    'WorkLocation',
    'Role',
    'Inbound',
    'Outbound',
    'ESanjeevani',
    'delete',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredmappedWorkLocationsList = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredmappedWorkLocationsList.paginator = this.paginator;
  }
  @ViewChild('workplaceform')
  eForm!: NgForm;
  @ViewChild('workplaceeform')
  editWorkplaceForm!: NgForm;
  showInOutBound = false;
  isInbound = false;
  isOutbound = false;
  showInOutBoundEdit = false;
  singleSelectForEcd = false;
  disableSelectRoles = false;
  ServiceEditblock: any;
  villagename: any;
  blockname: any;
  blockid: any;
  serviceEditvillage: any;
  villageid: any;
  villageIdValue: any;
  item: any;
  workplaceform: any;

  constructor(
    private alertService: ConfirmationDialogsService,
    private worklocationmapping: WorkLocationMapping,
    private villagemasterService: VillageMasterService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.userID = this.sessionstorage.getItem('uid');
    this.createdBy = this.sessionstorage.getItem('uname');
    this.getProviderServices(this.userID);
    this.getAllMappedWorkLocations();
    this.getUserName(this.serviceProviderID);
  }

  setIsNational(value: any) {
    this.isNational = value;
  }

  getStates(serviceID: any, isNational: any) {
    this.availableRoles = [];
    this.worklocationmapping
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) =>
          this.getStatesSuccessHandeler(response.data, isNational),
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getStatesSuccessHandeler(response: any, isNational: any) {
    this.State = '';
    if (response) {
      console.log(response, 'Provider States');
      this.states_array = response;
      this.districts_array = [];
      this.workLocationsList = [];
      this.RolesList = [];

      if (isNational) {
        this.State = '';
        this.District = '';
        this.getAllWorkLocations(
          this.states_array[0],
          this.Serviceline,
          this.Serviceline.isNational,
        );
      }
    }
  }
  getProviderServices(userID: any) {
    this.worklocationmapping.getServices(userID).subscribe(
      (response: any) => {
        this.services_array = response.data;
      },
      (err: any) => {
        console.log(err, 'error');
      },
    );
  }
  getAllMappedWorkLocations() {
    this.worklocationmapping
      .getMappedWorkLocationList(this.serviceProviderID)
      .subscribe(
        (response: any) => {
          if (response) {
            console.log(
              'All Mapped Work Locations List Success Handeler',
              response,
            );
            this.mappedWorkLocationsList = response.data;
            this.filteredmappedWorkLocationsList.data = response.data;
          }
        },
        (err: any) => {
          console.log('Error', err);
        },
      );
  }
  getUserName(serviceProviderID: any) {
    this.worklocationmapping.getUserName(serviceProviderID).subscribe(
      (response: any) => {
        if (response) {
          console.log(
            'All User names under this provider Success Handeler',
            response,
          );
          this.userNamesList = response.data;
          this.states_array = [];
          this.districts_array = [];
          this.workLocationsList = [];
          this.RolesList = [];
        }
      },
      (err: any) => {
        console.log('Error', err);
        console.log(err, 'error');
      },
    );
  }

  getAllDistricts(serviceID: any, user: any, state: any) {
    this.showAlertsForMappedRoles(
      serviceID,
      user.userID,
      state.providerServiceMapID,
    );
    this.worklocationmapping.getAllDistricts(state.stateID || state).subscribe(
      (response: any) => {
        if (response) {
          console.log(response, 'get all districts success handeler');
          this.districts_array = response.data;
          this.workLocationsList = [];
          this.RolesList = [];
        }
      },
      (err: any) => {
        console.log(err, 'error');
      },
    );
    this.disableSelectRoles = false; //For resetting the disbaled selected role field on change of states
  }
  showAlertsForMappedRoles(
    serviceID: any,
    userID: any,
    providerServiceMapID: any,
  ) {
    const reqObj = {
      userID: userID,
      providerServiceMapID: providerServiceMapID,
    };
    this.worklocationmapping
      .getAllMappedRolesForTm(reqObj)
      .subscribe((response: any) => {
        console.log('mappedroles of tm', response);
        response.data.forEach((mappedRolesOfTm: any) => {
          if (
            mappedRolesOfTm.screenName === 'TC Specialist' ||
            mappedRolesOfTm.screenName === 'Supervisor'
          ) {
            this.alertService.alert(
              'This user is already mapped to supervisor/TC Specialist',
            );
            this.State = null;
          }
        });
      });
    if (this.bufferArray.data.length > 0) {
      this.bufferArray.data.forEach((bufferScreenList: any) => {
        if (
          bufferScreenList.providerServiceMapID === providerServiceMapID &&
          bufferScreenList.userID === userID &&
          (bufferScreenList.roleID1[0].screenName === 'TC Specialist' ||
            bufferScreenList.roleID1[0].screenName === 'Supervisor')
        ) {
          this.alertService.alert(
            'This user is already mapped to supervisor/TC Specialist',
          );
          this.State = null;
        }
      });
      this.bufferArray.paginator = this.paginator;
    }
  }

  getAllWorkLocations(state: any, service: any, isNational: any) {
    this.worklocationmapping
      .getAllWorkLocations(
        this.serviceProviderID,
        state.stateID || state,
        service.serviceID || service,
        isNational,
        this.District.districtID,
      )
      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all work locations success handeler');
            this.workLocationsList = response.data;
            this.RolesList = [];
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllRoles(serviceID: any, providerServiceMapID: any, userID: any) {
    if (serviceID === 4) {
      this.worklocationmapping.getAllRolesForTM(providerServiceMapID).subscribe(
        (response: any) => {
          console.log(response, 'get all roles success handeler');
          this.RolesList = response.data;
          if (this.RolesList) {
            this.checkExistance(serviceID, providerServiceMapID, userID);
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
    } else {
      const psmID = providerServiceMapID
        ? providerServiceMapID
        : this.states_array[0].providerServiceMapID;
      this.worklocationmapping.getAllRoles(psmID).subscribe(
        (response: any) => {
          console.log(response, 'get all roles success handeler');
          this.RolesList = response.data;
          if (this.RolesList) {
            this.checkExistance(serviceID, psmID, userID);
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
    }
  }
  existingRoles: any = [];
  availableRoles: any = [];
  bufferArrayTemp: any = [];
  bufferRoleIds: any = [];

  supAndSpecScreenNames: any = [];
  bufferSupAndSpecScreenNames: any = [];

  checkExistance(serviceID: any, providerServiceMapID: any, userID: any) {
    this.existingRoles = [];
    this.bufferRoleIds = [];
    this.disableSelectRoles = false;
    this.mappedWorkLocationsList.forEach((mappedWorkLocations: any) => {
      if (
        mappedWorkLocations.serviceName === 'ECD' &&
        mappedWorkLocations.providerServiceMapID !== undefined &&
        mappedWorkLocations.providerServiceMapID === providerServiceMapID &&
        mappedWorkLocations.userID === userID
      ) {
        if (!mappedWorkLocations.userServciceRoleDeleted) {
          this.disableSelectRoles = true;
          return;
        }
      } else if (
        mappedWorkLocations.providerServiceMapID !== undefined &&
        mappedWorkLocations.providerServiceMapID === providerServiceMapID &&
        mappedWorkLocations.userID === userID
      ) {
        if (!mappedWorkLocations.userServciceRoleDeleted) {
          this.existingRoles.push(mappedWorkLocations.roleID); // existing roles has roles which are already mapped.
        }
      }
    });
    this.availableRoles = this.RolesList.slice();

    const temp: any = [];
    this.availableRoles.forEach((roles: any) => {
      const index = this.existingRoles.indexOf(roles.roleID);
      if (index < 0) {
        temp.push(roles);
      }
    });
    this.availableRoles = temp.slice();
    if (this.bufferArray.data.length > 0) {
      this.bufferArray.data.forEach((bufferList: any) => {
        if (
          bufferList.userID === userID &&
          bufferList.providerServiceMapID === providerServiceMapID
        ) {
          if (bufferList.roleID1.length > 0) {
            this.availableRoles.forEach((removeScreenNameOfSupAndSpec: any) => {
              if (
                removeScreenNameOfSupAndSpec.screenName === 'TC Specialist' ||
                removeScreenNameOfSupAndSpec.screenName === 'Supervisor'
              ) {
                this.bufferSupAndSpecScreenNames.push(
                  removeScreenNameOfSupAndSpec.screenName,
                );
              }
            });
          }
        }
      });
    }
    this.availableRoles.forEach((removeScreenNameOfSupAndSpec: any) => {
      if (
        removeScreenNameOfSupAndSpec.screenName === 'TC Specialist' ||
        removeScreenNameOfSupAndSpec.screenName === 'Supervisor'
      ) {
        this.supAndSpecScreenNames.push(
          removeScreenNameOfSupAndSpec.screenName,
        );
      }
    });
    const tempsupAndSpecScreenNames: any = [];
    if (this.existingRoles.length > 0) {
      this.availableRoles.forEach((screenNames: any) => {
        const index = this.supAndSpecScreenNames.indexOf(
          screenNames.screenName,
        );
        if (index < 0) {
          tempsupAndSpecScreenNames.push(screenNames);
        }
      });
      this.availableRoles = tempsupAndSpecScreenNames.slice();
    }

    if (this.bufferArray.data.length > 0) {
      this.bufferArray.data.forEach((bufferArrayList: any) => {
        if (
          bufferArrayList.serviceName === 'ECD' &&
          bufferArrayList.userID === userID &&
          bufferArrayList.providerServiceMapID === providerServiceMapID
        ) {
          this.disableSelectRoles = true;
          return;
        } else if (bufferArrayList.userID === userID) {
          this.bufferArrayTemp.push(bufferArrayList.roleID1);
        }
      });
    }
    this.bufferArrayTemp.forEach((roleId: any) => {
      roleId.forEach((role: any) => {
        this.bufferRoleIds.push(role.roleID1);
      });
    });
    const bufferTemp: any = [];
    this.availableRoles.forEach((bufferRoles: any) => {
      const index = this.bufferRoleIds.indexOf(bufferRoles.roleID);
      if (index < 0) {
        bufferTemp.push(bufferRoles);
      }
    });
    this.availableRoles = bufferTemp.slice();
    const bufferTempsupAndSpecScreenNames: any[] = [];
    this.availableRoles.forEach((screenNames: any) => {
      const index = this.bufferSupAndSpecScreenNames.indexOf(
        screenNames.screenName,
      );
      if (index < 0) {
        bufferTempsupAndSpecScreenNames.push(screenNames);
      }
    });
    this.availableRoles = bufferTempsupAndSpecScreenNames.slice();

    // reset all buffer values
    this.bufferArrayTemp = [];
    this.bufferSupAndSpecScreenNames = [];
    this.supAndSpecScreenNames = [];
  }

  allowSingleRoleOnlyForECD(serviceline: any) {
    if (serviceline === 'ECD') {
      this.singleSelectForEcd = true;
    } else {
      this.singleSelectForEcd = false;
    }
  }

  showTable() {
    if (this.editMode) {
      this.tableMode = true;
      this.formMode = false;
      this.editMode = false;
      this.bufferArray.data = [];
      this.bufferArray.paginator = this.paginator;
      this.editWorkplaceForm.resetForm();
      this.showInOutBoundEdit = false;
      this.isOutboundEdit = false;
      this.isInboundEdit = false;
      this.searchTerm = null;
      this.disableSelectRoles = false;
      this.eSanjivaniEditFlag = false;
      this.eSanjeevaniEdit = false;
    } else {
      if (this.bufferArray.data.length > 0) {
        this.tableMode = true;
        this.formMode = false;
        this.editMode = false;
        this.bufferArray.data = [];
        this.bufferArray.paginator = this.paginator;
        this.eForm.resetForm();
        this.isNational = false;
        this.isInbound = false;
        this.isOutbound = false;
        this.showInOutBound = false;
        this.eSanjivaniFlag = false;
        this.availableRoles = [];
        this.RolesList = [];
        this.searchTerm = null;
        this.disableSelectRoles = false;
      } else {
        this.tableMode = true;
        this.formMode = false;
        this.editMode = false;
        this.bufferArray.data = [];
        this.bufferArray.paginator = this.paginator;
        this.eForm.resetForm();
        this.isNational = false;
        this.isInbound = false;
        this.isOutbound = false;
        this.showInOutBound = false;
        this.eSanjivaniFlag = false;
        this.availableRoles = [];
        this.RolesList = [];
        this.searchTerm = null;
        this.disableSelectRoles = false;
      }
    }
  }
  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to go back? Any unsaved data would be lost',
      )
      .subscribe((response: any) => {
        if (response) {
          this.showTable();
          this.getAllMappedWorkLocations();
        }
      });
  }
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
    this.edit = false;
    this.isInbound = false;
    this.isOutbound = false;
  }
  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
    this.edit = true;
    this.isInbound = false;
    this.isOutbound = false;
  }

  activate(
    userID: any,
    serviceID: any,
    uSRMappingID: any,
    userDeactivated: any,
    providerServiceMappingDeleted: any,
    stateID: any,
    workingDistrictID: any,
    blockID: any,
    roleID: any,
  ) {
    if (userDeactivated) {
      this.alertService.alert('User is inactive');
    } else if (providerServiceMappingDeleted) {
      this.alertService.alert('State is inactive');
    } else {
      if (serviceID === 4) {
        this.alertService
          .confirm('confirm', 'Are you sure you want to Activate?')
          .subscribe((response: any) => {
            if (response) {
              const object = {
                uSRMappingID: uSRMappingID,
                deleted: false,
              };

              this.worklocationmapping
                .DeleteWorkLocationMappingForTM(object)
                .subscribe(
                  (response: any) => {
                    if (response) {
                      this.alertService.alert(
                        'Activated successfully',
                        'success',
                      );
                      /* refresh table */
                      this.searchTerm = null;
                      this.getAllMappedWorkLocations();
                    }
                  },
                  (err: any) => {
                    console.log('error', err);
                    this.alertService.alert(err.errorMessage);
                  },
                );
            }
          });
      } else if (serviceID === 9) {
        const result = false;
        this.foundDuplicate = false;
        if (this.mappedWorkLocationsList.length !== 0) {
          this.mappedWorkLocationsList.forEach((mappedWorkLocations: any) => {
            if (
              serviceID === 9 &&
              serviceID === mappedWorkLocations.serviceID &&
              stateID === mappedWorkLocations.stateID &&
              workingDistrictID === mappedWorkLocations.workingDistrictID &&
              blockID === mappedWorkLocations.blockID &&
              mappedWorkLocations.userID === userID &&
              uSRMappingID !== mappedWorkLocations.uSRMappingID &&
              roleID === mappedWorkLocations.roleID
            ) {
              if (!mappedWorkLocations.userServciceRoleDeleted) {
                this.foundDuplicate = true;
              }
            }
          });
        }
        if (this.mappedWorkLocationsList.length !== 0) {
          this.mappedWorkLocationsList.forEach((mappedWorkLocations: any) => {
            if (
              serviceID === 9 &&
              serviceID === mappedWorkLocations.serviceID &&
              stateID !== mappedWorkLocations.stateID &&
              workingDistrictID !== mappedWorkLocations.workingDistrictID &&
              blockID !== mappedWorkLocations.blockID &&
              mappedWorkLocations.userID === userID &&
              uSRMappingID !== mappedWorkLocations.uSRMappingID
            ) {
              if (!mappedWorkLocations.userServciceRoleDeleted) {
                this.foundDuplicate = true;
              }
            }
          });
        }
        if (this.foundDuplicate === false) {
          this.alertService
            .confirm('confirm', 'Are you sure you want to Activate?')
            .subscribe((response: any) => {
              if (response) {
                const object = {
                  uSRMappingID: uSRMappingID,
                  deleted: false,
                };

                this.worklocationmapping
                  .DeleteWorkLocationMapping(object)
                  .subscribe(
                    (response: any) => {
                      if (response) {
                        this.alertService.alert(
                          'Activated successfully',
                          'success',
                        );
                        /* refresh table */
                        this.searchTerm = null;
                        this.getAllMappedWorkLocations();
                      }
                    },
                    (err: any) => {
                      console.log('error', err);
                    },
                  );
              }
            });
        } else {
          this.alertService.alert(
            'Service Already Actiavted either with same demographic or with same role',
          );
        }
      } else {
        this.alertService
          .confirm('confirm', 'Are you sure you want to Activate?')
          .subscribe((response: any) => {
            if (response) {
              const object = {
                uSRMappingID: uSRMappingID,
                deleted: false,
              };

              this.worklocationmapping
                .DeleteWorkLocationMapping(object)
                .subscribe(
                  (response: any) => {
                    if (response) {
                      this.alertService.alert(
                        'Activated successfully',
                        'success',
                      );
                      /* refresh table */
                      this.searchTerm = null;
                      this.getAllMappedWorkLocations();
                    }
                  },
                  (err: any) => {
                    console.log('error', err);
                  },
                );
            }
          });
      }
    }
  }
  deactivate(serviceID: any, uSRMappingID: any) {
    if (serviceID === 4) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response: any) => {
          if (response) {
            const object = { uSRMappingID: uSRMappingID, deleted: true };

            this.worklocationmapping
              .DeleteWorkLocationMappingForTM(object)
              .subscribe(
                (res: any) => {
                  if (res) {
                    this.alertService.alert(
                      'Deactivated successfully',
                      'success',
                    );
                    /* refresh table */
                    this.searchTerm = null;
                    this.getAllMappedWorkLocations();
                  }
                },
                (err: any) => {
                  console.log('error', err);
                  console.log(err, 'error');
                },
              );
          }
        });
    } else {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response: any) => {
          if (response) {
            const object = { uSRMappingID: uSRMappingID, deleted: true };

            this.worklocationmapping
              .DeleteWorkLocationMapping(object)
              .subscribe(
                (res: any) => {
                  if (res) {
                    this.alertService.alert(
                      'Deactivated successfully',
                      'success',
                    );
                    /* refresh table */
                    this.searchTerm = null;
                    this.getAllMappedWorkLocations();
                  }
                },
                (err: any) => {
                  console.log('error', err);
                  console.log(err, 'error');
                },
              );
          }
        });
    }
  }
  addWorkLocation(objectToBeAdded: any, role: any) {
    const statesIDEdit =
      objectToBeAdded.serviceline.isNational === false
        ? objectToBeAdded.state.providerServiceMapID
        : this.states_array[0].providerServiceMapID;
    const districtEdit =
      objectToBeAdded.serviceline.isNational === false
        ? objectToBeAdded.district.districtID
        : null;
    console.log(objectToBeAdded, 'FORM VALUES');
    if (objectToBeAdded.serviceline.serviceName === '1097') {
      if (
        (this.isInbound === false || this.isInbound === null) &&
        (this.isOutbound === false || this.isOutbound === null) &&
        objectToBeAdded.role.some(
          (item: any) => item.roleName.toLowerCase() !== 'supervisor',
        )
      ) {
        this.alertService.alert('Select checkbox Inbound/Outbound/Both');
      } else {
        if (
          objectToBeAdded.role.some(
            (item: any) => item.roleName.toLowerCase() === 'supervisor',
          ) &&
          (this.isOutbound === true || this.isInbound === true)
        ) {
          this.alertService.alert(
            "Supervisor doesn't have the privilege for Inbound/Outbound",
          );
        }

        if (objectToBeAdded.role.length > 0) {
          if (objectToBeAdded.role.length === 1) {
            for (let a = 0; a < objectToBeAdded.role.length; a++) {
              const obj = {
                roleID1: objectToBeAdded.role[a].roleID,
                roleName: objectToBeAdded.role[a].roleName,
                screenName: objectToBeAdded.role[a].screenName,
              };
              if (
                objectToBeAdded.role[a].roleName.toLowerCase() === 'supervisor'
              )
                this.setWorkLocationObject(objectToBeAdded, obj, false, false);
              else
                this.setWorkLocationObject(
                  objectToBeAdded,
                  obj,
                  objectToBeAdded.Inbound,
                  objectToBeAdded.Outbound,
                );
            }
          } else {
            if (objectToBeAdded.role.length > 1) {
              for (let i = 0; i < objectToBeAdded.role.length; i++) {
                if (
                  objectToBeAdded.role[i].screenName === 'TC Specialist' ||
                  objectToBeAdded.role[i].screenName === 'Supervisor'
                ) {
                  this.Role = null;
                  this.alertService.alert('Invaild role mapping');
                  break;
                } else {
                  const obj = {
                    roleID1: objectToBeAdded.role[i].roleID,
                    roleName: objectToBeAdded.role[i].roleName,
                    screenName: objectToBeAdded.role[i].screenName,
                  };
                  if (
                    objectToBeAdded.role[i].roleName.toLowerCase() ===
                    'supervisor'
                  )
                    this.setWorkLocationObject(
                      objectToBeAdded,
                      obj,
                      false,
                      false,
                    );
                  else
                    this.setWorkLocationObject(
                      objectToBeAdded,
                      obj,
                      objectToBeAdded.Inbound,
                      objectToBeAdded.Outbound,
                    );
                }
              }
            }
          }

          this.resetAllArrays();
          this.isNational = false;
        }
        if (this.bufferArray.data.length > 0) {
          this.eForm.resetForm();
          this.bufferArray.paginator = this.paginator;
        }
        console.log('Result Array', this.bufferArray);
      }
    } else if (objectToBeAdded.serviceline.serviceName === 'ECD') {
      const obj = {
        roleID1: objectToBeAdded.role.roleID,
        roleName: objectToBeAdded.role.roleName,
        screenName: objectToBeAdded.role.screenName,
      };
      this.setWorkLocationObject(objectToBeAdded, obj, false, false);
      if (this.bufferArray.data.length > 0) {
        this.eForm.resetForm();
        this.bufferArray.paginator = this.paginator;
      }
      console.log('Result Array', this.bufferArray);
      if (this.bufferArray.data.length > 0) {
        this.eForm.resetForm();
        this.bufferArray.paginator = this.paginator;
      }
    } else if (objectToBeAdded.serviceline.serviceName === 'HWC') {
      const result: boolean = this.checkHWCDuplicateBufferArray();
      const result2: boolean = this.checkHWCDuplicateMainArray();
      if (result === true || result2 === true) {
        this.alertService.alert(
          'Same User Already Mapped with different State and District',
        );
      } else {
        if (objectToBeAdded.role.length > 0) {
          if (objectToBeAdded.role.length === 1) {
            for (let a = 0; a < objectToBeAdded.role.length; a++) {
              const obj = {
                roleID1: objectToBeAdded.role[a].roleID,
                roleName: objectToBeAdded.role[a].roleName,
                screenName: objectToBeAdded.role[a].screenName,
                isSanjeevani:
                  objectToBeAdded.serviceline.serviceName === 'HWC' &&
                  objectToBeAdded.role[a].roleName.toLowerCase() === 'nurse' &&
                  this.isSanjeevani
                    ? true
                    : false,
              };
              this.setWorkLocationObject(objectToBeAdded, obj, false, false);
            }
          } else {
            if (objectToBeAdded.role.length > 1) {
              for (let i = 0; i < objectToBeAdded.role.length; i++) {
                if (
                  objectToBeAdded.role[i].screenName === 'TC Specialist' ||
                  objectToBeAdded.role[i].screenName === 'Supervisor'
                ) {
                  this.Role = null;
                  this.alertService.alert('Invaild role mapping');
                  break;
                } else {
                  const obj = {
                    roleID1: objectToBeAdded.role[i].roleID,
                    roleName: objectToBeAdded.role[i].roleName,
                    screenName: objectToBeAdded.role[i].screenName,
                    isSanjeevani:
                      objectToBeAdded.serviceline.serviceName === 'HWC' &&
                      objectToBeAdded.role[i].roleName.toLowerCase() ===
                        'nurse' &&
                      this.isSanjeevani
                        ? true
                        : false,
                  };
                  this.setWorkLocationObject(
                    objectToBeAdded,
                    obj,
                    false,
                    false,
                  );
                }
              }
            }
          }
          this.resetAllArrays();
        }
        if (this.bufferArray.data.length > 0) {
          this.eForm.resetForm();
          this.bufferArray.paginator = this.paginator;
          this.disableSelectRoles = false;
        }
      }
    } else {
      if (objectToBeAdded.role.length > 0) {
        if (objectToBeAdded.role.length === 1) {
          for (let a = 0; a < objectToBeAdded.role.length; a++) {
            const obj = {
              roleID1: objectToBeAdded.role[a].roleID,
              roleName: objectToBeAdded.role[a].roleName,
              screenName: objectToBeAdded.role[a].screenName,
              isSanjeevani:
                objectToBeAdded.serviceline.serviceName !== 'HWC' &&
                objectToBeAdded.role[a].roleName.toLowerCase() !== 'nurse' &&
                !this.isSanjeevani
                  ? false
                  : true,
            };
            this.setWorkLocationObject(objectToBeAdded, obj, false, false);
          }
        } else {
          if (objectToBeAdded.role.length > 1) {
            for (let i = 0; i < objectToBeAdded.role.length; i++) {
              if (
                objectToBeAdded.role[i].screenName === 'TC Specialist' ||
                objectToBeAdded.role[i].screenName === 'Supervisor'
              ) {
                this.Role = null;
                this.alertService.alert('Invaild role mapping');
                break;
              } else {
                const obj = {
                  roleID1: objectToBeAdded.role[i].roleID,
                  roleName: objectToBeAdded.role[i].roleName,
                  screenName: objectToBeAdded.role[i].screenName,
                  isSanjeevani:
                    objectToBeAdded.serviceline.serviceName !== 'HWC' &&
                    objectToBeAdded.role[i].roleName.toLowerCase() !==
                      'nurse' &&
                    !this.isSanjeevani
                      ? false
                      : true,
                };

                this.setWorkLocationObject(objectToBeAdded, obj, false, false);
              }
            }
          }
        }

        this.resetAllArrays();
      }

      if (this.bufferArray.data.length > 0) {
        this.eForm.resetForm();
        this.bufferArray.paginator = this.paginator;
        this.disableSelectRoles = false;
      }
      console.log('Result Array', this.bufferArray);
    }
  }

  setWorkLocationObject(
    objectToBeAdded: any,
    obj: any,
    InboundValue: any,
    OnboundValue: any,
  ) {
    const villageIDArr: any = [];
    const villageNameArr: any = [];
    const roleArr = [];
    roleArr.push(obj);
    if (objectToBeAdded.Serviceblock !== undefined) {
      objectToBeAdded.Servicevillage.filter((item: any) => {
        villageNameArr.push(item.villageName);
        villageIDArr.push(item.districtBranchID);
      });
    }
    const allRolesArr = [];
    for (let i = 0; i < roleArr.length; i++) {
      allRolesArr.push(roleArr[i].isSanjeevani);
    }
    const workLocationObj: any = {
      previleges: [],
      userID: objectToBeAdded.user.userID,
      userName: objectToBeAdded.user.userName,
      serviceID: objectToBeAdded.serviceline.serviceID,
      serviceName: objectToBeAdded.serviceline.serviceName,
      blockName:
        objectToBeAdded.Serviceblock !== undefined &&
        objectToBeAdded.Serviceblock.blockName !== undefined &&
        objectToBeAdded.Serviceblock.blockName !== '' &&
        objectToBeAdded.Serviceblock.blockName !== null
          ? objectToBeAdded.Serviceblock.blockName
          : null,
      blockID:
        objectToBeAdded.Serviceblock !== undefined &&
        objectToBeAdded.Serviceblock.blockID !== undefined &&
        objectToBeAdded.Serviceblock.blockID !== null
          ? objectToBeAdded.Serviceblock.blockID
          : null,
      workingLocation: objectToBeAdded.worklocation.locationName,
      roleID1: roleArr,
      villageName:
        villageNameArr !== undefined && villageNameArr.length > 0
          ? villageNameArr
          : null,
      villageID:
        villageIDArr !== undefined && villageIDArr.length > 0
          ? villageIDArr
          : null,
      Inbound:
        objectToBeAdded.serviceline.serviceName === '1097'
          ? InboundValue
          : 'N/A',
      Outbound:
        objectToBeAdded.serviceline.serviceName === '1097'
          ? OnboundValue
          : 'N/A',
      // tslint:disable-next-line:max-line-length
      providerServiceMapID:
        objectToBeAdded.serviceline.isNational === false
          ? objectToBeAdded.state.providerServiceMapID
          : this.states_array[0].providerServiceMapID,
      createdBy: this.createdBy,
      workingLocationID: objectToBeAdded.worklocation.pSAddMapID,
      isSanjeevani: allRolesArr,
    };
    if (objectToBeAdded.state) {
      workLocationObj['stateName'] = objectToBeAdded.state.stateName;
    } else {
      workLocationObj['stateName'] = 'All States';
    }
    if (objectToBeAdded.district !== undefined) {
      workLocationObj['district'] = objectToBeAdded.district.districtName;
    } else {
      workLocationObj['district'] = null;
    }
    this.bufferArray.data.push(workLocationObj);
    this.bufferArray.paginator = this.paginator;
  }

  resetAllArrays() {
    this.states_array = [];

    this.districts_array = [];

    this.workLocationsList = [];

    this.availableRoles = [];

    this.RolesList = [];

    this.showInOutBound = false;

    this.eSanjivaniFlag = false;
  }

  deleteRow(i: any, serviceID: any, providerServiceMapID: any, userID: any) {
    this.bufferArray.data.splice(i, 1);
    this.bufferArray.paginator = this.paginator;
    this.getAllRoles(serviceID, providerServiceMapID, userID);
    this.availableRoles = [];
    this.RolesList = [];
  }

  removeRole(rowIndex: any, roleIndex: any) {
    this.bufferArray.data[rowIndex].roleID1.splice(roleIndex, 1);
    this.bufferArray.paginator = this.paginator;
    this.getAllRoles(
      this.bufferArray.data[rowIndex].serviceID,
      this.bufferArray.data[rowIndex].providerServiceMapID,
      this.bufferArray.data[rowIndex].userID,
    );
    if (this.bufferArray.data[rowIndex].roleID1.length === 0) {
      this.bufferArray.data.splice(rowIndex, 1);
      this.bufferArray.paginator = this.paginator;
    }
  }

  saveWorkLocations() {
    console.log(this.bufferArray, 'Request Object');
    const requestArray = [];
    const workLocationObj = {
      previleges: [
        {
          ID: [
            {
              roleID: '',
              isSanjeevani: '',
              inbound: '',
              outbound: '',
            },
          ],
          providerServiceMapID: '',
          workingLocationID: '',
          blockID: '',
          blockName: '',
        },
      ],
      userID: '',
      createdBy: '',
      serviceProviderID: this.serviceProviderID,
    };

    for (let i = 0; i < this.bufferArray.data.length; i++) {
      const allRoleArr = [];
      if (this.Role) {
        this.Role.filter((item: any) => {
          allRoleArr.push(item.roleName);
        });
      }
      const workLocationObj = {
        previleges: [
          {
            ID: [
              {
                roleID: this.bufferArray.data[i].roleID1[0].roleID1,

                isSanjeevani: this.bufferArray.data[i].isSanjeevani[0],

                inbound:
                  this.bufferArray.data[i].serviceName === '1097'
                    ? this.bufferArray.data[i].Inbound
                    : null,

                outbound:
                  this.bufferArray.data[i].serviceName === '1097'
                    ? this.bufferArray.data[i].Outbound
                    : null,
              },
            ],

            providerServiceMapID: this.bufferArray.data[i].providerServiceMapID,

            workingLocationID: this.bufferArray.data[i].workingLocationID,

            blockID: this.bufferArray.data[i].blockID,

            blockName: this.bufferArray.data[i].blockName,

            villageID: this.bufferArray.data[i].villageID,

            villageName: this.bufferArray.data[i].villageName,
          },
        ],

        userID: this.bufferArray.data[i].userID,

        createdBy: this.createdBy,

        serviceProviderID: this.serviceProviderID,
      };

      requestArray.push(workLocationObj);
    }

    console.log(requestArray, 'after modification array');

    this.bufferArray.data = [];
    this.bufferArray.paginator = this.paginator;

    this.worklocationmapping
      .SaveWorkLocationMapping(requestArray)

      .subscribe(
        (response: any) => {
          console.log(response, 'after successful mapping of work-location');

          this.alertService.alert('Mapping saved successfully', 'success');

          this.getAllMappedWorkLocations();

          this.eForm.resetForm();

          this.showTable();

          this.resetAllArrays();

          this.disableSelectRoles = false;

          this.filteredStates = [];

          this.bufferArray.data = [];
          this.bufferArray.paginator = this.paginator;
        },
        (err: any) => {
          console.log(err, 'ERROR');

          console.log(err, 'error');
        },
      );
  }

  //################### EDIT SECTION ##########################

  userID_duringEdit: any;

  stateID_duringEdit: any;

  providerServiceMapID_duringEdit: any;

  district_duringEdit: any;

  workLocationID_duringEdit: any;

  roleID_duringEdit: any;

  serviceID_duringEdit: any;

  isInboundEdit = false;

  isOutboundEdit = false;

  isNational_edit = false;

  set_currentPSM_ID_duringEdit(psmID: any) {
    this.providerServiceMapID_duringEdit = psmID;
  }

  editRow(rowObject: any) {
    this.showEditForm();

    this.edit = true;

    this.disableUsername = true;

    this.edit_Details = rowObject;

    this.userID_duringEdit = rowObject.userID;

    console.log('TO BE EDITED REQ OBJ', this.edit_Details);

    this.uSRMappingID = rowObject.uSRMappingID;

    this.workLocationID_duringEdit = parseInt(
      this.edit_Details.workingLocationID,
      10,
    );

    this.userID_duringEdit = this.edit_Details.userID;

    this.stateID_duringEdit = this.edit_Details.stateID;

    this.providerServiceMapID_duringEdit =
      this.edit_Details.providerServiceMapID;

    this.district_duringEdit = parseInt(
      this.edit_Details.workingDistrictID,
      10,
    );

    this.roleID_duringEdit = this.edit_Details.roleID;

    this.serviceID_duringEdit = this.edit_Details.serviceID;

    this.isInboundEdit = this.edit_Details.inbound;

    this.isSanjeevani = this.edit_Details.isSanjeevani;

    this.isOutboundEdit = this.edit_Details.outbound;

    if (
      this.edit_Details.serviceName === '1097' &&
      !(this.edit_Details.roleName.toLowerCase() === 'supervisor')
    ) {
      this.showInOutBoundEdit = true;
    } else if (
      this.edit_Details.serviceName === 'HWC' &&
      this.edit_Details.roleName.toLowerCase() === 'nurse'
    ) {
      if (
        this.edit_Details.isSanjeevani !== undefined &&
        this.edit_Details.isSanjeevani !== null &&
        this.edit_Details.isSanjeevani === true
      ) {
        this.eSanjivaniEditFlag = true;

        this.eSanjeevaniEdit = true;
      } else {
        this.eSanjivaniEditFlag = true;

        this.eSanjeevaniEdit = false;
      }
    } else {
      this.showInOutBoundEdit = false;

      this.eSanjivaniEditFlag = false;

      this.eSanjeevaniEdit = false;
    }

    this.getProviderServices(this.userID);

    this.checkService_forIsNational();

    this.getProviderStates_duringPatchEdit(
      this.serviceID_duringEdit,
      this.isNational_edit,
    );

    if (this.edit_Details.stateID === undefined) {
      this.set_currentPSM_ID_duringEdit(this.edit_Details.providerServiceMapID);

      this.stateID_duringEdit = '';

      this.district_duringEdit = null;

      this.getAllWorkLocations_duringEdit2(
        this.states_array[0].stateID,
        this.serviceID_duringEdit,
        this.isNational_edit,
        this.district_duringEdit,
        this.providerServiceMapID_duringEdit,
        this.userID_duringEdit,
      );
    } else {
      this.getAllDistricts_duringEdit2(
        this.edit_Details.stateID,
        this.stateID_duringEdit,
        this.serviceID_duringEdit,
        this.isNational_edit,
        this.district_duringEdit,
        this.providerServiceMapID_duringEdit,
        this.userID_duringEdit,
      );
    }
  }

  getAllDistricts_duringEdit2(
    state: any,
    stateID: any,
    serviceID: any,
    isNational_edit: any,
    districtID: any,
    psmID: any,
    userID: any,
  ) {
    this.worklocationmapping
      .getAllDistricts(state)

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all districts success handeler');

            this.districts_array = response.data;

            this.getAllWorkLocations_duringEdit2(
              stateID,
              serviceID,
              isNational_edit,
              districtID,
              psmID,
              userID,
            );
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllWorkLocations_duringEdit2(
    stateID: any,
    serviceID: any,
    isNational_edit: any,
    districtID: any,
    psmID: any,
    userID: any,
  ) {
    this.worklocationmapping
      .getAllWorkLocations(
        this.serviceProviderID,
        stateID,
        serviceID,
        isNational_edit,
        districtID,
      )

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(
              response,
              'get all work locations success handeler edit',
            );

            this.workLocationsList = response.data;

            this.getAllRoles_duringEdit2(serviceID, psmID, userID);
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllRoles_duringEdit2(serviceID: any, psmID: any, userID: any) {
    this.worklocationmapping
      .getAllRoles(psmID)

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all roles success handeler');

            this.RolesList = response.data;

            this.checkExistance(serviceID, psmID, userID);
          }

          if (this.edit_Details !== undefined) {
            if (this.RolesList) {
              const edit_role = this.RolesList.filter((mappedRole: any) => {
                if (this.edit_Details.roleID === mappedRole.roleID) {
                  return mappedRole;
                }
              })[0];

              if (edit_role) {
                this.availableRoles.push(edit_role);
              }
            }
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  checkService_forIsNational() {
    for (let i = 0; i < this.services_array.length; i++) {
      if (
        this.serviceID_duringEdit === this.services_array[i].serviceID &&
        this.services_array[i].isNational
      ) {
        this.isNational_edit = this.services_array[i].isNational;

        break;
      } else {
        this.isNational_edit = false;
      }
    }
  }

  setIsNational_edit(value: any) {
    this.isNational_edit = value;
  }

  getProviderServices_edit(userID: any) {
    this.worklocationmapping
      .getServices(this.userID)

      .subscribe(
        (response: any) => this.getServicesSuccessHandeler(response.data),
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getServicesSuccessHandeler(response: any) {
    if (response) {
      console.log('Provider Services in State', response);

      this.services_array = response.data;
    }
  }

  getProviderStates_duringEdit(serviceID: any, isNational: any) {
    this.worklocationmapping
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) =>
          this.getStatesSuccessHandeler_duringEdit(
            serviceID,
            response.data,
            isNational,
            true,
          ),
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getProviderStates_duringPatchEdit(serviceID: any, isNational: any) {
    this.worklocationmapping
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) =>
          this.getStatesSuccessHandeler_duringEdit(
            serviceID,
            response,
            isNational,
            false,
          ),
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getStatesSuccessHandeler_duringEdit(
    serviceID: any,
    response: any,
    isNational: any,
    blockVillageCheckFlag: any,
  ) {
    if (response) {
      console.log(response, 'Provider States');

      this.states_array = response.data;

      this.districts_array = [];

      this.workLocationsList = [];

      this.RolesList = [];

      this.availableRoles = [];

      if (isNational) {
        this.set_currentPSM_ID_duringEdit(
          this.states_array[0].providerServiceMapID,
        );

        this.stateID_duringEdit = '';

        this.district_duringEdit = null;

        this.getAllWorkLocations_duringEdit(
          this.states_array[0].stateID,
          this.serviceID_duringEdit,
          this.isNational_edit,
          this.district_duringEdit,
        );

        this.getAllRoles_duringEdit(
          serviceID,
          this.providerServiceMapID_duringEdit,
          this.userID_duringEdit,
        );
      }

      if (blockVillageCheckFlag === true) {
        this.getAllDistricts_duringEdit(this.stateID_duringEdit);
      } else {
        this.getAllDistricts_duringPatchEdit(this.stateID_duringEdit);
      }
    }
  }

  refresh1() {
    this.district_duringEdit = undefined;

    this.workLocationID_duringEdit = undefined;
    this.roleID_duringEdit = undefined;
  }

  refresh2() {
    this.refresh3();
  }

  refresh3() {
    this.district_duringEdit = undefined;

    this.workLocationID_duringEdit = undefined;

    this.roleID_duringEdit = undefined;
  }

  refresh5() {
    this.workLocationID_duringEdit = undefined;

    this.roleID_duringEdit = undefined;
  }

  refresh4() {
    this.roleID_duringEdit = undefined;
  }

  getAllDistricts_duringEdit(state: any) {
    this.worklocationmapping
      .getAllDistricts(state)

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all districts success handeler');

            this.districts_array = response.data;
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllDistricts_duringPatchEdit(state: any) {
    this.worklocationmapping
      .getAllDistricts(state)

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all districts success handeler');

            this.districts_array = response.data;

            this.district_duringEdit = parseInt(
              this.edit_Details.workingDistrictID,
              10,
            );

            if (
              this.edit_Details.serviceName === 'FLW' ||
              this.edit_Details.serviceName === 'HWC' ||
              this.edit_Details.serviceName === 'TM' ||
              this.edit_Details.serviceName === 'MMU'
            ) {
              this.getEditBlockPatchMaster(this.district_duringEdit);
            }
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllWorkLocations_duringEdit(
    stateID: any,
    serviceID: any,
    isNational_edit: any,
    districtID: any,
  ) {
    this.worklocationmapping
      .getAllWorkLocations(
        this.serviceProviderID,
        stateID,
        serviceID,
        isNational_edit,
        districtID,
      )

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(
              response,
              'get all work locations success handeler edit',
            );

            this.workLocationsList = response.data;
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  getAllRoles_duringEdit(serviceID: any, psmID: any, userID: any) {
    this.worklocationmapping
      .getAllRoles(psmID)

      .subscribe(
        (response: any) => {
          if (response) {
            console.log(response, 'get all roles success handeler');

            this.RolesList = response.data;

            this.checkExistance(serviceID, psmID, userID);
          }

          //on edit - populate roles

          if (this.edit_Details !== undefined) {
            if (this.RolesList) {
              const edit_role = this.RolesList.filter((mappedRole: any) => {
                if (this.edit_Details.roleID === mappedRole.roleID) {
                  return mappedRole;
                }
              })[0];

              if (edit_role) {
                this.availableRoles.push(edit_role);
              }
            }
          }
        },
        (err: any) => {
          console.log(err, 'error');
        },
      );
  }

  updateWorkLocation(workLocations: any) {
    const duplicate: boolean =
      this.checkHWCDuplicateMainArrayForEditScreen(workLocations);
    if (workLocations.serviceID === 1) {
      const updateRoleName = this.RolesList.filter((response: any) => {
        if (workLocations.role === response.roleID) {
          return response;
        }
      })[0];

      if (
        (this.isInboundEdit === false ||
          this.isInboundEdit === null ||
          this.isInboundEdit === undefined) &&
        (this.isOutboundEdit === false ||
          this.isOutboundEdit === null ||
          this.isOutboundEdit === undefined) &&
        !(updateRoleName.roleName.toLowerCase() === 'supervisor')
      ) {
        this.alertService.alert('Select checkbox Inbound/Outbound/Both');
      } else {
        this.updateData(workLocations, updateRoleName.roleName);
      }
    } else if (workLocations.serviceID === 9 && duplicate === true) {
      this.alertService.alert('Same User already Mapped with different State');
    } else {
      const editVillageIdArray: any = [];

      if (
        this.serviceEditvillage !== undefined &&
        this.serviceEditvillage !== null &&
        this.serviceEditvillage.length > 0
      ) {
        this.serviceEditvillage.filter((item: any) => {
          this.editVillageArr.filter((itemValue: any) => {
            if (item === itemValue.villageName) {
              editVillageIdArray.push(itemValue.districtBranchID);
            }
          });
        });
      }

      const langObj = {
        uSRMappingID: this.uSRMappingID,

        userID: this.userID_duringEdit,

        roleID: workLocations.role,

        isSanjeevani: this.isSanjeevani,

        providerServiceMapID: this.providerServiceMapID_duringEdit,

        blockID: this.ServiceEditblock,

        blockName: this.blockname,

        villageID: editVillageIdArray,

        villageName: this.serviceEditvillage,

        workingLocationID: workLocations.worklocation,

        modifiedBy: this.createdBy,
      };

      console.log('edited request object to be sent to API', langObj);

      this.worklocationmapping
        .UpdateWorkLocationMapping(langObj)

        .subscribe(
          (response: any) => {
            console.log(
              response,
              'after successful mapping of work location to provider',
            );

            this.alertService.alert('Mapping updated successfully', 'success');

            this.showTable();

            this.getAllMappedWorkLocations();

            this.bufferArray.data = [];
            this.bufferArray.paginator = this.paginator;
          },
          (err: any) => {
            console.log(err, 'ERROR');
          },
        );
    }
  }

  updateData(workLocations: any, roleValue: any) {
    const langObj = {
      uSRMappingID: this.uSRMappingID,

      userID: this.userID_duringEdit,

      roleID: workLocations.role,

      isSanjeevani: this.isSanjeevani,

      inbound:
        roleValue.toLowerCase() === 'supervisor' ? false : this.isInboundEdit,

      outbound:
        roleValue.toLowerCase() === 'supervisor' ? false : this.isOutboundEdit,

      providerServiceMapID: this.providerServiceMapID_duringEdit,

      workingLocationID: workLocations.worklocation,

      modifiedBy: this.createdBy,
    };

    console.log('edited request object to be sent to API', langObj);

    this.worklocationmapping
      .UpdateWorkLocationMapping(langObj)

      .subscribe(
        (response: any) => {
          console.log(
            response,
            'after successful mapping of work location to provider',
          );

          this.alertService.alert('Mapping updated successfully', 'success');

          this.showTable();

          this.getAllMappedWorkLocations();

          this.bufferArray.data = [];
          this.bufferArray.paginator = this.paginator;
        },
        (err: any) => {
          console.log(err, 'ERROR');
        },
      );
  }
  checkHWCDuplicateMainArrayForEditScreen(workLocations: any) {
    let result = false;
    if (this.mappedWorkLocationsList.length !== 0) {
      this.mappedWorkLocationsList.forEach((mappedWorkLocations: any) => {
        if (
          mappedWorkLocations.serviceID === 9 &&
          workLocations.state !== mappedWorkLocations.stateID &&
          workLocations.district !== mappedWorkLocations.workingDistrictID &&
          workLocations.ServiceEditblock !== mappedWorkLocations.blockID &&
          mappedWorkLocations.userID === this.userID_duringEdit &&
          mappedWorkLocations.uSRMappingID !== this.uSRMappingID
        ) {
          if (!mappedWorkLocations.userServciceRoleDeleted) {
            result = true;
          }
        }
      });
    }
    return result;
  }

  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredmappedWorkLocationsList.data = this.mappedWorkLocationsList;
      this.filteredmappedWorkLocationsList.paginator = this.paginator;
    } else {
      this.filteredmappedWorkLocationsList.data = [];
      this.mappedWorkLocationsList.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'userName' ||
            key === 'serviceName' ||
            key === 'stateName' ||
            key === 'workingDistrictName' ||
            key === 'blockName' ||
            key === 'villageName' ||
            key === 'locationName' ||
            key === 'roleName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredmappedWorkLocationsList.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredmappedWorkLocationsList.paginator = this.paginator;
    }
  }

  resetAllFields() {
    this.State = undefined;
    this.Serviceline = undefined;
    this.District = undefined;
    this.WorkLocation = undefined;
    this.Role = undefined;
    this.resetAllArrays();
    this.disableSelectRoles = false;
    this.blockFlag = false;
    this.villageFlag = false;
    this.Serviceblock = undefined;
    this.Servicevillage = undefined;
    this.eSanjivaniFlag = false;
    this.isSanjeevani = false;
  }

  resetBlockVillageFields() {
    this.Serviceblock = undefined;
    this.Servicevillage = undefined;
  }

  resetEditBlockVillageFields() {
    this.ServiceEditblock = undefined;
    this.serviceEditvillage = undefined;
  }

  showInboundOutbound(value: any) {
    this.isInbound = false;
    this.isOutbound = false;
    if (value === '1097') this.showInOutBound = true;
    else this.showInOutBound = false;
  }

  setInbound(event: any) {
    if (!event.checked) {
      this.isInbound = false;
    } else this.isInbound = true;
  }

  setOutbound(event: any) {
    if (!event.checked) {
      this.isOutbound = false;
    } else this.isOutbound = true;
  }

  showInboundOutboundEdit(value: any, role: any) {
    const editRoleName = this.RolesList.filter((response: any) => {
      if (role === response.roleID) {
        return response;
      }
    })[0];

    this.isInboundEdit = false;
    this.isOutboundEdit = false;
    if (value === 1 && !(editRoleName.roleName.toLowerCase() === 'supervisor'))
      this.showInOutBoundEdit = true;
    else this.showInOutBoundEdit = false;
  }

  showBlockDrop(serviceline: any) {
    if (
      serviceline === 'FLW' ||
      serviceline === 'HWC' ||
      serviceline === 'TM' ||
      serviceline === 'MMU'
    ) {
      this.blockFlag = true;
      this.villageFlag = true;
    } else {
      this.blockFlag = false;
      this.villageFlag = false;
    }
  }

  showEditBlockDrop(serviceID_duringEdit: any) {
    if (
      serviceID_duringEdit !== 'FLW' ||
      serviceID_duringEdit !== 'HWC' ||
      serviceID_duringEdit !== 'TM' ||
      serviceID_duringEdit !== 'MMU'
    ) {
      this.enableEditBlockFlag = false;
      this.enableEditVillageFlag = false;
      this.ServiceEditblock = null;
      this.blockname = null;
      this.villageIdValue = null;
      this.serviceEditvillage = null;
    } else {
      this.enableEditBlockFlag = true;
      this.enableEditVillageFlag = true;
    }
  }

  getBlockMaster(District: any) {
    this.villagemasterService.getTaluks(District.districtID).subscribe(
      (response: any) => this.getTalukSuccessHandeler(response.data),
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getTalukSuccessHandeler(response: any) {
    if (response) {
      this.blockId = response[0].blockID;
      this.blocks = response;
    }
  }

  getVillageMaster(Serviceblock: any) {
    const requestObject = {
      blockID: Serviceblock.blockID,
    };
    this.villagemasterService.getVillage(requestObject).subscribe(
      (response: any) => this.getVillageSuccessHandeler(response),
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getVillageSuccessHandeler(response: any) {
    if (response) {
      this.village = response.data;
    }
  }

  getEditBlockMaster(district_duringEdit: any) {
    this.villagemasterService.getTaluks(district_duringEdit).subscribe(
      (response: any) => {
        if (response && response.data) {
          // console.log('this.searchForm', this.searchForm.valid, this.searchForm.value);
          this.editblocks = response.data;
        }
      },
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getEditBlockPatchMaster(district_duringEdit: any) {
    this.villagemasterService.getTaluks(district_duringEdit).subscribe(
      (response: any) => {
        if (response && response.data) {
          // console.log('this.searchForm', this.searchForm.valid, this.searchForm.value);
          this.editblocks = response.data;
          this.ServiceEditblock = this.edit_Details.blockID;
          this.blockname = this.edit_Details.blockName;
          this.enableEditBlockFlag = true;
          this.getEditVillagePatchMaster(this.ServiceEditblock);
        }
      },
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getEditVillageMaster(ServiceEditblock: any) {
    const requestObject = {
      blockID: ServiceEditblock,
    };
    this.villagemasterService.getVillage(requestObject).subscribe(
      (response: any) => this.getEditVillageSuccessHandeler(response),
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getEditVillageSuccessHandeler(response: any) {
    if (response && response.data) {
      this.editVillageArr = response.data;
    }
  }

  getEditVillagePatchMaster(ServiceEditblock: any) {
    const requestObject = {
      blockID: ServiceEditblock,
    };
    this.villagemasterService.getVillage(requestObject).subscribe(
      (response: any) => this.getEditPatchVillageSuccessHandeler(response),
      (err: any) => {
        console.log('Error', err);
      },
    );
  }

  getEditPatchVillageSuccessHandeler(response: any) {
    if (response && response.data) {
      this.editVillageArr = response.data;
      this.enableEditVillageFlag = true;
      this.villageIdValue = this.edit_Details.villageID;
      this.serviceEditvillage = this.edit_Details.villageName;
    }
  }

  setUpdatedBlockName(blockname: any) {
    this.blockname = blockname;
  }
  eSanjeevaniSaveFunction(source: string, selectedItem: any): void {
    this.eSanjivaniFlag = false;
    if (source === 'Serviceline') {
      this.eSanjivaniFlag = false;
      // Handle Serviceline selection change
      this.handleSelectionChanges();
    } else if (source === 'Role') {
      this.eSanjivaniFlag = false;
      // Handle Role selection change
      this.handleSelectionChanges();
    }
  }

  handleSelectionChanges() {
    const roleSanjArry: any = [];
    if (this.Role !== undefined) {
      this.Role.filter((item: any) => {
        roleSanjArry.push(item.roleName.toLowerCase());
      });
    }

    if (
      this.Serviceline.serviceName === 'HWC' &&
      roleSanjArry.includes('nurse')
    ) {
      this.eSanjivaniFlag = true;
    }
  }

  onESanjeevaniChange(event: any) {
    if (event.checked) {
      this.isSanjeevani = true;
    } else {
      this.isSanjeevani = false;
    }
  }

  eSanjeevaniEditSaveFunction(value: any, role: any) {
    const editRoleName = this.RolesList.filter((response: any) => {
      if (role === response.roleID) {
        return response;
      }
    })[0];

    this.eSanjeevaniEdit = false;
    if (
      (this.edit_Details.serviceName === 'TM' ||
        this.edit_Details.serviceName === 'HWC') &&
      editRoleName.roleName.toLowerCase() === 'Nurse'
    )
      this.eSanjivaniEditFlag = true;
    else this.eSanjivaniEditFlag = false;
  }

  checkHWCDuplicateBufferArray() {
    let result = false;
    if (this.bufferArray.data.length > 0) {
      this.bufferArray.data.forEach((bufferArrayList: any) => {
        if (
          bufferArrayList.serviceName === 'HWC' &&
          this.State.stateName !== bufferArrayList.stateName &&
          this.District.districtName !== bufferArrayList.district &&
          this.Serviceblock.blockID !== bufferArrayList.blockID &&
          bufferArrayList.userID === this.User.userID
        ) {
          result = true;
        }
      });
    }
    return result;
  }
  checkHWCDuplicateMainArray() {
    let result = false;

    if (this.mappedWorkLocationsList.length !== 0) {
      this.mappedWorkLocationsList.forEach((mappedWorkLocations: any) => {
        if (
          mappedWorkLocations.serviceName === 'HWC' &&
          this.State.stateName !== mappedWorkLocations.stateName &&
          this.District.districtName !==
            mappedWorkLocations.workingDistrictName &&
          this.Serviceblock.blockID !== mappedWorkLocations.blockID &&
          mappedWorkLocations.userID === this.User.userID
        ) {
          if (!mappedWorkLocations.userServciceRoleDeleted) {
            result = true;
          }
        }
      });
    }
    return result;
  }
}
