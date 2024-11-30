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
import { ProviderAdminRoleService } from '../../activities/services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ServicePointVillageMapService } from 'src/app/core/services/ProviderAdminServices/service-point-village-map.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ServicePointMasterService } from '../../activities/services/service-point-master-services.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-service-point-village-mapping',
  templateUrl: './service-point-village-mapping.component.html',
})
export class ServicePointVillageMapComponent implements OnInit {
  // filteredavailableServicePointVillageMaps = new MatTableDataSource<any>();
  // servicePointVillageMapList = new MatTableDataSource<any>();
  // @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  displayedColumns = [
    'sno',
    'servicePointName',
    'districtName',
    'blockName',
    'villageName',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'parkingPlaceName',
    'servicePointName',
    'districtName',
    'districtBlockName',
    'villageName',
    'action',
  ];

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredavailableServicePointVillageMaps = new MatTableDataSource<any>();
  servicePointVillageMapList = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredavailableServicePointVillageMaps.paginator = this.paginator;
  }

  // filteredavailableServicePointVillageMaps: any = [];
  formMode = false;
  villageIdList_edit: any;
  servicePointVillageMapID: any;
  searchServicePointID_edit: any;
  editMode = false;
  serviceline: any;
  createButton = false;
  services_array: any;
  userID: any;
  talukID: any;
  showServicePointVillageMaps: any = false;
  data: any;
  providerServiceMapID: any;
  provider_states: any;
  provider_services: any;
  service_provider_id: any;
  editable: any = false;
  countryID: any;
  searchStateID: any;
  district: any;
  serviceID: any;
  createdBy: any;
  zoneID: any;
  servicePointVillageMapObj: any;
  parkAndHub: any;

  /*Arrays*/
  zones: any = [];
  bufferVillagesArray: any = [];
  // servicePointVillageMapList: any = [];
  mappedVillageIDs: any = [];
  villageIdList: any = [];
  availableServicePointVillageMapNames: any = [];
  availableServicePointVillageMaps: any = [];
  parkingPlaces: any = [];

  @ViewChild('servicePointVillageMapForm')
  servicePointVillageMapForm!: NgForm;
  @ViewChild('servicePointVillage')
  servicePointVillage!: NgForm;
  showTableFlag: any;
  constructor(
    public providerAdminRoleService: ProviderAdminRoleService,
    public commonDataService: dataService,
    public servicePointVillageMapService: ServicePointVillageMapService,
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

  showForm(zoneID: any) {
    this.showServicePointVillageMaps = false;
    this.formMode = true;
    this.getDistricts(zoneID);
    //  this.districts = [];
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
    this.resetArrays();
    if (serviceID === 4) {
      this.parkAndHub = 'Hub';
    } else {
      this.parkAndHub = 'Parking Place';
    }
    this.servicePointMasterService
      .getStates(this.userID, serviceID, false)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response, false),
        (err) => {},
      );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    if (response) {
      console.log(response.data, 'Provider States');
      this.provider_states = response.data;
      this.availableServicePointVillageMaps = [];
      this.filteredavailableServicePointVillageMaps.data = [];
      this.createButton = false;
    }
  }
  resetArrays() {
    this.zones = [];
    this.parkingPlaces = [];
    this.availableServicePoints = [];
    this.filteredavailableServicePointVillageMaps.data = [];
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
    this.servicePointMasterService
      .getParkingPlaces(parkingPlaceObj)
      .subscribe((response: any) =>
        this.getParkingPlaceSuccessHandler(response),
      );
  }
  getParkingPlaceSuccessHandler(response: any) {
    this.parkingPlaces = response.data;
    for (const parkingPlaces of this.parkingPlaces) {
      if (parkingPlaces.deleted) {
        const index: number = this.parkingPlaces.indexOf(parkingPlaces);
        if (index !== -1) {
          this.parkingPlaces.splice(index, 1);
        }
      }
    }
  }
  getServicePoints(stateID: any, parkingPlaceID: any) {
    this.servicePointVillageMapObj = {};
    this.servicePointVillageMapObj.stateID = stateID;
    // this.servicePointVillageMapObj.districtID = districtID;
    this.servicePointVillageMapObj.parkingPlaceID = parkingPlaceID;
    this.servicePointVillageMapObj.serviceProviderID = this.service_provider_id;
    this.servicePointVillageMapService
      .getServicePoints(this.servicePointVillageMapObj)
      .subscribe((response: any) =>
        this.getServicePointSuccessHandler(response),
      );
  }

  availableServicePoints: any;
  getServicePointSuccessHandler(response: any) {
    this.availableServicePoints = response.data;
    this.availableServicePointVillageMaps = [];
    this.filteredavailableServicePointVillageMaps.data = [];
    this.createButton = false;
    for (const availableServicePoint of this.availableServicePoints) {
      if (availableServicePoint.deleted) {
        const index: number = this.availableServicePoints.indexOf(
          availableServicePoint,
        );
        if (index !== -1) {
          this.availableServicePoints.splice(index, 1);
        }
      }
    }
  }

  getServicePointVillageMaps(
    stateID: any,
    parkingPlaceID: any,
    servicePointID: any,
  ) {
    this.servicePointVillageMapObj = {};
    this.servicePointVillageMapObj.stateID = stateID;
    // this.servicePointVillageMapObj.districtID = districtID;
    this.servicePointVillageMapObj.parkingPlaceID = parkingPlaceID;
    // this.servicePointVillageMapObj.districtBlockID = districtBlockID;
    this.servicePointVillageMapObj.servicePointID = servicePointID;
    this.servicePointVillageMapObj.serviceProviderID = this.service_provider_id;
    this.servicePointVillageMapService
      .getServicePointVillageMaps(this.servicePointVillageMapObj)
      .subscribe((response: any) =>
        this.getServicePointVillageMapSuccessHandler(response),
      );
  }

  getServicePointVillageMapSuccessHandler(response: any) {
    this.availableServicePointVillageMaps = response.data;
    this.filteredavailableServicePointVillageMaps.data = response.data;
    console.log(
      this.filteredavailableServicePointVillageMaps,
      '218888888888888888',
    );
    this.filteredavailableServicePointVillageMaps.paginator = this.paginator;
    this.createButton = true;
    this.showServicePointVillageMaps = true;
    for (const availableServicePointVillageMap of this
      .availableServicePointVillageMaps) {
      this.availableServicePointVillageMapNames.push(
        availableServicePointVillageMap.m_servicepoint.servicePointName,
      );
    }
  }

  districts: any = [];
  getDistricts(zoneID: any) {
    this.taluks = [];
    this.servicePointMasterService
      .getDistricts(zoneID)
      .subscribe((response: any) => this.getDistrictsSuccessHandeler(response));
  }
  getDistrictsSuccessHandeler(response: any) {
    this.districts = response.data;
    this.availableServicePointVillageMaps = [];
    this.filteredavailableServicePointVillageMaps.data = [];
    this.createButton = false;
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
      .subscribe((response: any) => this.SetTaluks(response));
  }
  SetTaluks(response: any) {
    response.data.filter((talukResponse: any) => {
      if (!talukResponse.deleted) {
        this.taluks.push(talukResponse);
      }
    });
  }

  branches: any = [];
  GetBranches(providerServiceMapID: any, talukID: any) {
    this.servicePointVillage.controls['villageIdList'].reset();
    this.servicePointVillageMapService
      .getBranches(talukID)
      .subscribe((response: any) =>
        this.SetBranches(response, providerServiceMapID, talukID),
      );
  }
  SetBranches(response: any, providerServiceMapID: any, talukID: any) {
    this.branches = response.data;
    if (this.branches) {
      this.checkExistance(providerServiceMapID, talukID);
    }
    //on edit - populate available villages
    if (this.editVillageMapping !== undefined) {
      if (this.branches) {
        const village = this.branches.filter((villageResponse: any) => {
          if (
            this.editVillageMapping.districtBranchID === villageResponse.blockID
          ) {
            return villageResponse;
          }
        })[0];
        if (village) {
          this.villageIdList_edit = village;
          this.availableVillages.push(village);
        }
      }
    }
  }

  addServicePointVillageMapToList(values: any) {
    const villageIds = [];
    for (const villages of values.villageIdList) {
      const villageId = villages.districtBranchID;
      const villageName = villages.villageName;

      if (this.mappedVillageIDs.indexOf(parseInt(villageId)) === -1) {
        this.servicePointVillageMapObj = {};

        this.servicePointVillageMapObj.stateID = this.searchStateID.stateID;
        this.servicePointVillageMapObj.stateName = this.searchStateID.stateName;

        this.servicePointVillageMapObj.districtID = this.district.districtID;
        this.servicePointVillageMapObj.districtName =
          this.district.districtName;

        this.servicePointVillageMapObj.parkingPlaceID =
          this.parking_Place.parkingPlaceID;
        this.servicePointVillageMapObj.parkingPlaceName =
          this.parking_Place.parkingPlaceName;

        this.servicePointVillageMapObj.servicePointID =
          this.searchServicePointID.servicePointID;
        this.servicePointVillageMapObj.servicePointName =
          this.searchServicePointID.servicePointName;

        this.servicePointVillageMapObj.districtBlockID =
          this.talukID.districtBlockID;
        this.servicePointVillageMapObj.districtBlockName =
          this.talukID.districtBlockName;

        this.servicePointVillageMapObj.districtBranchID = villageId;
        this.servicePointVillageMapObj.villageName = villageName;

        this.servicePointVillageMapObj.providerServiceMapID =
          this.searchStateID.providerServiceMapID;

        this.servicePointVillageMapObj.createdBy = this.createdBy;
        this.servicePointVillageMapList.data.push(
          this.servicePointVillageMapObj,
        );
        this.servicePointVillageMapList.paginator = this.paginator;
        this.servicePointVillage.resetForm();
      }
    }
    this.servicePointVillageMapForm.controls['district'].reset();
    this.servicePointVillageMapForm.controls['talukID'].reset();
    this.taluks = [];
    this.availableVillages = [];
    this.GetBranches(
      this.searchStateID.providerServiceMapID,
      this.talukID.districtBlockID,
    );
  }
  existingVillages: any = [];
  availableVillages: any = [];

  checkExistance(providerServiceMapID: any, talukID: any) {
    const unmappedObj = {
      providerServiceMapID: providerServiceMapID,
      districtBlockID: talukID,
    };
    this.servicePointVillageMapService
      .filterMappedVillages(unmappedObj)
      .subscribe((response: any) => {
        this.availableVillages = response.data;
        console.log('availableVillages', this.availableVillages);
        if (!this.editable) {
          if (this.servicePointVillageMapList.data.length > 0) {
            this.servicePointVillageMapList.data.forEach(
              (servicePointVillageMap: any) => {
                this.bufferVillagesArray.push(
                  servicePointVillageMap.districtBranchID,
                );
              },
            );
          }
          const bufferTemp: any = [];
          this.availableVillages.forEach((villages: any) => {
            const index = this.bufferVillagesArray.indexOf(
              villages.districtBranchID,
            );
            if (index < 0) {
              bufferTemp.push(villages);
            }
          });

          //available villages has villages except existing villages and the villages which are added in a buffer array
          this.availableVillages = bufferTemp.slice();
          this.bufferVillagesArray = [];
        }
      });
  }

  remove_obj(index: any) {
    this.servicePointVillageMapList.data.splice(index, 1);
    this.showForm(this.zoneID.zoneID);
  }

  storeServicePointVillageMaps() {
    const obj = {
      servicePointVillageMaps: this.servicePointVillageMapList.data,
    };
    console.log(obj);
    this.servicePointVillageMapService
      .saveServicePointVillageMaps(obj)
      .subscribe((response: any) => this.servicePointSuccessHandler(response));
  }

  servicePointSuccessHandler(response: any) {
    this.servicePointVillageMapList.data = [];
    this.alertMessage.alert('Mapping saved successfully', 'success');
    this.showList();
    this.existingVillages = []; // Reset the existing villages array
  }

  dataObj: any = {};
  updateServicePointVillageMapStatus(servicePointvillageMap: any) {
    const flag = !servicePointvillageMap.deleted;
    let status: any;
    if (flag === true) {
      status = 'Deactivate';
    }
    if (flag === false) {
      status = 'Activate';
    }

    this.alertMessage
      .confirm('Confirm', 'Are you sure you want to ' + status + '?')
      .subscribe((response) => {
        if (response) {
          this.dataObj = {};
          this.dataObj.servicePointVillageMapID =
            servicePointvillageMap.servicePointVillageMapID;
          this.dataObj.deleted = !servicePointvillageMap.deleted;
          this.dataObj.modifiedBy = this.createdBy;
          this.servicePointVillageMapService
            .updateServicePointVillageMapStatus(this.dataObj)
            .subscribe((response: any) => this.updateStatusHandler(response));

          servicePointvillageMap.deleted = !servicePointvillageMap.deleted;
        }
        this.alertMessage.alert(status + 'd successfully', 'success');
      });
  }
  updateStatusHandler(response: any) {
    console.log('Service Point status changed');
  }

  editVillageMapping: any;
  editServiceVillageMapping(mapping: any) {
    this.editMode = true;
    this.showServicePointVillageMaps = false;
    this.formMode = false;
    this.getDistricts(this.zoneID.zoneID);
    this.searchServicePointID_edit = mapping.servicePointID;
    this.district = mapping.m_providerServiceMapping.m_district.districtName;
    this.talukID = mapping.blockID;
    this.providerServiceMapID = mapping.providerServiceMapID;
    this.servicePointVillageMapID = mapping.servicePointVillageMapID;
    this.editVillageMapping = mapping;
    this.GetBranches(mapping.providerServiceMapID, mapping.blockID);
    // this.villageIdList_edit = mapping.districtBranchID;
  }
  updateStoreServicePointVillageMaps() {
    const obj = {
      servicePointVillageMapID: this.servicePointVillageMapID,
      servicePointID: this.searchServicePointID_edit,
      districtBranchID: this.villageIdList_edit.districtBranchID,
      providerServiceMapID: this.providerServiceMapID,
      modifiedBy: this.createdBy,
    };
    // if (!this.checkDb(obj))
    this.servicePointVillageMapService
      .updateServicePointVillageMaps(obj)
      .subscribe((response: any) =>
        this.updateServicePointSuccessHandler(response),
      );
    // else
    //     this.alertMessage.alert("Already Mapped");
  }
  updateServicePointSuccessHandler(response: any) {
    this.servicePointVillageMapList.data = [];
    this.alertMessage.alert('Mapping updated successfully', 'success');
    this.showList();
  }

  parking_Place: any;
  searchServicePointID: any;
  showList() {
    this.showServicePointVillageMaps = true;
    this.editMode = false;
    this.formMode = false;
    if (this.editMode) {
      this.getServicePointVillageMaps(
        this.searchStateID.stateID,
        this.parking_Place.parkingPlaceID,
        this.searchServicePointID_edit,
      );
    } else {
      this.getServicePointVillageMaps(
        this.searchStateID.stateID,
        this.parking_Place.parkingPlaceID,
        this.searchServicePointID.servicePointID,
      );
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredavailableServicePointVillageMaps.data =
        this.availableServicePointVillageMaps;
    } else {
      this.filteredavailableServicePointVillageMaps.data = [];
      this.availableServicePointVillageMaps.forEach((item: any) => {
        for (const key in item) {
          if (key === 'blockName' || key === 'villageName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredavailableServicePointVillageMaps.data.push(item);
              break;
            }
          } else {
            if (key === 'm_providerServiceMapping') {
              const value: string = '' + item[key].m_district.districtName;
              if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
                this.filteredavailableServicePointVillageMaps.data.push(item);
                break;
              }
            }
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
      .subscribe((res) => {
        if (res) {
          this.showList();
          this.servicePointVillageMapList.data = [];
          this.villageIdList = undefined;
          this.availableVillages = [];
          this.editVillageMapping = undefined;
        }
      });
  }
}
