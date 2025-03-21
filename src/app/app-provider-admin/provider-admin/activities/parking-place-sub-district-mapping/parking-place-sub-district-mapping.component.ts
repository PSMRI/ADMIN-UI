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
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';

import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ParkingPlaceMasterService } from 'src/app/core/services/ProviderAdminServices/parking-place-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-parking-place-sub-district-mapping',
  templateUrl: './parking-place-sub-district-mapping.component.html',
  styleUrls: ['./parking-place-sub-district-mapping.component.css'],
})
export class ParkingPlaceSubDistrictMappingComponent implements OnInit {
  userID: any;
  createdBy: any;
  providerServiceMapID: any;
  service: any;
  state: any;
  zoneID: any;
  parking_Place: any;
  district: any;
  taluk: any;
  status: any;
  editMappedValue: any;
  parkAndHub: any;

  showTable = false;
  editable = false;
  disableSelection = false;
  showListOfMapping = true;
  enableButton = false;

  /*Arrays*/
  servicelines: any = [];
  states: any = [];
  zones: any = [];
  parkingPlaces: any = [];
  mappedParkingPlaceDistricts: any = [];
  districts: any = [];
  taluks: any = [];
  existingTaluks: any = [];
  availableTaluks: any = [];
  bufferTalukArray: any = [];
  displayedColumns = [
    'sno',
    'parkingPlaceName',
    'districtName',
    'districtBlockName',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'parkingPlaceName',
    'districtName',
    'districtBlockName',
    'action',
  ];
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredMappedParkingPlaceDistricts = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredMappedParkingPlaceDistricts.paginator = this.paginator;
  }

  @ViewChild('mappingForm') mappingForm!: NgForm;
  @ViewChild(MatSort) sort: MatSort | null = null;

  @ViewChild(MatPaginator) addparkingpaginator: MatPaginator | null = null;
  mappingList = new MatTableDataSource<any>();

  constructor(
    public commonDataService: dataService,
    public parkingPlaceMasterService: ParkingPlaceMasterService,
    private alertService: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.createdBy = this.commonDataService.uname;
    this.getServicelines();
  }
  getServicelines() {
    this.parkingPlaceMasterService
      .getServiceLinesNew(this.userID)
      .subscribe((response: any) => {
        this.getServicesSuccessHandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
          };
      });
  }
  getServicesSuccessHandeler(response: any) {
    this.servicelines = response.data;
    this.servicelines = this.servicelines.filter((item: any) =>
      [2, 4, 9].includes(item.serviceID),
    );
  }
  getStates(value: any) {
    this.resetArrays();
    if (value.serviceID === 4) {
      this.parkAndHub = 'Hub';
    } else {
      this.parkAndHub = 'Parking Place';
    }
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.parkingPlaceMasterService
      .getStatesNew(obj)
      .subscribe((response: any) => {
        this.getStatesSuccessHandeler(response),
          (err: any) => {
            console.log('error in fetching states', err);
          };
      });
  }

  getStatesSuccessHandeler(response: any) {
    this.states = response.data;
  }
  resetArrays() {
    this.mappedParkingPlaceDistricts = [];
    this.filteredMappedParkingPlaceDistricts.data = [];
    this.enableButton = false;
    this.zones = [];
    this.parkingPlaces = [];
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    this.resetArrays();
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getAvailableZones(this.providerServiceMapID);
  }
  getAvailableZones(providerServiceMapID: any) {
    this.parkingPlaceMasterService
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
    this.mappedParkingPlaceDistricts = [];
    this.filteredMappedParkingPlaceDistricts.data = [];
    this.enableButton = false;
    const parkingPlaceObj = {
      zoneID: zoneID,
      providerServiceMapID: providerServiceMapID,
    };
    this.parkingPlaceMasterService
      .getParkingPlaces(parkingPlaceObj)
      .subscribe((response: any) =>
        this.getParkingPlaceSuccessHandler(response),
      );
  }
  getParkingPlaceSuccessHandler(response: any) {
    this.parkingPlaces = response.data;
  }
  getParkingPlaceSubDistrictMappings(
    providerServiceMapID: any,
    zoneID: any,
    parkingPlaceID: any,
  ) {
    const mappedReqObj = {
      providerServiceMapID: providerServiceMapID,
      zoneID: zoneID,
      parkingPlaceID: parkingPlaceID,
    };
    this.parkingPlaceMasterService
      .getAllParkingPlaceSubDistrictMapping(mappedReqObj)
      .subscribe((response: any) => this.getMappingSuccessHandler(response));
  }
  getMappingSuccessHandler(response: any) {
    this.mappedParkingPlaceDistricts.data = response.data;
    this.filteredMappedParkingPlaceDistricts.data = response.data;
    this.showTable = true;
    this.enableButton = true;
  }

  showForm() {
    this.disableSelection = true;
    this.showTable = false;
    this.showListOfMapping = false;
    this.getDistricts(this.zoneID.zoneID);
  }
  getDistricts(zoneID: any) {
    this.parkingPlaceMasterService
      .getDistricts(zoneID)
      .subscribe((districtResponse: any) =>
        this.getDistrictsSuccessHandeler(districtResponse),
      );
  }
  getDistrictsSuccessHandeler(districtResponse: any) {
    this.districts = districtResponse.data;
    if (this.editMappedValue !== undefined) {
      const editDistrict = this.districts.filter((editDistrictValue: any) => {
        if (
          this.editMappedValue.districtID !== undefined &&
          this.editMappedValue.districtID === editDistrictValue.districtID
        ) {
          return editDistrictValue;
        }
      })[0];
      if (editDistrict) {
        this.district = editDistrict;
      }
    }
  }
  getTaluks(districtID: any, providerServiceMapID: any) {
    this.taluk = null;
    this.parkingPlaceMasterService
      .getTaluks(districtID)
      .subscribe((talukResponse: any) =>
        this.getTaluksSuccessHandler(
          talukResponse,
          districtID,
          providerServiceMapID,
        ),
      );
  }
  getTaluksSuccessHandler(
    talukResponse: any,
    districtID: any,
    providerServiceMapID: any,
  ) {
    this.taluks = talukResponse;
    if (this.taluks) {
      this.checkExistance(districtID, providerServiceMapID);
    }
  }
  checkExistance(districtID: any, providerServiceMapID: any) {
    const unmappedObj = {
      districtID: districtID,
      providerServiceMapID: providerServiceMapID,
    };
    this.parkingPlaceMasterService
      .filterMappedTaluks(unmappedObj)
      .subscribe((response: any) => {
        this.availableTaluks = response.data;
        console.log('availableTaluks', this.availableTaluks);
        if (!this.editable) {
          if (this.mappingList.data.length > 0) {
            this.mappingList.data.forEach((talukList: any) => {
              this.bufferTalukArray.push(talukList.districtBlockID);
            });
          }

          const bufferTemp: any = [];
          this.availableTaluks.forEach((bufferTaluk: any) => {
            const index = this.bufferTalukArray.indexOf(bufferTaluk.blockID);
            if (index < 0) {
              bufferTemp.push(bufferTaluk);
            }
          });
          this.availableTaluks = bufferTemp.slice();
          this.bufferTalukArray = [];
        }
        // on edit - populate the non mapped categories
        else {
          if (this.editMappedValue !== undefined) {
            const editTaluk = this.taluks.filter((editTalukValue: any) => {
              if (
                this.editMappedValue.districtBlockID ===
                  editTalukValue.blockID &&
                this.editMappedValue.districtID === this.district.districtID
              ) {
                return editTalukValue;
              }
            })[0];
            if (editTaluk) {
              this.taluk = editTaluk;
              this.availableTaluks.push(editTaluk);
            }
          }
        }
      });
  }

  addMappingObject(formValue: any) {
    console.log('formValue', formValue);
    for (const taluks of formValue.taluk) {
      const talukID = taluks.blockID;
      const mappingObject = {
        providerServiceMapID: this.providerServiceMapID,
        parkingPlaceID: this.parking_Place.parkingPlaceID,
        parkingPlaceName: this.parking_Place.parkingPlaceName,
        districtID: formValue.district.districtID,
        districtName: formValue.district.districtName,
        districtBlockID: talukID,
        districtBlockName: taluks.blockName,
        createdBy: this.createdBy,
      };
      this.mappingList.data = [...this.mappingList.data, mappingObject];
      this.mappingForm.resetForm();
      this.availableTaluks = [];
    }
  }

  remove_obj(index: number) {
    const newData = [...this.mappingList.data];
    newData.splice(index, 1);
    this.mappingList.data = newData;
    this.cdr.detectChanges();
  }

  saveSubdistrictMapping() {
    this.parkingPlaceMasterService
      .saveParkingPlaceSubDistrictMapping(this.mappingList.data)
      .subscribe((response: any) => this.saveSuccessHandler(response));
  }
  saveSuccessHandler(response: any) {
    this.alertService.alert('Mapping saved successfully', 'success');
    this.mappingList.data = [];
    this.showList();
  }
  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res: any) => {
        if (res) {
          this.showList();
          this.mappingList.data = [];
          this.editMappedValue = undefined;
        }
      });
  }
  showList() {
    this.getParkingPlaceSubDistrictMappings(
      this.state.providerServiceMapID,
      this.zoneID.zoneID,
      this.parking_Place.parkingPlaceID,
    );
    this.editable = false;
    this.disableSelection = false;
    this.showListOfMapping = true;
    this.showTable = false;
    this.mappingForm.resetForm();
  }

  editSubDistrictMapping(selectedValue: any) {
    console.log('selectedValue', selectedValue);
    this.editable = true;
    this.disableSelection = true;
    this.showListOfMapping = false;
    this.showTable = false;
    this.editMappedValue = selectedValue;
    this.getDistricts(this.zoneID.zoneID);
    this.getTaluks(
      selectedValue.districtID,
      selectedValue.providerServiceMapID,
    );
  }

  updateSubdistrictMapping(formValue: any) {
    const updateObj = {
      ppSubDistrictMapID: this.editMappedValue.ppSubDistrictMapID,
      providerServiceMapID: this.editMappedValue.providerServiceMapID,
      parkingPlaceID: this.editMappedValue.parkingPlaceID,
      districtID: formValue.district.districtID,
      districtBlockID: formValue.taluk.blockID,
      createdBy: this.createdBy,
    };
    this.parkingPlaceMasterService
      .updateTalukMapping(updateObj)
      .subscribe((response: any) => this.updateSuccessHandler(response));
  }
  updateSuccessHandler(response: any) {
    this.editMappedValue = null;
    this.showList();
    this.alertService.alert('Updated successfully', 'success');
  }

  activateDeactivateMapping(parkingPlace: any, parkingPlaceNotExist: any) {
    if (parkingPlaceNotExist) {
      this.alertService.alert('Parking place is inactive');
    } else {
      const flag = !parkingPlace.deleted;

      if (flag) {
        this.status = 'Deactivate';
      } else {
        this.status = 'Activate';
      }
      this.alertService
        .confirm('Confirm', 'Are you sure you want to ' + this.status + '?')
        .subscribe(
          (res: any) => {
            if (res) {
              const obj = {
                ppSubDistrictMapID: parkingPlace.ppSubDistrictMapID,
                deleted: flag,
              };
              console.log('Deactivating or activating Obj', obj);
              this.parkingPlaceMasterService
                .mappingActivationDeactivation(obj)
                .subscribe(
                  (res: any) => {
                    console.log('Activation or deactivation response', res);
                    this.alertService.alert(
                      this.status + 'd successfully',
                      'success',
                    );
                    this.getParkingPlaceSubDistrictMappings(
                      this.state.providerServiceMapID,
                      this.zoneID.zoneID,
                      this.parking_Place.parkingPlaceID,
                    );
                  },
                  (err: any) => console.log('error', err),
                );
            }
          },
          (err: any) => {
            console.log(err);
          },
        );
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredMappedParkingPlaceDistricts.data =
        this.mappedParkingPlaceDistricts;
      this.filteredMappedParkingPlaceDistricts.paginator = this.paginator;
    } else {
      this.filteredMappedParkingPlaceDistricts.data = [];
      this.mappedParkingPlaceDistricts.forEach((item: any) => {
        for (const key in item) {
          if (key === 'districtName' || key === 'districtBlockName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredMappedParkingPlaceDistricts.data.push(item);
              break;
            }
          }
        }
      });
      this.filteredMappedParkingPlaceDistricts.paginator = this.paginator;
    }
  }
}
