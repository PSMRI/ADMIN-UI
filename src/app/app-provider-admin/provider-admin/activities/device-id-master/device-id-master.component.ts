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
import { dataService } from 'src/app/core/services/dataService/data.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
import { FetosenseDeviceIdMasterService } from '../services/fetosense-device-id-master-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
/**
 * Author: DE40034072
 * Date: 29-06-2021
 * Objective: # Component for creating Fetosense device master
 */

@Component({
  selector: 'app-device-id-master',
  templateUrl: './device-id-master.component.html',
  styleUrls: ['./device-id-master.component.css'],
})
export class DeviceIdMasterComponent implements OnInit, AfterViewInit {
  [x: string]: any;
  displayedColumns: string[] = [
    'SNo',
    'deviceID',
    'DeviceName',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = ['SNo', 'deviceID', 'DeviceName', 'edit'];

  /*ngModels*/
  serviceProviderID: any;
  providerServiceMapID: any;
  state: any;
  service: any;
  searchTerm: any;
  deviceID: any;
  deviceName: any;
  typeExists: any;
  userID: any;
  editObject: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  searchResultArray: any = [];
  availableDeviceIds: any = [];

  /*flags*/
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;
  isNational = false;
  editFormFlag = false;
  deviceIdExist = false;

  @ViewChild('searchFields')
  searchFields!: NgForm;
  @ViewChild('createDeviceIdForm')
  createDeviceIdForm!: NgForm;
  @ViewChild('editDeviceIdForm')
  editDeviceIdForm!: NgForm;
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  filteredsearchResultArray = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();

  constructor(
    public fetosenseDeviceMasterService: FetosenseDeviceIdMasterService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    public alertService: ConfirmationDialogsService,
  ) {
    this.serviceProviderID = this.commonDataService.service_providerID;
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
          this.alertService.alert(response.data.errorMessage, 'error');
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
  ngAfterViewInit() {
    this.filteredsearchResultArray.paginator = this.paginatorFirst;
  }

  getStates(serviceID: any, isNational: any) {
    this.fetosenseDeviceMasterService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.getStatesSuccessHandeler(response);
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
    this.states = response.data;
    this.searchTerm = null;
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.getFetosenseDeviceIdMaster(providerServiceMapID);
  }

  getFetosenseDeviceIdMaster(providerServiceMapID: any) {
    this.fetosenseDeviceMasterService
      .getFetosenseDeviceMaster(providerServiceMapID)
      .subscribe(
        (response: any) => {
          if (response && response.statusCode === 200 && response.data) {
            this.getFetosenseDeviceSuccessHandeler(response.data);
          } else {
            this.alertService.alert(response.errorMessage, 'error');
          }
        },
        (err) => {
          this.alertService.alert(err, 'error');
        },
      );
  }

  getFetosenseDeviceSuccessHandeler(response: any) {
    if (response) {
      this.showTableFlag = true;
      this.searchResultArray = response.fetosenseDeviceIDs;
      this.filteredsearchResultArray.data = response.fetosenseDeviceIDs;
      this.searchTerm = null;
      this.availableDeviceIds = [];
      for (const availableDeviceId of this.searchResultArray) {
        this.availableDeviceIds.push(availableDeviceId.deviceID);
      }
    }
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
          this.getFetosenseDeviceIdMaster(this.providerServiceMapID);
        }
      });
  }
  back() {
    if (this.showFormFlag === true) {
      this.createDeviceIdForm.reset();
    }
    if (this.editFormFlag === true) {
      this.editDeviceIdForm.reset();
    }

    this.showTableFlag = true;
    this.showFormFlag = false;
    this.editFormFlag = false;
    this.bufferArray.data = [];
    this.searchTerm = null;
    this.disableSelection = false;
    this.deviceIdExist = false;
  }

  toggleDeactivate(data: any, isDeleted: any) {
    if (
      data.vanID &&
      data.vanID !== null &&
      data.vanID !== undefined &&
      data.deactivated === false
    ) {
      this.alertService.alert(
        'Please Deactivate the Spoke DeviceId Mapping First',
        'info',
      );
    } else {
      this.deactivateDeviceIdMaster(data, isDeleted);
    }
  }

  deactivateDeviceIdMaster(data: any, isDeleted: any) {
    this.alertService
      .confirm('Confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response) => {
        if (response) {
          const obj = {
            VfdID: data.VfdID,
            deviceName:
              data.deviceName !== undefined && data.deviceName !== null
                ? data.deviceName.trim()
                : null,
            deviceID: data.deviceID,
            vanID: data.vanID,
            parkingPlaceID: data.parkingPlaceID,
            vanTypeID: data.vanTypeID,
            vanName: data.vanName,
            providerServiceMapID: data.providerServiceMapID,
            deactivated: data.deactivated,
            deleted: isDeleted,
            processed: data.processed,
            createdBy: data.createdBy,
            modifiedBy: this.commonDataService.uname,
          };

          this.fetosenseDeviceMasterService
            .toggle_activate_DeviceMaster(obj)
            .subscribe(
              (respValue: any) => {
                if (
                  respValue &&
                  respValue.statusCode === 200 &&
                  respValue.data
                ) {
                  this.toggleActivateSuccessHandeler(
                    respValue.data,
                    'Deactivated',
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

  toggleActivate(data: any, isDeleted: any) {
    this.alertService
      .confirm('Confirm', 'Are you sure you want to Activate?')
      .subscribe((response) => {
        if (response) {
          const obj = {
            VfdID: data.VfdID,
            deviceName:
              data.deviceName !== undefined && data.deviceName !== null
                ? data.deviceName.trim()
                : null,
            deviceID: data.deviceID,
            vanID: data.vanID,
            parkingPlaceID: data.parkingPlaceID,
            vanTypeID: data.vanTypeID,
            vanName: data.vanName,
            providerServiceMapID: data.providerServiceMapID,
            deactivated: data.deactivated,
            deleted: isDeleted,
            processed: data.processed,
            createdBy: data.createdBy,
            modifiedBy: this.commonDataService.uname,
          };

          this.fetosenseDeviceMasterService
            .toggle_activate_DeviceMaster(obj)
            .subscribe(
              (responseValue: any) => {
                if (
                  responseValue &&
                  responseValue.statusCode === 200 &&
                  responseValue.data
                ) {
                  this.toggleActivateSuccessHandeler(
                    responseValue.data,
                    'Activated',
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

  toggleActivateSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response) {
      this.alertService.alert(action + ' Successfully', 'success');
      this.searchTerm = null;
      this.getFetosenseDeviceIdMaster(this.providerServiceMapID);
    }
  }

  addObj(deviceId: any, deviceName: any) {
    const obj = {
      deviceID: deviceId,
      deviceName:
        deviceName !== undefined && deviceName !== null
          ? deviceName.trim()
          : null,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };
    console.log('created', this.commonDataService.uname);

    if (
      this.bufferArray.data.length === 0 &&
      obj.deviceID !== '' &&
      obj.deviceID !== undefined
    ) {
      let countMasterArray = 0;
      for (const resValue of this.searchResultArray) {
        if (obj.deviceID === resValue.deviceID) {
          countMasterArray = countMasterArray + 1;
        }
      }
      if (
        countMasterArray === 0 &&
        obj.deviceID !== '' &&
        obj.deviceID !== undefined
      ) {
        this.bufferArray.data = [...this.bufferArray.data, obj];
      } else {
        this.alertService.alert('Device ID Already exists');
      }
    } else {
      this.checkDeviceIDExistInBufferArray(obj);
    }
    this.createDeviceIdForm.resetForm();
  }

  checkDeviceIDExistInBufferArray(obj: any) {
    let count = 0;
    for (const value of this.bufferArray.data) {
      if (obj.deviceID === value.deviceID) {
        count = count + 1;
      }
    }

    let countMasterArray = 0;
    for (const resValues of this.searchResultArray) {
      if (obj.deviceID === resValues.deviceID) {
        countMasterArray = countMasterArray + 1;
      }
    }

    if (
      count === 0 &&
      countMasterArray === 0 &&
      obj.deviceID !== '' &&
      obj.deviceID !== undefined
    ) {
      this.bufferArray.data = [...this.bufferArray.data, obj];
    } else {
      this.alertService.alert('Device ID Already Exists');
    }
  }

  removeObj(index: any) {
    const newData = [...this.bufferArray.data];
    newData.splice(index, 1);
  }

  saveDeviceMasterDetails() {
    this.fetosenseDeviceMasterService
      .saveFetosenseDeviceMaster(this.bufferArray.data)
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
      this.alertService.alert('Device ID Saved Successfully', 'success');
      this.back();
      this.getFetosenseDeviceIdMaster(this.providerServiceMapID);
    }
  }

  checkExistance(deviceIdvalue: any) {
    if (this.editObject.deviceID === deviceIdvalue) {
      this.deviceIdExist = false;
    } else {
      this.deviceIdExist = this.availableDeviceIds.includes(deviceIdvalue);
    }
  }

  openEditForm(toBeEditedOBJ: any) {
    this.showTableFlag = false;
    this.showFormFlag = false;
    this.editFormFlag = true;
    this.disableSelection = true;

    this.deviceID = toBeEditedOBJ.deviceID;
    this.deviceName =
      toBeEditedOBJ.deviceName !== undefined &&
      toBeEditedOBJ.deviceName !== null
        ? toBeEditedOBJ.deviceName.trim()
        : null;
    this.editObject = toBeEditedOBJ;
  }

  updateDeviceMasterDetails(editedDeviceId: any, editedDeviceName: any) {
    const obj = {
      VfdID: this.editObject.VfdID,
      deviceName:
        editedDeviceName !== undefined && editedDeviceName !== null
          ? editedDeviceName.trim()
          : null,
      deviceID: editedDeviceId,
      vanID: this.editObject.vanID,
      parkingPlaceID: this.editObject.parkingPlaceID,
      vanTypeID: this.editObject.vanTypeID,
      vanName: this.editObject.vanName,
      providerServiceMapID: this.editObject.providerServiceMapID,
      deactivated: this.editObject.deactivated,
      deleted: this.editObject.deleted,
      processed: this.editObject.processed,
      createdBy: this.editObject.createdBy,
      modifiedBy: this.commonDataService.uname,
    };
    this.fetosenseDeviceMasterService.editFetosenseDeviceMaster(obj).subscribe(
      (response: any) => {
        if (response && response.statusCode === 200 && response.data) {
          this.updateSuccessHandeler(response);
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
      this.alertService.alert('Device ID Updated Successfully', 'success');
      this.back();
      this.getFetosenseDeviceIdMaster(this.providerServiceMapID);
    }
  }

  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
      this.filteredsearchResultArray.paginator = this.paginatorFirst;
    } else {
      this.filteredsearchResultArray.data = [];
      this.searchResultArray.forEach((item: any) => {
        for (const key in item) {
          if (key === 'deviceID' || key === 'deviceName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResultArray.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredsearchResultArray.paginator = this.paginatorFirst;
    }
  }
}
