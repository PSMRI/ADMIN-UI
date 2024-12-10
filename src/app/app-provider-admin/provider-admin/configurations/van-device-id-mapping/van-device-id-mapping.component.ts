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
import { MatDialog } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { FetosenseDeviceIdMasterService } from '../../activities/services/fetosense-device-id-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

/**
 * Author: DE40034072
 * Date: 30-06-2021
 * Objective: # Component for mapping spoke and device ID
 */

@Component({
  selector: 'app-van-device-id-mapping',
  templateUrl: './van-device-id-mapping.component.html',
  styleUrls: ['./van-device-id-mapping.component.css'],
})
export class VanDeviceIdMappingComponent implements OnInit {
  vanSpokeMappedData = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  filteredsearchResultArray = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'SNo',
    'SpokeName',
    'DeviceID',
    'edit',
    'action',
  ];

  /*ngModels*/
  serviceProviderID: any;
  providerServiceMapID: any;
  state: any;
  service: any;
  zoneID: any;
  parkingPlace: any;
  spokeTypeID: any;
  spokeID: any;
  deviceID: any;
  typeExists: any;
  userID: any;
  searchTerm: any;
  editObject: any;
  spokeName: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  searchResultArray: any = [];
  zones: any = [];
  parkingPlaces: any = [];
  availableSpokeTypes: any = [];
  filteredSpokeTypes: any = [];
  availableSpokes: any = [];
  deviceIdArray: any = [];

  /*flags*/
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  isNational = false;
  editFormFlag = false;

  @ViewChild('searchFields')
  searchFields!: NgForm;
  @ViewChild('spokeDeviceIdMappingForm')
  spokeDeviceIdMappingForm!: NgForm;

  constructor(
    public fetosenseDeviceMasterService: FetosenseDeviceIdMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.userID = this.commonDataService.uid;
  }

  ngOnInit() {
    this.getServicesLines(this.userID);
  }

  getServicesLines(userID: any) {
    this.fetosenseDeviceMasterService.getServiceLines(userID).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          const result = response.data.filter((item: any) => {
            if (item.serviceID === 4 || item.serviceID === 9) {
              return item;
            }
          });
          this.serviceLineSuccessHandeler(result);
        } else {
          this.alertService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  serviceLineSuccessHandeler(response: any) {
    this.services = response.filter(function (item: any) {
      return item;
    });
    this.searchTerm = null;
  }

  getStates(serviceID: any, isNational: any) {
    this.fetosenseDeviceMasterService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.getStatesSuccessHandeler(response.data);
          } else {
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.alertService.alert(err, 'error');
        },
      );
  }

  getStatesSuccessHandeler(response: any) {
    this.state = '';
    this.states = response;
    this.searchTerm = null;
    this.resetFieldsOnServiceChange();
  }

  resetFieldsOnServiceChange() {
    this.zones = [];
    this.parkingPlaces = [];
    this.filteredSpokeTypes = [];
    this.availableSpokes = [];
    this.deviceIdArray = [];
    this.filteredsearchResultArray.data = [];
    this.searchResultArray = [];
    this.showTableFlag = false;
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }

  getAvailableZones(providerServiceMapID: any) {
    this.fetosenseDeviceMasterService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.getZonesSuccessHandler(response.data);
          } else {
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.alertService.alert(err, 'error');
        },
      );
  }

  getZonesSuccessHandler(response: any) {
    if (response !== undefined) {
      this.zones = [];
      for (const zone of response) {
        if (!zone.deleted) {
          this.zones.push(zone);
        }
      }
      this.resetFieldsOnStateChange();
    }
  }

  resetFieldsOnStateChange() {
    this.parkingPlaces = [];
    this.filteredSpokeTypes = [];
    this.availableSpokes = [];
    this.deviceIdArray = [];
    this.filteredsearchResultArray.data = [];
    this.searchResultArray = [];
    this.showTableFlag = false;
  }

  getParkingPlaces(zoneID: any, providerServiceMapID: any) {
    const parkingPlaceObj = {
      zoneID: zoneID,
      providerServiceMapID: providerServiceMapID,
    };
    this.fetosenseDeviceMasterService
      .getParkingPlaces(parkingPlaceObj)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.getParkingPlaceSuccessHandler(response.data);
          } else {
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.alertService.alert(err, 'error');
        },
      );
  }

  getParkingPlaceSuccessHandler(response: any) {
    this.parkingPlaces = response;
    this.filteredSpokeTypes = [];
    this.availableSpokes = [];
    this.deviceIdArray = [];
    for (const parkingPlaces of this.parkingPlaces) {
      if (parkingPlaces.deleted) {
        const index: number = this.parkingPlaces.indexOf(parkingPlaces);
        if (index !== -1) {
          this.parkingPlaces.splice(index, 1);
        }
      }
    }
    this.filteredsearchResultArray.data = [];
    this.searchResultArray = [];
    this.showTableFlag = false;
  }

  getSpokeTypes() {
    const obj = { providerServiceMapID: this.providerServiceMapID };

    this.fetosenseDeviceMasterService.getVanTypes(obj).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          this.getSpokeTypesSuccessHandler(response.data);
        } else {
          this.alertService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  getSpokeTypesSuccessHandler(response: any) {
    this.availableSpokeTypes = response;
    this.filteredSpokeTypes = [];
    this.availableSpokeTypes.filter((spokeTypes: any) => {
      if (this.service.serviceName === 'TM' && spokeTypes.vanTypeID === 3) {
        this.filteredSpokeTypes.push(spokeTypes);
      } else if (
        this.service.serviceName === 'HWC' &&
        spokeTypes.vanTypeID !== 3
      ) {
        this.filteredSpokeTypes.push(spokeTypes);
      }
    });

    this.availableSpokes = [];
    this.deviceIdArray = [];
    this.filteredsearchResultArray.data = [];
    this.searchResultArray = [];
    this.showTableFlag = false;
  }

  getSpokeIdAndDeviceId(
    providerServiceMapID: any,
    parkingPlaceID: any,
    spokeTypeID: any,
  ) {
    const spokeObj = {
      parkingPlaceID: parkingPlaceID,
      vanTypeID: spokeTypeID,
      providerServiceMapID: providerServiceMapID,
    };

    this.fetosenseDeviceMasterService.getSpokeIdAndDeviceId(spokeObj).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          this.getSpokeIdDeviceIdSuccessHandler(response.data);
        } else {
          this.alertService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  getSpokeIdDeviceIdSuccessHandler(response: any) {
    this.deviceIdArray = [];
    this.availableSpokes = [];
    this.deviceIdArray = response.deviceIDs;
    this.availableSpokes = response.VanIDs;
  }

  getSpokeDeviceIdMappings(parkingPlaceID: any, spokeTypeID: any) {
    const reqObj = {
      parkingPlaceID: parkingPlaceID,
      vanTypeID: spokeTypeID,
      providerServiceMapID: this.providerServiceMapID,
    };

    this.fetosenseDeviceMasterService.getVanDeviceIdMappings(reqObj).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          this.getVanDeviceIdMappingsSuccessHandler(response.data);
        } else {
          this.alertService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  getVanDeviceIdMappingsSuccessHandler(response: any) {
    this.showTableFlag = true;
    this.filteredsearchResultArray.data = response;
    this.filteredsearchResultArray.paginator = this.paginator;
    this.searchResultArray = response;
    this.searchTerm = null;
  }

  showCreateForm() {
    this.showTableFlag = false;
    this.showFormFlag = true;
    this.editFormFlag = false;
    this.disableSelection = true;
  }

  navigateToPrev() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.back();
          this.getSpokeIdAndDeviceId(
            this.providerServiceMapID,
            this.parkingPlace.parkingPlaceID,
            this.spokeTypeID.vanTypeID,
          );
          this.getSpokeDeviceIdMappings(
            this.parkingPlace.parkingPlaceID,
            this.spokeTypeID.vanTypeID,
          );
        }
      });
  }
  back() {
    this.showTableFlag = true;
    this.showFormFlag = false;
    this.editFormFlag = false;
    this.spokeDeviceIdMappingForm.reset();
    this.searchTerm = null;
    this.disableSelection = false;
    this.spokeName = null;
  }

  toggleDeactivate(data: any, isDeleted: any) {
    this.alertService
      .confirm('Confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response) => {
        if (response) {
          const obj = {
            VfdID: data.VfdID,
            vanID: data.vanID,
            deactivated: isDeleted,
          };

          this.fetosenseDeviceMasterService
            .toggle_activate_SpokeDeviceIdMapping(obj)
            .subscribe(
              (responseValue: any) => {
                if (
                  responseValue &&
                  responseValue.statusCode === 200 &&
                  responseValue.data
                ) {
                  this.toggleActivateSuccessHandeler(
                    responseValue.data,
                    'Deactivated',
                  );
                } else {
                  this.alertService.alert(responseValue.errorMessage, 'error');
                }
              },
              (err) => {
                this.alertService.alert(err, 'error');
              },
            );
        }
      });
  }

  toggleActivate(data: any, isDeleted: any) {
    if (data.deleted === true) {
      this.alertService.alert(
        'Please Activate the Device ID Master First',
        'info',
      );
    } else {
      this.alertService
        .confirm('Confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              VfdID: data.VfdID,
              vanID: data.vanID,
              deactivated: isDeleted,
            };

            this.fetosenseDeviceMasterService
              .toggle_activate_SpokeDeviceIdMapping(obj)
              .subscribe(
                (respValue: any) => {
                  if (
                    respValue &&
                    respValue.statusCode === 200 &&
                    respValue.data
                  ) {
                    this.toggleActivateSuccessHandeler(
                      respValue.data,
                      'Activated',
                    );
                  } else {
                    this.alertService.alert(respValue.errorMessage, 'error');
                  }
                },
                (err) => {
                  this.alertService.alert(err, 'error');
                },
              );
          }
        });
    }
  }

  toggleActivateSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response) {
      this.alertService.alert(action + ' Successfully', 'success');
      this.searchTerm = null;
      this.getSpokeIdAndDeviceId(
        this.providerServiceMapID,
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
      this.getSpokeDeviceIdMappings(
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
    }
  }

  saveSpokeDeviceIdMapping() {
    const requestObj = {
      parkingPlaceID: this.parkingPlace.parkingPlaceID,
      vanTypeID: this.spokeTypeID.vanTypeID,
      vanID: this.spokeID,
      vanName: this.spokeName,
      deviceID: this.deviceID,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };
    this.fetosenseDeviceMasterService
      .saveSpokeDeviceIdMapping(requestObj)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.saveSuccessHandeler(response.data);
          } else {
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.alertService.alert(err, 'error');
        },
      );
  }

  saveSuccessHandeler(response: any) {
    console.log('response', response);
    if (response) {
      this.alertService.alert('Mapping Done Successfully', 'success');
      this.back();
      this.getSpokeIdAndDeviceId(
        this.providerServiceMapID,
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
      this.getSpokeDeviceIdMappings(
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
    }
  }

  addSpokeName(spokeIdValue: any) {
    this.availableSpokes.filter((item: any) => {
      if (item.vanID === spokeIdValue) {
        this.spokeName = item.vanName;
      }
    });
  }

  openEditForm(toBeEditedOBJ: any) {
    this.editFormFlag = true;
    this.showTableFlag = false;
    this.showFormFlag = false;

    this.disableSelection = true;
    this.availableSpokes = [];
    this.availableSpokes = [
      {
        vanID: toBeEditedOBJ.vanID,
        vanName: toBeEditedOBJ.vanName,
      },
    ];
    this.deviceIdArray.push({
      VfdID: toBeEditedOBJ.VfdID,
      deviceID: toBeEditedOBJ.deviceID,
      deviceName: toBeEditedOBJ.deviceName,
    });

    this.spokeID = toBeEditedOBJ.vanID;
    this.deviceID = toBeEditedOBJ.deviceID;
    this.editObject = toBeEditedOBJ;
  }

  updateSpokeDeviceIdMapping() {
    const obj: any = {
      VfdID: this.editObject.VfdID,
      parkingPlaceID: this.editObject.parkingPlaceID,
      vanTypeID: this.editObject.vanTypeID,
      vanID: this.editObject.vanID,
      vanName: this.editObject.vanName,
      deviceID: this.deviceID,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.editObject.createdBy,
      deactivated: this.editObject.deactivated,
      deleted: this.editObject.deleted,
      processed: this.editObject.processed,
      modifiedBy: this.commonDataService.uname,
    };
    this.fetosenseDeviceMasterService.editSpokeDeviceIdMapping(obj).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          this.updateSuccessHandeler(response.data);
        } else {
          this.alertService.alert(response.errorMessage, 'error');
        }
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  updateSuccessHandeler(response: any) {
    console.log(response, 'edit response success');
    if (response) {
      this.alertService.alert('Mapping Updated Successfully', 'success');
      this.back();
      this.getSpokeIdAndDeviceId(
        this.providerServiceMapID,
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
      this.getSpokeDeviceIdMappings(
        this.parkingPlace.parkingPlaceID,
        this.spokeTypeID.vanTypeID,
      );
    }
  }

  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
    } else {
      this.filteredsearchResultArray.data = [];
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'deviceID' || key === 'vanName') {
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
