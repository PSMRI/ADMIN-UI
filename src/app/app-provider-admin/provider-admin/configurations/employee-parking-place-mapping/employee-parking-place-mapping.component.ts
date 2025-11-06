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

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { EmployeeParkingPlaceMappingService } from '../../activities/services/employee-parking-place-mapping.service';
import { ProviderAdminRoleService } from '../../activities/services/state-serviceline-role.service';
import { MatDialog } from '@angular/material/dialog';
import { MappedVansComponent } from '../mapped-vans/mapped-vans.component';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { MatSort } from '@angular/material/sort';

@Component({
  selector: 'app-employee-parking-place-mapping',
  templateUrl: './employee-parking-place-mapping.component.html',
})
export class EmployeeParkingPlaceMappingComponent
  implements OnInit, AfterViewInit
{
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  [x: string]: any;
  filteredavailableEmployeeParkingPlaceMappings = new MatTableDataSource<any>();
  employeeParkingPlaceMappingList = new MatTableDataSource<any>();

  // filteredavailableEmployeeParkingPlaceMappings: any = [];
  searchParkingPlaceID_edit: any;
  designationID_edit: any;
  editMode = false;
  userName: any;
  serviceline: any;
  userParkingPlaceMapID: any;
  formMode = false;
  tableMode = false;
  services_array: any = [];
  userID: any;
  createdBy: any;
  showEmployeeParkingPlaceMappings: any = true;
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  service_provider_id: any;
  editable: any = false;
  countryID: any;
  searchStateID: any;
  district: any;
  parking_Place: any;
  serviceID: any;
  parkAndHub: any;
  login_userID: any;
  vanUnderPP: any;

  formBuilder: FormBuilder = new FormBuilder();
  MappingForm!: FormGroup;
  zoneID: any;
  talukID: any;
  zones: any = [];
  taluks: any = [];
  availableParkingPlaces: any = [];
  availableVans: any = [];
  mappedVans: any = [];
  enableVanField = true;
  displayedColumns: string[] = [
    'SNo',
    'parkingPlaceName',
    'designationName',
    'userName',
    'view',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'parkingPlaceName',
    'designationName',
    'userName',
    'edit',
  ];
  @ViewChild('resetform1')
  resetform1!: NgForm;
  @ViewChild('searchForm')
  searchForm!: NgForm;
  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    private dialog: MatDialog,
    public employeeParkingPlaceMappingService: EmployeeParkingPlaceMappingService,
    private alertMessage: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.data = [];
    this.service_provider_id =
      this.sessionstorage.getItem('service_providerID');
    this.countryID = 1; // hardcoded as country is INDIA
    this.serviceID = this.commonDataService.serviceIDMMU;
    this.createdBy = this.commonDataService.uname;
    this.login_userID = this.commonDataService.uid;
  }

  ngAfterViewInit() {
    this.filteredavailableEmployeeParkingPlaceMappings.paginator =
      this.paginatorSecond;
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
  }

  ngOnInit() {
    this.MappingForm = this.formBuilder.group({
      mappings: this.formBuilder.array([]),
    });
    this.getProviderServices();
  }
  getProviderServices() {
    this.employeeParkingPlaceMappingService
      .getServices(this.login_userID)
      .subscribe(
        (response: any) => {
          // this.services_array = response;
          this.services_array = response.data.filter(function (item: any) {
            console.log('item', item);
            if (
              item.serviceID === 4 ||
              item.serviceID === 2 ||
              item.serviceID === 9
            )
              return item;
          });
        },
        (err) => {},
      );
  }
  getStates(serviceID: any) {
    if (serviceID === 4) {
      this.parkAndHub = 'Hub';
    } else {
      this.parkAndHub = 'Parking Place';
    }
    this.employeeParkingPlaceMappingService
      .getStates(this.login_userID, serviceID, false)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, false),
        (err) => {},
      );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response.data, 'Provider States');
      this.provider_states = response.data;
      this.availableEmployeeParkingPlaceMappings = [];
      this.filteredavailableEmployeeParkingPlaceMappings.data = [];
      this.filteredavailableEmployeeParkingPlaceMappings.paginator =
        this.paginatorSecond;
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.zones = [];
    this.availableParkingPlaces = [];
    this.taluks = [];
    this.filteredavailableEmployeeParkingPlaceMappings.data = [];
    this.filteredavailableEmployeeParkingPlaceMappings.paginator =
      this.paginatorSecond;
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }
  getAvailableZones(providerServiceMapID: any) {
    this.employeeParkingPlaceMappingService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe((response: any) => this.getZonesSuccessHandler(response));
  }
  getZonesSuccessHandler(response: any) {
    if (response.data !== undefined) {
      for (const zone of response.data) {
        if (!zone.deleted) {
          this.zones.push(zone);
        }
      }
    }
  }
  getAllParkingPlaces(zoneID: any, providerServiceMapID: any) {
    const parkingPlaceObj = {
      zoneID: zoneID,
      providerServiceMapID: providerServiceMapID,
    };
    this.employeeParkingPlaceMappingService
      .getParkingPlaces(parkingPlaceObj)
      .subscribe((response: any) =>
        this.getParkingPlaceSuccessHandler(response),
      );
  }
  getParkingPlaceSuccessHandler(response: any) {
    this.availableParkingPlaces = response.data;
    this.availableEmployeeParkingPlaceMappings = [];
    this.filteredavailableEmployeeParkingPlaceMappings.data = [];
    this.filteredavailableEmployeeParkingPlaceMappings.paginator =
      this.paginatorSecond;
    for (const availableParkingPlaces of this.availableParkingPlaces) {
      if (availableParkingPlaces.deleted) {
        const index: number = this.availableParkingPlaces.indexOf(
          availableParkingPlaces,
        );
        if (index !== -1) {
          this.availableParkingPlaces.splice(index, 1);
        }
      }
    }
    if (this.editParkingPlaceValue !== undefined) {
      const parkingPlaceUpdate = this.availableParkingPlaces.filter(
        (parkingPlaceResponse: any) => {
          if (
            this.editParkingPlaceValue.parkingPlaceID ===
            parkingPlaceResponse.parkingPlaceID
          ) {
            return parkingPlaceResponse;
          }
        },
      )[0];
      if (parkingPlaceUpdate) {
        this.parking_Place = parkingPlaceUpdate;
      }
    }
  }
  designations: any;
  getDesignations() {
    this.employeeParkingPlaceMappingService
      .getDesignations()
      .subscribe((response: any) =>
        this.getDesignationsSuccessHandeler(response),
      );
  }
  getDesignationsSuccessHandeler(response: any) {
    this.filteredavailableEmployeeParkingPlaceMappings.data = [];
    this.filteredavailableEmployeeParkingPlaceMappings.paginator =
      this.paginatorSecond;
    this.designations = response.data;
    this.employeeParkingPlaceMappingList.data = [];
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
    console.log('designation', response.data);
  }
  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
  }
  showForm(searchStateID: any, parkingPlaceID: any, designationID: any) {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
    this.employeeParkingPlaceMappingList.data = [];
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
    this.getUsernames(
      searchStateID.providerServiceMapID,
      designationID.designationID,
    );
  }
  showEdit() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }
  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showTable();
          this.employeeParkingPlaceMappingList.data = [];
          this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
          this.getEmployeeParkingPlaceMappings(
            this.searchStateID,
            this.designationID.designationID,
          );
        }
      });
  }

  employeeObj: any = {};
  getEmployeeParkingPlaceMappings(searchStateID: any, designationID: any) {
    this.userID = null;
    this.vanUnderPP = [];
    this.employeeObj = {};
    this.employeeObj.providerServiceMapID = searchStateID.providerServiceMapID;
    this.employeeObj.parkingPlaceID =
      this.parking_Place.parkingPlaceID === undefined
        ? this.parking_Place
        : this.parking_Place.parkingPlaceID;
    this.employeeObj.designationID = designationID;
    this.employeeParkingPlaceMappingService
      .getEmployees(this.employeeObj)
      .subscribe((response: any) =>
        this.getEmployeeParkingPlaceMappingsSuccessHandler(response),
      );
  }
  availableEmployeeParkingPlaceMappings: any = [];
  remainingMaps: any = [];
  getEmployeeParkingPlaceMappingsSuccessHandler(response: any) {
    this.tableMode = true;
    this.availableEmployeeParkingPlaceMappings = [];
    this.filteredavailableEmployeeParkingPlaceMappings.data = [];
    this.availableEmployeeParkingPlaceMappings = response.data;
    this.filteredavailableEmployeeParkingPlaceMappings.data = response.data;
    this.filteredavailableEmployeeParkingPlaceMappings.paginator =
      this.paginatorSecond;
    this.filteredavailableEmployeeParkingPlaceMappings.sort = this.sort;
  }
  parkingPlaceID: any;
  selectedParkingPlace(
    serviceID: any,
    parkingPlace: any,
    providerServiceMapID: any,
    designationID: any,
  ) {
    this.parkingPlaceID = parkingPlace;
    if (
      designationID.designationName === 'TC Specialist' ||
      designationID.designationName === 'Supervisor'
    ) {
      this.enableVanField = false;
    } else {
      this.enableVanField = true;
    }
    this.getUsernames(providerServiceMapID, designationID.designationID);
    this.getVans(providerServiceMapID, parkingPlace);
  }

  parkingPlaceIDList: any = [];

  getUsernames(providerServiceMapID: any, designationID: any) {
    console.log('this.userID', this.userID);
    const userObj = {
      providerServiceMapID: providerServiceMapID,
      designationID: designationID,
    };
    this.employeeParkingPlaceMappingService
      .getUsernames(userObj)
      .subscribe((response: any) => this.getuserNamesSuccessHandeler(response));
  }
  userNames: any = [];
  bufferEmployeeArray: any = [];
  getuserNamesSuccessHandeler(response: any) {
    this.userNames = response.data;
    console.log('userNames', response.data);
    if (!this.editable) {
      if (this.employeeParkingPlaceMappingList.data.length > 0) {
        this.employeeParkingPlaceMappingList.data.forEach(
          (employeeParkingMap: any) => {
            this.bufferEmployeeArray.push(employeeParkingMap.userID);
          },
        );
      }
      const bufferTemp: any = [];
      this.userNames.forEach((username: any) => {
        const index = this.bufferEmployeeArray.indexOf(username.userID);
        if (index < 0) {
          bufferTemp.push(username);
        }
      });
      this.userNames = bufferTemp.slice();
      this.bufferEmployeeArray = [];
    }

    if (this.editParkingPlaceValue !== undefined) {
      const userNameUpdate = this.userNames.filter((userResponse: any) => {
        if (
          this.editParkingPlaceValue.userID === userResponse.userID &&
          this.editParkingPlaceValue.designationID ===
            this.designationID.designationID
        ) {
          return userResponse;
        }
      })[0];
      if (userNameUpdate) {
        this.userID = userNameUpdate;
        this.userNames.push(userNameUpdate);
      }
    }
  }
  viewVanListDetails(mappedVans: any) {
    this.dialog.open(MappedVansComponent, {
      width: '60%',
      data: {
        vanListDetails: mappedVans,
      },
    });
  }
  getVans(providerServiceMapID: any, parkingPlaceID: any) {
    const vanObj = {
      providerServiceMapID: providerServiceMapID,
      parkingPlaceID: parkingPlaceID,
    };
    this.employeeParkingPlaceMappingService
      .getVans(vanObj)
      .subscribe((response: any) => {
        this.availableVans = response.data;
        if (this.editMode) {
          this.getMappedVans(this.userParkingPlaceMapID);
        }
      });
  }

  deleteRow(i: any) {
    this.employeeParkingPlaceMappingList.data.splice(i, 1);
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
    this.getUsernames(
      this.searchStateID.providerServiceMapID,
      this.designationID.designationID,
    );
  }
  removeRole(rowIndex: any, vanIndex: any) {
    this.employeeParkingPlaceMappingList.data[rowIndex].uservanmapping.splice(
      vanIndex,
      1,
    );
    if (
      this.employeeParkingPlaceMappingList.data[rowIndex].uservanmapping
        .length === 0
    ) {
      this.employeeParkingPlaceMappingList.data.splice(rowIndex, 1);
      this.getUsernames(
        this.searchStateID.providerServiceMapID,
        this.designationID.designationID,
      );
    }
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
  }
  vanlist: any = [];
  addParkingPlaceMapping(objectToBeAdded: any) {
    console.log(objectToBeAdded, 'FORM VALUES');
    this.vanlist = [];
    if (objectToBeAdded.vanUnderPP !== undefined) {
      objectToBeAdded.vanUnderPP.forEach((vanID: any) => {
        const vanObj = {
          vanID: vanID.vanID,
          vanName: vanID.vanName,
        };
        this.vanlist.push(vanObj);
      });
    }
    const parkingObj: any = {
      stateID: this.searchStateID.stateID,
      stateName: this.searchStateID.stateName,
      serviceName: this.serviceline.serviceName,
      userID: objectToBeAdded.userID.userID,
      userName: objectToBeAdded.userID.userName,
      parkingPlaceID: this.parking_Place.parkingPlaceID,
      parkingPlaceName: this.parking_Place.parkingPlaceName,
      designationID: this.designationID.designationID,
      designationName: this.designationID.designationName,
      providerServiceMapID: this.searchStateID.providerServiceMapID,
      createdBy: this.createdBy,
      uservanmapping: objectToBeAdded.vanUnderPP ? this.vanlist : [],
    };
    console.log('parkingObj', parkingObj);
    this.employeeParkingPlaceMappingList.data.push(parkingObj);
    this.employeeParkingPlaceMappingList.paginator = this.paginatorFirst;
    this.getUsernames(
      this.searchStateID.providerServiceMapID,
      this.designationID.designationID,
    );
  }
  checkDBDuplicates(parkingObj: any) {
    let dbcount = 0;

    for (
      let a = 0;
      a < this.availableEmployeeParkingPlaceMappings.length;
      a++
    ) {
      if (this.formMode) {
        if (
          this.availableEmployeeParkingPlaceMappings[a].providerServiceMapID ===
            parseInt(this.searchStateID.providerServiceMapID) &&
          this.availableEmployeeParkingPlaceMappings[a].parkingPlaceID ===
            parseInt(this.parking_Place.parkingPlaceID) &&
          this.availableEmployeeParkingPlaceMappings[a].designationID ===
            parseInt(this.designationID.designationID) &&
          this.availableEmployeeParkingPlaceMappings[a].userID ===
            parseInt(this.userID.userID)
        ) {
          dbcount = 1;
        }
      } else {
        if (
          this.availableEmployeeParkingPlaceMappings[a].providerServiceMapID ===
            parseInt(this.searchStateID.providerServiceMapID) &&
          this.availableEmployeeParkingPlaceMappings[a].parkingPlaceID ===
            parseInt(this.parking_Place) &&
          this.availableEmployeeParkingPlaceMappings[a].designationID ===
            parseInt(this.designationID) &&
          this.availableEmployeeParkingPlaceMappings[a].userID ===
            parseInt(this.userID)
        ) {
          dbcount = 1;
        }
      }
    }

    if (dbcount === 1) return false;
    else {
      dbcount = 0;
      return true;
    }
  }

  designationID: any;

  employeeID: any;
  selectedEmployee(employee: any) {
    this.employeeID = employee.employeeID;
  }

  employeeParkingPlaceMappingObj: any;
  saveParkingMpping() {
    const obj = {
      userParkingPlaceMaps: this.employeeParkingPlaceMappingList.data,
    };
    this.employeeParkingPlaceMappingService
      .saveEmployeeParkingPlaceMappings(obj)
      .subscribe((response: any) => this.saveMappingSuccessHandler(response));
  }

  saveMappingSuccessHandler(response: any) {
    if (response.data.length > 0) {
      this.alertMessage.alert(' Mapping saved successfully', 'success');
      this.getEmployeeParkingPlaceMappings(
        this.searchStateID,
        this.designationID.designationID,
      );
      this.showTable();
    }
  }
  editParkingPlaceValue: any;
  editUserDetails: any;
  mappedUserVans: any = [];
  editParkingPlace(parkingPlaceItem: any) {
    console.log('edit', parkingPlaceItem);
    if (
      parkingPlaceItem.designationName === 'TC Specialist' ||
      parkingPlaceItem.designationName === 'Supervisor'
    ) {
      this.enableVanField = false;
    } else {
      this.enableVanField = true;
    }
    this.showEdit();
    this.editParkingPlaceValue = parkingPlaceItem;
    this.userParkingPlaceMapID = parkingPlaceItem.userParkingPlaceMapID;
    (this.providerServiceMapID = parkingPlaceItem.providerServiceMapID),
      (this.parking_Place.parkingPlaceName = parkingPlaceItem.parkingPlaceName),
      (this.designationID.designationName = parkingPlaceItem.designationName),
      this.getAllParkingPlaces(
        this.zoneID.zoneID,
        parkingPlaceItem.providerServiceMapID,
      );
    this.getVans(
      parkingPlaceItem.providerServiceMapID,
      parkingPlaceItem.parkingPlaceID,
    );

    const emp = {
      userID: parkingPlaceItem.userID,
      userName: parkingPlaceItem.userName,
    };
    this.userNames = [emp];
    this.userID = emp;
  }

  getMappedVans(userParkingPlaceMapID: any) {
    this.employeeParkingPlaceMappingService
      .getMappedVansList(userParkingPlaceMapID)
      .subscribe((mappedVanResponse: any) => {
        console.log('mapped Uesrs', mappedVanResponse.data);
        if (mappedVanResponse.statusCode === 200) {
          this.mappedUserVans = mappedVanResponse.data;
          if (this.mappedUserVans.length > 0) {
            this.patchMappedVans();
          }
        }
      });
  }
  patchMappedVans() {
    this.vanUnderPP = [];
    this.mappedUserVans.map((mappedVans: any) => {
      const tempData = this.availableVans.filter((filterVan: any) => {
        return mappedVans.vanID === filterVan.vanID;
      });
      if (tempData.length > 0) {
        this.vanUnderPP.push(tempData[0]);
      }
    });
  }
  updateParkingPlace() {
    this.vanlist = [];
    this.vanUnderPP.forEach((vanID: any) => {
      const vanObj = {
        vanID: vanID.vanID,
        vanName: vanID.vanName,
      };
      this.vanlist.push(vanObj);
    });
    const parkingObj = {
      userID: this.userID.userID,
      parkingPlaceID: this.parking_Place.parkingPlaceID,
      providerServiceMapID: this.searchStateID.providerServiceMapID,
      userParkingPlaceMapID: this.userParkingPlaceMapID,
      uservanmapping: this.vanlist,
      modifiedBy: this.createdBy,
    };

    if (this.checkDBDuplicates(parkingObj)) {
      this.employeeParkingPlaceMappingService
        .updateEmployeeParkingPlaceMappings(parkingObj)
        .subscribe((response) =>
          this.updateParkingPlaceSuccessHandler(response),
        );
    } else {
      this.alertMessage.alert('Already Mapped');
    }
  }
  updateParkingPlaceSuccessHandler(response: any) {
    this.alertMessage.alert(' Mapping updated successfully', 'success');
    this.showTable();
    this.getEmployeeParkingPlaceMappings(
      this.searchStateID,
      this.designationID.designationID,
    );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableEmployeeParkingPlaceMappings.data =
        this.availableEmployeeParkingPlaceMappings;
      this.filteredavailableEmployeeParkingPlaceMappings.paginator =
        this.paginatorSecond;
    } else {
      this.filteredavailableEmployeeParkingPlaceMappings.data = [];
      this.availableEmployeeParkingPlaceMappings.forEach((item: any) => {
        for (const key in item) {
          if (key === 'userName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableEmployeeParkingPlaceMappings.data.push(
                item,
              );
              break;
            }
          }
        }
      });
      this.filteredavailableEmployeeParkingPlaceMappings.paginator =
        this.paginatorSecond;
    }
  }
  resetDesignation() {
    this.resetform1.controls['designationID'].reset();
  }
  activate(userLangID: any, userexist: any) {
    if (userexist) {
      this.alertMessage.alert('User is inactive');
    } else {
      this.alertMessage
        .confirm('Confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const object = {
              userParkingPlaceMapID: userLangID,
              deleted: false,
            };

            this.employeeParkingPlaceMappingService
              .DeleteEmpParkingMapping(object)
              .subscribe(
                (response: any) => {
                  if (response.statusCode === 200) {
                    this.alertMessage.alert(
                      'Activated successfully',
                      'success',
                    );
                    /* refresh table */
                    this.getEmployeeParkingPlaceMappings(
                      this.searchStateID,
                      this.designationID.designationID,
                    );
                  }
                },
                (err) => {
                  console.log('error', err);
                  this.alertMessage.alert(err.errorMessage, 'error');
                },
              );
          }
        });
    }
  }
  deactivate(userLangID: any) {
    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response: any) => {
        if (response) {
          const object = { userParkingPlaceMapID: userLangID, deleted: true };

          this.employeeParkingPlaceMappingService
            .DeleteEmpParkingMapping(object)
            .subscribe(
              (response: any) => {
                if (response) {
                  this.alertMessage.alert(
                    'Deactivated successfully',
                    'success',
                  );
                  /* refresh table */
                  this.getEmployeeParkingPlaceMappings(
                    this.searchStateID,
                    this.designationID.designationID,
                  );
                }
              },
              (err) => {
                console.log('error', err);
              },
            );
        }
      });
  }
}
