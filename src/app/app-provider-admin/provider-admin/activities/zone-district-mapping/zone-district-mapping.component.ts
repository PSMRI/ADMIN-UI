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
import { ZoneMasterService } from '../services/zone-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-zone-district-mapping',
  templateUrl: './zone-district-mapping.component.html',
})
export class ZoneDistrictMappingComponent implements OnInit {
  status!: string;
  userID: any;
  service: any;
  zoneID: any;
  state: any;
  data: any;
  providerServiceMapID: any;
  service_provider_id: any;
  checkExistDistricts: any;
  zoneDistrictMappingObj: any;
  editZoneMappingValue: any;
  createdBy: any;

  editable: any = false;
  showMappings: any = false;

  count: any = 0;

  /* array*/
  disableSelection = false;
  showListOfZonemapping = true;
  availableZoneDistrictMappings: any = [];
  services: any = [];
  states: any = [];
  availableZones: any = [];
  districts: any = [];
  mappedDistricts: any = [];
  districtID: any = [];
  existingDistricts: any = [];
  mappedDistrictIDs: any = [];
  availableDistricts: any = [];
  bufferDistrictsArray: any = [];
  dataObj: any = {};

  displayedColumns = [
    'sno',
    'stateName',
    'zoneName',
    'districtName',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'zoneName',
    'stateName',
    'districtName',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  dataSource = new MatTableDataSource<any>();
  filteredavailableZoneDistrictMappings = new MatTableDataSource<any>();
  setDataSourceAttributes() {
    this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
  }

  @ViewChild('zoneDistrictMappingForm') zoneDistrictMappingForm!: NgForm;
  zoneDistrictMappingList = new MatTableDataSource<any>();
  @ViewChild(MatSort) sort: MatSort | null = null;
  @ViewChild(MatPaginator) addZonePaginator: MatPaginator | null = null;
  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public zoneMasterService: ZoneMasterService,
    private alertMessage: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.data = [];
    this.service_provider_id =
      this.sessionstorage.getItem('service_providerID');
    this.createdBy = this.commonDataService.uname;
    this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    this.filteredavailableZoneDistrictMappings.sort = this.sort;
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServiceLines();
  }

  AfterViewInit() {
    this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    this.filteredavailableZoneDistrictMappings.sort = this.sort;
  }
  /*
   * Service line
   */
  getServiceLines() {
    this.zoneMasterService
      .getServiceLinesNew(this.userID)
      .subscribe((response: any) => {
        this.getServicesSuccessHandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
          };
      });
  }
  getServicesSuccessHandeler(response: any) {
    this.services = response.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 2 || item.serviceID === 4 || item.serviceID === 9)
        return item;
    });
  }
  /*
   * State
   */
  getStates(value: any) {
    this.filteredavailableZoneDistrictMappings.data = [];
    this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.zoneMasterService.getStatesNew(obj).subscribe((response: any) => {
      this.getStatesSuccessHandeler(response),
        (err: any) => {
          console.log('error in fetching states', err);
        };
    });
  }

  getStatesSuccessHandeler(response: any) {
    this.states = response.data;
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    this.availableZones.data = [];
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZoneDistrictMappings();
  }
  /*
   * Based on providerServiceMapID fetch available zone district mapping
   */
  getAvailableZoneDistrictMappings() {
    this.zoneMasterService
      .getZoneDistrictMappings({
        providerServiceMapID: this.providerServiceMapID,
      })
      .subscribe((response: any) =>
        this.getZoneDistrictMappingsSuccessHandler(response),
      );
  }

  getZoneDistrictMappingsSuccessHandler(response: any) {
    this.availableZoneDistrictMappings = response.data;
    this.filteredavailableZoneDistrictMappings.data = response.data;
    this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    this.showMappings = true;
    console.log(
      'this.availableZoneDistrictMappings',
      this.availableZoneDistrictMappings,
    );
  }

  showForm() {
    this.showMappings = false;
    this.disableSelection = true;
    this.showListOfZonemapping = false;
    this.availableZones.data = [];
    this.getAvailableZones(this.state.providerServiceMapID);
  }
  /*
   * Fetch available zones based on providerServiceMapID
   */
  getAvailableZones(providerServiceMapID: any) {
    this.zoneMasterService
      .getZones({ providerServiceMapID: providerServiceMapID })
      .subscribe((response: any) => this.getZonesSuccessHandler(response));
  }
  getZonesSuccessHandler(response: any) {
    this.availableZones = [];
    if (response !== undefined) {
      console.log('response.data', response.data);
      for (const zone of response.data) {
        if (!zone.deleted) {
          console.log('zone', zone);
          this.availableZones.push(zone);
        }
      }
      console.log('this.availableZones', this.availableZones);
    }

    // On edit - populate available zones
    if (this.editZoneMappingValue !== undefined) {
      if (this.availableZones.data) {
        const zone = this.availableZones.filter((availableZonesRes: any) => {
          if (this.editZoneMappingValue.zoneID === availableZonesRes.zoneID) {
            return availableZonesRes;
          }
        })[0];
        if (zone) {
          this.zoneID = zone;
          const state = Object.assign({
            stateID:
              this.editZoneMappingValue.m_providerServiceMapping.state.stateID,
            providerServiceMapID:
              this.editZoneMappingValue.providerServiceMapID,
          });
          console.log('state', state);

          this.checkZone(
            this.editZoneMappingValue.zoneID,
            this.editZoneMappingValue.m_providerServiceMapping.m_serviceMaster,
            state,
          );
        }
      }
    }
  }

  checkZone(zoneID: any, service: any, stateID: any) {
    this.getDistricts(zoneID, service, stateID);
  }
  /*
   * Fetch districts based on stateID
   */
  getDistricts(zoneID: any, service: any, stateID: any) {
    this.zoneMasterService
      .getDistricts(stateID.stateID)
      .subscribe((response: any) =>
        this.getDistrictsSuccessHandeler(response, zoneID, service, stateID),
      );
  }
  getDistrictsSuccessHandeler(
    response: any,
    zoneID: any,
    service: any,
    stateID: any,
  ) {
    this.districts = response.data;
    if (this.districts) {
      this.checkExistance(service, zoneID, stateID);
    }
    //On edit - populate available districts
    if (this.editZoneMappingValue !== undefined) {
      if (this.districts) {
        const district = this.districts.filter((districtsRes: any) => {
          if (
            this.editZoneMappingValue.districtID === districtsRes.districtID &&
            this.editZoneMappingValue.zoneID === this.zoneID.zoneID
          ) {
            return districtsRes;
          }
        })[0];
        if (district) {
          this.districtID = district;
          this.availableDistricts.push(district);
        }
      }
    }
  }

  /*
   * check already mapped districts with zone
   */
  checkExistance(service: any, zoneID: any, stateID: any) {
    this.districtID = [];
    this.existingDistricts = [];

    this.availableZoneDistrictMappings.forEach((zoneDistrictMappings: any) => {
      if (
        zoneDistrictMappings.providerServiceMapID !== undefined &&
        zoneDistrictMappings.providerServiceMapID ===
          stateID.providerServiceMapID
      ) {
        if (!zoneDistrictMappings.deleted) {
          this.existingDistricts.push(zoneDistrictMappings.districtID); // existing districts has already mapped district ID
        }
      }
    });

    this.availableDistricts = this.districts.slice();

    const temp: any = [];
    this.availableDistricts.forEach((district: any) => {
      const index = this.existingDistricts.indexOf(district.districtID);
      if (index < 0) {
        temp.push(district);
      }
    });
    this.availableDistricts = temp.slice(); // available districts has districts except existing districts

    if (this.zoneDistrictMappingList.data.length > 0) {
      this.zoneDistrictMappingList.data.forEach((zoneDistrictMappings: any) => {
        if (!zoneDistrictMappings.deleted) {
          this.bufferDistrictsArray.push(zoneDistrictMappings.districtID); // bufferDistrictsArray has districts (except existing districts) before save
        }
      });
      const temp: any = [];
      this.availableDistricts.forEach((district: any) => {
        const index = this.bufferDistrictsArray.indexOf(district.districtID);
        if (index < 0) {
          temp.push(district);
        }
      });
      this.availableDistricts = temp.slice();
      this.bufferDistrictsArray = [];
    }
  }

  addZoneDistrictMappingToList(values: any) {
    console.log('values', values);

    for (const districts of values.districtID) {
      const districtId = districts.districtID;

      this.zoneDistrictMappingObj = {};
      this.zoneDistrictMappingObj.zoneID = values.zoneID.zoneID;
      this.zoneDistrictMappingObj.zoneName = values.zoneID.zoneName;
      this.zoneDistrictMappingObj.districtID = districtId;
      this.zoneDistrictMappingObj.districtName = districts.districtName;
      this.zoneDistrictMappingObj.providerServiceMapID =
        values.zoneID.providerServiceMapID;
      this.zoneDistrictMappingObj.stateID = this.state.stateID;
      this.zoneDistrictMappingObj.stateName = this.state.stateName;
      this.zoneDistrictMappingObj.serviceID = this.service.serviceID;
      this.zoneDistrictMappingObj.createdBy = this.createdBy;
      this.zoneDistrictMappingList.data = [
        ...this.zoneDistrictMappingList.data,
        this.zoneDistrictMappingObj,
      ];
      this.zoneDistrictMappingForm.resetForm();
      this.resetDropdowns();
      console.log('buffer', this.zoneDistrictMappingList);
    }
  }

  remove_obj(index: any) {
    const service = this.zoneDistrictMappingList.data[index].serviceID;
    const state = this.zoneDistrictMappingList.data[index];
    const zoneID = this.zoneDistrictMappingList.data[index].zoneID;
    this.checkZone(zoneID, service, state);
    const newData = [...this.zoneDistrictMappingList.data];
    newData.splice(index, 1);
    this.zoneDistrictMappingList.data = newData;
    this.zoneDistrictMappingForm.resetForm();
    this.resetDropdowns();
  }
  resetDropdowns() {
    this.availableDistricts = [];
  }

  storezoneMappings() {
    console.log(this.zoneDistrictMappingList);
    const obj = { zoneDistrictMappings: this.zoneDistrictMappingList.data };
    this.zoneMasterService
      .saveZoneDistrictMappings(JSON.stringify(obj))
      .subscribe((response: any) => this.successHandler(response));
  }

  successHandler(response: any) {
    this.zoneDistrictMappingList.data = [];
    this.alertMessage.alert('Mapping saved successfully', 'success');
    this.showList();
  }
  showList() {
    this.getAvailableZoneDistrictMappings();
    this.editable = false;
    this.disableSelection = false;
    this.showListOfZonemapping = true;
    this.showMappings = false;
  }

  updateZoneMappingStatus(zoneMapping: any, zoneexist: any) {
    if (zoneexist) {
      this.alertMessage.alert('Zone is inactive');
    } else {
      const flag = !zoneMapping.deleted;
      let status;
      if (flag === true) {
        this.status = 'Deactivate';
      }
      if (flag === false) {
        this.status = 'Activate';
      }
      this.alertMessage
        .confirm('Confirm', 'Are you sure you want to ' + this.status + '?')
        .subscribe((response: any) => {
          if (response) {
            this.dataObj = {};
            this.dataObj.zoneDistrictMapID = zoneMapping.zoneDistrictMapID;
            this.dataObj.deleted = !zoneMapping.deleted;
            this.dataObj.modifiedBy = this.createdBy;
            this.zoneMasterService
              .updateZoneMappingStatus(this.dataObj)
              .subscribe((response: any) => this.updateStatusHandler(response));

            zoneMapping.deleted = !zoneMapping.deleted;
          }
        });
    }
  }
  updateStatusHandler(response: any) {
    console.log('Zone District Mapping status changed', response);
    this.alertMessage.alert(this.status + 'd successfully', 'success');
  }

  back() {
    this.alertMessage
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res: any) => {
        if (res) {
          this.zoneDistrictMappingForm.resetForm();
          this.resetDropdowns();
          this.showList();
          this.zoneDistrictMappingList.data = [];
          this.editZoneMappingValue = undefined;
        }
      });
  }

  editZoneMapping(zoneDistrictMapping: any) {
    console.log('zoneDistrictMapping', zoneDistrictMapping);
    this.editable = true;
    this.showMappings = false;
    this.disableSelection = true;
    this.showListOfZonemapping = false;
    this.editZoneMappingValue = zoneDistrictMapping;
    this.getAvailableZones(zoneDistrictMapping.providerServiceMapID);
  }

  updateZoneMappingData(ZoneMapping: any) {
    console.log('ZoneMapping', ZoneMapping);
    this.dataObj = {};
    this.dataObj.zoneID = this.zoneID.zoneID;
    this.dataObj.districtID = this.districtID.districtID;
    this.dataObj.providerServiceMapID =
      this.editZoneMappingValue.providerServiceMapID;
    this.dataObj.zoneDistrictMapID =
      this.editZoneMappingValue.zoneDistrictMapID;
    this.dataObj.modifiedBy = this.createdBy;
    console.log('data', this.dataObj);

    this.zoneMasterService
      .updateZoneMappingData(this.dataObj)
      .subscribe((response: any) => {
        console.log('updated response', response);
        this.updateHandler(response);
      });
  }
  updateHandler(response: any) {
    this.resetDropdowns();
    this.showList();
    this.editZoneMappingValue = null;
    this.alertMessage.alert('Updated successfully', 'success');
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableZoneDistrictMappings.data =
        this.availableZoneDistrictMappings;
      this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    } else {
      this.filteredavailableZoneDistrictMappings.data = [];
      this.availableZoneDistrictMappings.forEach((item: any) => {
        for (const key in item) {
          if (key === 'zoneName' || key === 'districtName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableZoneDistrictMappings.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredavailableZoneDistrictMappings.paginator = this.paginator;
    }
  }
}
