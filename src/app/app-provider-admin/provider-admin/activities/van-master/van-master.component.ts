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

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { VanMasterService } from 'src/app/core/services/ProviderAdminServices/van-master-service.service';
import { ServicePointMasterService } from '../services/service-point-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-van-master',
  templateUrl: './van-master.component.html',
})
export class VanComponent implements OnInit {
  userID: any;
  serviceline: any;
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  countryID: any;
  searchStateID: any;
  district: any;
  parking_place: any;
  serviceID: any;
  createdBy: any;
  status: any;
  zoneID: any;
  parkAndHub: any;
  vanAndSpoke: any;
  code: any;
  codeType: any;
  domain: any;
  sID: any;
  sEmail: any;
  note!: string;

  editable: any = false;
  showVans: any = true;
  showVansTable = false;
  createButton = false;

  parkingPlaces: any = [];
  availableVanNames: any = [];
  availableVehicleNos: any = [];
  services_array: any = [];
  zones: any = [];
  availableVans: any = [];
  displayedColumns = [
    'sno',
    'parkingPlaceName',
    'vanName',
    'vehicalNo',
    'vanType',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'stateName',
    'parkingPlaceName',
    'vanName',
    'vehicalNo',
    'vanType',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredavailableVans = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredavailableVans.paginator = this.paginator;
  }
  vanList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) addZonePaginator: MatPaginator | null = null;

  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public vanMasterService: VanMasterService,
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

  showForm() {
    this.showVans = false;
    this.showVansTable = false;
    this.note = '* Note: Use Registered Swymed Email';
    //this.districts = [];
    this.getVanTypes();
  }
  ngOnInit() {
    this.getProviderServices();
  }
  getProviderServices() {
    this.servicePointMasterService.getServices(this.userID).subscribe(
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
      (err: any) => {},
    );
  }
  getStates(serviceID: any) {
    this.resetArrays();
    if (serviceID === 4) {
      this.parkAndHub = 'Hub';
      this.vanAndSpoke = 'Spoke';
      this.code = 'Spoke Code';
      this.codeType = 'Spoke Type';
    } else {
      this.parkAndHub = 'Parking Place';
      this.vanAndSpoke = 'Van';
      this.code = 'Vehicle No.';
      this.codeType = 'Van Type';
    }
    this.servicePointMasterService
      .getStates(this.userID, serviceID, false)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, false),
        (err: any) => {},
      );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response, 'Provider States');
      this.provider_states = response.data;
      this.createButton = false;
    }
  }
  resetArrays() {
    this.zones = [];
    this.parkingPlaces = [];
    this.filteredavailableVans.data = [];
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.resetArrays();
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }
  getAvailableZones(providerServiceMapID: any) {
    this.servicePointMasterService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe((response: any) => this.getZonesSuccessHandler(response));
  }
  getZonesSuccessHandler(response: any) {
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
      .subscribe((response: any) =>
        this.getParkingPlaceSuccessHandler(response),
      );
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

  obj: any;
  getVanTypes() {
    this.vanMasterService
      .getVanTypes()
      .subscribe((response: any) => this.getVanTypesSuccessHandler(response));
  }

  availableVanTypes: any;
  filteredVanTypes: any = [];
  getVanTypesSuccessHandler(response: any) {
    this.availableVanTypes = response.data;
    this.filteredVanTypes.data = [];
    this.availableVanTypes.filter((vanTypes: any) => {
      if (this.serviceline.serviceName === 'TM' && vanTypes.vanTypeID === 3) {
        this.filteredVanTypes.push(vanTypes);
      } else if (
        this.serviceline.serviceName === 'MMU' &&
        vanTypes.vanTypeID !== 3
      ) {
        this.filteredVanTypes.push(vanTypes);
      } else if (
        this.serviceline.serviceName === 'HWC' &&
        vanTypes.vanTypeID !== 3
      ) {
        this.filteredVanTypes.push(vanTypes);
      }
    });
  }

  getVans(providerServiceMapID: any, parkingPlaceID: any) {
    this.vanObj = {};
    //  this.vanObj.stateID = stateID;
    this.vanObj.parkingPlaceID = parkingPlaceID;
    this.vanObj.providerServiceMapID = providerServiceMapID;
    this.vanMasterService
      .getVans(this.vanObj)
      .subscribe((response: any) => this.getVanSuccessHandler(response));
  }

  getVanSuccessHandler(response: any) {
    this.availableVans = response.data;
    this.filteredavailableVans.data = response.data;
    this.createButton = true;
    this.showVansTable = true;
    for (const availableVan of this.availableVans) {
      this.availableVanNames.data.push(availableVan.vanName);
      this.availableVehicleNos.data.push(availableVan.vehicalNo);
    }
  }

  deleteRow(i: any) {
    this.vanList.data.splice(i, 1);
  }
  vanObj: any;
  addVanToList(formValues: any) {
    this.vanObj = {};
    this.vanObj.vanName = formValues.vanName;
    this.vanObj.vehicalNo = formValues.vehicalNo;
    this.vanObj.countryID = this.countryID;
    this.vanObj.stateID = this.searchStateID.stateID;
    this.vanObj.stateName = this.searchStateID.stateName;
    // this.vanObj.districtID = this.district.districtID;
    // this.vanObj.districtName = this.district.districtName;
    this.vanObj.parkingPlaceID = this.parking_place.parkingPlaceID;
    this.vanObj.parkingPlaceName = this.parking_place.parkingPlaceName;
    this.vanObj.providerServiceMapID = this.searchStateID.providerServiceMapID;
    this.vanObj.vanTypeID = formValues.vanTypeID.split('-')[0];
    this.vanObj.vanType = formValues.vanTypeID.split('-')[1];
    this.vanObj.videoConsultationDomain = formValues.domain;
    this.vanObj.videoConsultationEmail = formValues.sEmail;
    this.vanObj.videoConsultationID = formValues.sID;
    this.vanObj.createdBy = this.createdBy;
    this.checkDuplicates(this.vanObj);
    //this.vanList.push(this.vanObj);

    if (this.vanList.data.length <= 0) {
      this.alertMessage.alert('No Service available with the state selected');
    }
  }
  checkDuplicates(vanObj: any) {
    let count = 0;
    if (this.vanList.data.length === 0) {
      this.vanList.data.push(vanObj);
    } else if (this.vanList.data.length > 0) {
      for (let i = 0; i < this.vanList.data.length; i++) {
        if (
          this.vanList.data[i].vanName === vanObj.vanName &&
          this.vanList.data[i].providerServiceMapID ===
            vanObj.providerServiceMapID &&
          // && this.vanList[i].districtName === vanObj.districtName
          this.vanList.data[i].parkingPlaceName === vanObj.parkingPlaceName &&
          this.vanList.data[i].vanType === vanObj.vanType &&
          this.vanList.data[i].vehicalNo === vanObj.vehicalNo
        ) {
          count = 1;
        }
      }
      if (count === 0) {
        this.vanList.data.push(vanObj);
      } else {
        this.alertMessage.alert('Already exists');
        count = 0;
      }
    }
  }

  storeVans() {
    const obj = { vanMaster: this.vanList.data };
    console.log(obj);
    this.vanMasterService
      .saveVan(obj)
      .subscribe((response: any) => this.vanSuccessHandler(response));
  }

  vanSuccessHandler(response: any) {
    this.vanList.data = [];
    this.alertMessage.alert('Saved successfully', 'success');
    this.showList();
  }

  dataObj: any = {};
  updateVanStatus(van: any) {
    const flag = !van.deleted;
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
      .subscribe((response: any) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.vanID = van.vanID;
          this.dataObj.deleted = !van.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.vanMasterService
            .updateVanStatus(this.dataObj)
            .subscribe((response: any) => this.updateStatusHandler(response));

          van.deleted = !van.deleted;
        }
      });
  }
  updateStatusHandler(response: any) {
    if (this.status === 'Deactivate')
      this.alertMessage.alert('Deactivated successfully', 'success');
    else this.alertMessage.alert('Activated successfully', 'success');
    console.log('Van status changed');
  }

  showList() {
    this.getVans(
      this.searchStateID.providerServiceMapID,
      this.parking_place.parkingPlaceID,
    );
    this.showVans = true;
    this.showVansTable = true;
    this.editable = false;
    this.vanList.data = [];
  }

  vanNameExist: any = false;
  checkExistance(vanName: any) {
    this.vanNameExist = this.availableVanNames.includes(vanName);
    console.log(this.vanNameExist);
  }

  vehicleExist: any = false;
  checkVehicleExistance(vehicleNo: any) {
    this.vehicleExist = this.availableVehicleNos.includes(vehicleNo);
    console.log(this.vehicleExist);
  }

  vanID: any;
  vanName: any;
  vehicalNo: any;
  vanTypeID: any;
  stateID: any;
  districtID: any;
  parkingPlaceID: any;
  editVanValue: any;

  editVanData(van: any) {
    this.showVansTable = false;
    this.editVanValue = van;
    this.vanID = van.vanID;
    this.vanName = van.vanName;
    this.vehicalNo = van.vehicalNo;
    this.domain = van.videoConsultationDomain;
    this.sEmail = van.videoConsultationEmail;
    this.sID = van.videoConsultationID;
    this.vanTypeID = van.vanTypeID + '-' + van.vanType;
    this.stateID = van.stateID;
    // this.district = van.districtID;
    this.providerServiceMapID = van.providerServiceMapID;
    this.parking_place.parkingPlaceID = van.parkingPlaceID;
    this.parking_place.parkingPlaceName = van.parkingPlaceName;
    this.editable = true;
    // this.GetTaluks(this.parking_place, this.district);
  }

  updateVanData(van: any) {
    this.dataObj = {};
    this.dataObj.vanID = this.vanID;
    this.dataObj.vanName = van.vanName;
    this.dataObj.vehicalNo = van.vehicalNo;
    this.dataObj.vanTypeID = van.vanTypeID.split('-')[0];
    this.dataObj.countryID = this.countryID;
    this.dataObj.parkingPlaceID = this.parking_place.parkingPlaceID;
    this.dataObj.stateID = this.stateID;
    this.dataObj.providerServiceMapID = this.providerServiceMapID;
    this.dataObj.videoConsultationDomain = van.domain;
    this.dataObj.videoConsultationEmail = van.sEmail;
    this.dataObj.videoConsultationID = van.sID;
    this.dataObj.modifiedBy = this.createdBy;
    this.vanMasterService
      .updateVanData(this.dataObj)
      .subscribe((response: any) => this.updateHandler(response));
  }

  updateHandler(response: any) {
    this.editable = false;
    this.alertMessage.alert('Updated successfully', 'success');
    this.availableVanNames = [];
    this.getVans(
      this.searchStateID.providerServiceMapID,
      this.parking_place.parkingPlaceID,
    );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableVans.data = this.availableVans;
    } else {
      this.filteredavailableVans.data = [];
      this.availableVans.forEach((item: any) => {
        for (const key in item)
          if (key === 'vanName' || key === 'vehicalNo' || key === 'vanType') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableVans.data.push(item);
              break;
            }
          }
      });
    }
  }
  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res: any) => {
        if (res) {
          this.showList();
        }
      });
  }
}
