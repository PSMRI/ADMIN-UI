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

import { NgForm } from '@angular/forms';

import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ServicePointMasterService } from '../services/service-point-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-service-point',
  templateUrl: './service-point.component.html',
})
export class ServicePointComponent implements OnInit {
  areaHQAddress: any;
  districtID: any;
  servicePointID: any;
  talukID: any;
  servicePointName: any;
  servicePointDesc: any;
  serviceline: any;
  userID: any;
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  countryID: any;
  searchStateID: any;
  searchDistrictID: any;
  parking_Place: any;
  district: any;
  serviceID: any;
  createdBy: any;
  status: any;
  zoneID: any;
  editServicePointValue: any;
  note!: string;
  parkAndHub: any;

  formMode = false;
  editMode = false;
  editable: any = false;
  showServicePoints: any = false;
  createButton = false;

  services_array: any = [];
  availableServicePoints: any = [];
  zones: any = [];
  parkingPlaces: any = [];
  availableServicePointNames: any = [];

  displayedColumns = [
    'sno',
    'parkingPlaceName',
    'districtName',
    'blockName',
    'servicePointName',
    'servicePointDesc',
    'servicePointHQAddress',
    'edit',
    'action',
  ];
  displayAddedColumns = [
    'sno',
    'parkingPlaceName',
    'districtName',
    'servicePointName',
    'servicePointDesc',
    'servicePointHQAddress',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredavailableServicePoints = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredavailableServicePoints.paginator = this.paginator;
  }

  @ViewChild('servicePointForm1') servicePointForm1!: NgForm;
  @ViewChild('servicePointForm2') servicePointForm2!: NgForm;
  @ViewChild('resetform') resetform!: NgForm;
  servicePointList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) addZonePaginator: MatPaginator | null = null;

  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public servicePointMasterService: ServicePointMasterService,
    private alertMessage: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.data = [];
    this.service_provider_id =
      this.sessionstorage.getItem('service_providerID');
    this.countryID = 1; // hardcoded as country is INDIA
    this.serviceID = this.commonDataService.serviceIDMMU;
    this.createdBy = this.commonDataService.uname;
    this.userID = this.commonDataService.uid;
  }

  ngOnInit() {
    this.getProviderServices();
  }
  getProviderServices() {
    this.servicePointMasterService.getServices(this.userID).subscribe(
      (response: any) => {
        this.services_array = response.data;
        this.services_array = this.services_array.filter((item: any) =>
          [2, 4, 9].includes(item.serviceID),
        );
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
    this.servicePointMasterService
      .getStates(this.userID, serviceID, false)
      .subscribe(
        (response) => this.getStatesSuccessHandeler(response, false),
        (err) => {},
      );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response, 'Provider States');
      this.provider_states = response.data;
      this.availableServicePoints = [];
      this.filteredavailableServicePoints.data = [];
      this.createButton = false;
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.zones = [];
    this.parkingPlaces = [];
    this.filteredavailableServicePoints.data = [];
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }
  getAvailableZones(providerServiceMapID: any) {
    this.servicePointMasterService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe((response) => this.getZonesSuccessHandler(response));
  }
  getZonesSuccessHandler(response: any) {
    this.createButton = false;
    this.parkingPlaces = [];
    if (response !== undefined) {
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
    this.servicePointMasterService
      .getParkingPlaces(parkingPlaceObj)
      .subscribe((response) => this.getParkingPlaceSuccessHandler(response));
  }
  getParkingPlaceSuccessHandler(response: any) {
    this.parkingPlaces = response.data;
    this.createButton = false;
    for (const parkingPlaces of this.parkingPlaces) {
      if (parkingPlaces.deleted) {
        const index: number = this.parkingPlaces.indexOf(parkingPlaces);
        if (index !== -1) {
          this.parkingPlaces.splice(index, 1);
        }
      }
    }
  }

  districts: any = [];
  getDistricts(zoneID: any) {
    this.servicePointMasterService
      .getDistricts(zoneID)
      .subscribe((districtResponse) =>
        this.getDistrictsSuccessHandeler(districtResponse),
      );
  }
  getDistrictsSuccessHandeler(response: any) {
    console.log(response, 'districts retrieved');
    this.districts = response.data;
    this.availableServicePoints = [];
    this.filteredavailableServicePoints.data = [];
    this.createButton = false;
    this.note =
      '* Note: District and Taluk are only for physical address purpose';
    if (
      this.editServicePointValue !== undefined &&
      this.editServicePointValue !== null
    ) {
      const editDistrict = this.districts.filter((districtResponse: any) => {
        if (
          this.editServicePointValue.districtID !== undefined &&
          this.editServicePointValue.districtID !== null &&
          this.editServicePointValue.districtID === districtResponse.districtID
        ) {
          return districtResponse;
        }
      })[0];
      if (editDistrict) {
        this.district = editDistrict;
      }
    }
  }

  getServicePoints(stateID: any, parkingPlaceID: any) {
    this.createButton = true;
    this.servicePointObj = {};
    this.servicePointObj.stateID = stateID;
    this.servicePointObj.parkingPlaceID = parkingPlaceID;
    this.servicePointObj.serviceProviderID = this.service_provider_id;
    this.servicePointMasterService
      .getServicePoints(this.servicePointObj)
      .subscribe((response) => this.getServicePointSuccessHandler(response));
  }

  getServicePointSuccessHandler(response: any) {
    this.showServicePoints = true;
    this.availableServicePoints = response.data;
    this.filteredavailableServicePoints.data = response.data;
    for (const availableServicePoint of this.availableServicePoints) {
      this.availableServicePointNames.data.push(
        availableServicePoint.servicePointName,
      );
    }
  }

  showForm() {
    this.showServicePoints = false;
    this.formMode = true;
    this.editMode = false;
    this.getDistricts(this.zoneID.zoneID);
  }
  taluks: any = [];
  GetTaluks(parkingPlaceID: any, districtID: any) {
    this.taluks = [];
    this.talukID = null;
    const talukObj = {
      parkingPlaceID: parkingPlaceID,
      districtID: districtID,
    };
    this.servicePointMasterService
      .getTaluks(talukObj)
      .subscribe((response) => this.SetTaluks(response));
  }
  SetTaluks(response: any) {
    response.data.filter((talukResponse: any) => {
      if (!talukResponse.deleted) {
        this.taluks.push(talukResponse);
      }
    });

    if (
      this.editServicePointValue !== undefined &&
      this.editServicePointValue !== null
    ) {
      const editTaluk = this.taluks.filter((talukResponse: any) => {
        if (
          this.editServicePointValue.districtBlockID ===
          talukResponse.districtBlockID
        ) {
          return talukResponse;
        }
      })[0];
      if (editTaluk) {
        this.talukID = editTaluk;
      }
    }
  }

  // ** adding values ** //
  servicePointObj: any;
  addServicePointToList(values: any) {
    this.servicePointObj = {};
    this.servicePointObj.servicePointName = this.servicePointName;
    this.servicePointObj.servicePointDesc = this.servicePointDesc;
    this.servicePointObj.countryID = this.countryID;

    if (this.searchStateID !== undefined) {
      this.servicePointObj.stateID = this.searchStateID.stateID;
      this.servicePointObj.stateName = this.searchStateID.stateName;
    }

    if (this.district !== undefined) {
      this.servicePointObj.districtID = this.district.districtID;
      this.servicePointObj.districtName = this.district.districtName;
    }
    if (this.talukID !== undefined) {
      this.servicePointObj.districtBlockID = this.talukID.districtBlockID;
      this.servicePointObj.districtBlockName = this.talukID.districtBlockName;
    }
    this.servicePointObj.servicePointHQAddress = this.areaHQAddress;
    if (this.parking_Place !== undefined) {
      this.servicePointObj.parkingPlaceID = this.parking_Place.parkingPlaceID;
      this.servicePointObj.parkingPlaceName =
        this.parking_Place.parkingPlaceName;
    }
    this.servicePointObj.providerServiceMapID =
      this.searchStateID.providerServiceMapID;

    this.servicePointObj.createdBy = this.createdBy;
    this.checkDuplicates(this.servicePointObj);
    this.servicePointForm1.resetForm();
    this.servicePointForm2.resetForm();
  }
  //* checking duplicates in buffer */
  checkDuplicates(servicePointObj: any) {
    let count = 0;
    if (this.servicePointList.data.length === 0) {
      this.servicePointList.data.push(this.servicePointObj);
    } else if (this.servicePointList.data.length > 0) {
      for (let i = 0; i < this.servicePointList.data.length; i++) {
        if (
          this.servicePointList.data[i].servicePointName ===
          servicePointObj.servicePointName
        ) {
          count = count + 1;
        }
      }
      if (count === 0) {
        this.servicePointList.data.push(servicePointObj);
        count = 0;
      } else {
        this.alertMessage.alert('Already exists');
      }
    }
    console.log('servicePointList', this.servicePointList);
  }
  //* deleting rows from buffer */
  deleteRow(i: any) {
    this.servicePointList.data.splice(i, 1);
  }

  //* save method */
  storeServicePoints() {
    const obj = { servicePoints: this.servicePointList.data };
    console.log(obj);
    this.servicePointMasterService
      .saveServicePoint(obj)
      .subscribe((response) => this.servicePointSuccessHandler(response));
  }

  servicePointSuccessHandler(response: any) {
    this.servicePointList.data = [];
    this.alertMessage.alert('Saved successfully', 'success');
    this.servicePointForm1.resetForm();
    this.showList();
  }

  //* Activate and Deactivate method */
  dataObj: any = {};
  updateServicePointStatus(servicePoint: any) {
    const flag = !servicePoint.deleted;
    let vanString;
    if (flag === true) {
      vanString = 'Deactivate';
      this.status = 'Deactivate';
    }
    if (flag === false) {
      vanString = 'Activate';
      this.status = 'Activate';
    }

    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to ' + vanString + '?')
      .subscribe((response) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.servicePointID = servicePoint.servicePointID;
          this.dataObj.deleted = !servicePoint.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.servicePointMasterService
            .updateServicePointStatus(this.dataObj)
            .subscribe((response) => this.updateStatusHandler(response));

          servicePoint.deleted = !servicePoint.deleted;
        }
      });
  }
  updateStatusHandler(response: any) {
    if (this.status === 'Deactivate')
      this.alertMessage.alert('Deactivated successfully', 'success');
    else this.alertMessage.alert('Activated successfully', 'success');
    console.log('Service Point status changed');
  }

  showList() {
    if (!this.editMode) {
      this.getServicePoints(
        this.searchStateID.stateID,
        this.parking_Place.parkingPlaceID,
      );
      this.servicePointForm1.resetForm();
    } else {
      this.getServicePoints(
        this.searchStateID.stateID,
        this.parking_Place.parkingPlaceID,
      );
      this.servicePointForm2.resetForm();
    }
    this.showServicePoints = true;
    this.formMode = false;
    this.editMode = false;
    this.servicePointObj = [];
    this.servicePointList.data = [];
  }
  editservicePoint(spoint: any) {
    console.log('talukID', spoint);
    this.editMode = true;
    this.formMode = false;
    this.showServicePoints = false;
    this.editServicePointValue = spoint;
    this.providerServiceMapID = this.searchStateID.providerServiceMapID;
    this.servicePointID = spoint.servicePointID;
    this.servicePointName = spoint.servicePointName;
    this.servicePointDesc = spoint.servicePointDesc;
    this.parking_Place.parkingPlaceName = spoint.parkingPlaceName;
    this.areaHQAddress = spoint.servicePointHQAddress;
    console.log('talukID', this.talukID);
    this.getDistricts(this.zoneID.zoneID);
    this.GetTaluks(spoint.parkingPlaceID, spoint.districtID);
  }
  updateServicePoints(formValues: any) {
    const obj = {
      servicePointID: this.servicePointID,
      servicePointName: this.servicePointName,
      servicePointDesc: this.servicePointDesc,
      providerServiceMapID: this.searchStateID.providerServiceMapID,
      districtID: this.district ? this.district.districtID : this.district,
      servicePointHQAddress: this.areaHQAddress,
      districtBlockID: this.talukID
        ? this.talukID.districtBlockID
        : this.talukID,
      modifiedBy: this.createdBy,
    };

    this.servicePointMasterService
      .updateServicePoint(obj)
      .subscribe((response) => this.updateservicePointSuccessHandler(response));
  }
  updateservicePointSuccessHandler(response: any) {
    this.servicePointList.data = [];
    this.availableServicePointNames = [];
    this.editServicePointValue = null;
    this.showList();
    this.alertMessage.alert('Updated successfully', 'success');
    this.servicePointForm1.resetForm();
    this.servicePointForm2.resetForm();
  }

  /* db check of service name */
  servicePointNameExist: any = false;
  checkExistance(servicePointName: any) {
    this.servicePointNameExist =
      this.availableServicePointNames.includes(servicePointName);
    console.log(this.servicePointNameExist);
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableServicePoints.data = this.availableServicePoints;
      this.filteredavailableServicePoints.paginator = this.paginator;
    } else {
      this.filteredavailableServicePoints.data = [];
      this.availableServicePoints.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'districtName' ||
            key === 'blockName' ||
            key === 'servicePointName'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableServicePoints.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredavailableServicePoints.paginator = this.paginator;
    }
  }
  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.showList();
          this.editServicePointValue = null;
        }
      });
  }
}
