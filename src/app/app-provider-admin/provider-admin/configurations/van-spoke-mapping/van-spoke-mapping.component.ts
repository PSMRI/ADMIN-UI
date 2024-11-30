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
import { FormGroup, FormBuilder } from '@angular/forms';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { VanSpokeMappingService } from 'src/app/core/services/ProviderAdminServices/van-spoke-mapping.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-van-spoke-mapping',
  templateUrl: './van-spoke-mapping.component.html',
  styleUrls: ['./van-spoke-mapping.component.css'],
})
export class VanSpokeMappingComponent implements OnInit {
  filteredListVanSpokeMapping = new MatTableDataSource<any>();
  vanSpokeMappedData = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'SNo',
    'ParkingPlace',
    'Van',
    'Spoke',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'ParkingPlace',
    'Van',
    'Spoke',
    'action',
  ];

  mmuVanDetailsForm!: FormGroup;
  tmSpokeDetailsForm!: FormGroup;
  mappingForm!: FormGroup;
  userID: any;
  servicelines: any = [];
  states: any = [];
  zones: any = [];
  parkingPlaces: any = [];
  servicepoints: any = [];
  vantypes: any = [];
  tm_servicelines: any = [];
  tm_states: any = [];
  tm_zones: any = [];
  tm_hubs: any = [];
  tm_servicepoints: any = [];
  tm_vantypes: any = [];
  tm_spokes: any = [];
  mmu_vans: any = [];
  listVanSpokeMapping: any = [];
  availableVans: any = [];
  tempVanIDArray: any = [];
  enabletmSpokeDetailsForm = false;
  enableMappingForm = false;
  showListOfMapping = false;
  status: any;
  basedOnVanmappingCallApi = false;
  delete = false;
  disableServiceline: any;

  constructor(
    private _dataService: dataService,
    private vanSpokeMappingService: VanSpokeMappingService,
    private fb: FormBuilder,
    private confirmationDialog: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.userID = this._dataService.uid;
    this.initMmuForm();
    this.initTmForm();
    this.initMappingForm();
    this.getProviderMappedServiceline();
  }
  initMmuForm() {
    this.mmuVanDetailsForm = this.fb.group({
      mmu_serviceline: null,
      mmu_state: null,
      mmu_zone: null,
      mmu_parkingPlace: null,
      mmu_servicePoint: null,
      mmu_vantype: null,
    });
  }
  initTmForm() {
    this.tmSpokeDetailsForm = this.fb.group({
      tm_serviceline: null,
      tm_state: null,
      tm_zone: null,
      tm_hub: null,
      tm_servicePoint: null,
      tm_vantype: null,
    });
  }
  initMappingForm() {
    this.mappingForm = this.fb.group({
      mmu_van: null,
      tm_spoke: null,
    });
  }
  getProviderMappedServiceline() {
    this.vanSpokeMappingService.getServiceLines(this.userID).subscribe(
      (serviceresponse: any) => {
        if (this.enabletmSpokeDetailsForm === true) {
          this.tm_servicelines = serviceresponse.data.filter((item: any) => {
            if (item.serviceID === 4) {
              return item;
            }
          });
        } else {
          this.servicelines = serviceresponse.data.filter((item: any) => {
            if (item.serviceID === 2) {
              return item;
            }
          });
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  /*boolean Value -- differentiate mmu and tm fields for reset*/
  getProviderMappedStates(selectedServiceline: any, booleanValue: any) {
    console.log('selected', selectedServiceline);
    const obj = {
      userID: this.userID,
      serviceID: selectedServiceline.serviceID,
      isNational: selectedServiceline.isNational,
    };
    this.vanSpokeMappingService.getStates(obj).subscribe(
      (statesResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_states = statesResponse.data;
        } else {
          this.states = statesResponse.data;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getProviderMappedZones(selectedState: any, booleanValue: any) {
    const reqObj = {
      providerServiceMapID: selectedState.providerServiceMapID,
    };
    this.vanSpokeMappingService.getZones(reqObj).subscribe(
      (zonesResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_zones = zonesResponse.data;
        } else {
          this.zones = zonesResponse.data;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getProviderMappedParkingPlace(
    selectedZone: any,
    selectedState: any,
    booleanValue: any,
  ) {
    const reqObj = {
      zoneID: selectedZone.zoneID,
      providerServiceMapID: selectedState.providerServiceMapID,
    };
    this.vanSpokeMappingService.getParkingPlace(reqObj).subscribe(
      (parkingPlaceResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_hubs = parkingPlaceResponse.data;
        } else {
          this.parkingPlaces = parkingPlaceResponse.data;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getProviderMappedServicepoint(
    state: any,
    parkingplace: any,
    booleanValue: any,
  ) {
    const reqObj = {
      stateID: state.stateID,
      parkingPlaceID: parkingplace.parkingPlaceID,
      serviceProviderID: this.sessionstorage.getItem('service_providerID'),
    };
    this.vanSpokeMappingService.getServicepoints(reqObj).subscribe(
      (servicepointResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_servicepoints = servicepointResponse.data;
        } else {
          this.servicepoints = servicepointResponse.data;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  getProviderMappedVanTypes(state: any, booleanValue: any) {
    const reqObj = {
      providerServicemapID: state.providerServiceMapID,
    };
    this.vanSpokeMappingService.getVanTypes(reqObj).subscribe(
      (vantypeResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_vantypes = vantypeResponse.data;
        } else {
          this.vantypes = vantypeResponse.data;
        }
      },
      (err) => {
        console.log(err);
      },
    );
  }
  enableSpokeDetails() {
    if (this.enabletmSpokeDetailsForm) {
      this.showListOfMapping = false;
    } else {
      this.showListOfMapping = true;
    }
    this.getAllVanSpokeMappingData();
  }
  getAllVanSpokeMappingData() {
    const fetchObj = {
      mmu_parkingplaceID:
        this.mmuVanDetailsForm.controls['mmu_parkingPlace'].value
          .parkingPlaceID,
      mmu_servicePointId:
        this.mmuVanDetailsForm.controls['mmu_servicePoint'].value
          .servicePointID,
      mmu_vanTypeID:
        this.mmuVanDetailsForm.controls['mmu_vantype'].value.vanTypeID,
    };
    this.vanSpokeMappingService.getVanSpokeMapping(fetchObj).subscribe(
      (fetchResponse: any) => {
        this.listVanSpokeMapping = fetchResponse.data.vanSpokeMappedDetails;
        this.filteredListVanSpokeMapping.data =
          fetchResponse.data.vanSpokeMappedDetails;
        this.filteredListVanSpokeMapping.paginator = this.paginator;
      },
      (err) => {
        console.log(err);
      },
    );
  }
  showForm() {
    this.showListOfMapping = false;
    this.enabletmSpokeDetailsForm = true;
    this.getProviderMappedServiceline();
  }
  getProviderMappedVansOrSpokes(
    state: any,
    parkingPlace: any,
    vanType: any,
    booleanValue: any,
  ) {
    const reqObj = {
      providerServiceMapID: state.providerServiceMapID,
      parkingPlaceID: parkingPlace.parkingPlaceID,
      vanTypeID: vanType.vanTypeID,
    };
    this.vanSpokeMappingService
      .getVansOrspoke(reqObj)
      .subscribe((vansResponse: any) => {
        if (this.enabletmSpokeDetailsForm === true && booleanValue === true) {
          this.tm_spokes = vansResponse.data;
          this.enableMappingForm = true;
        } else {
          this.availableVans = [];
          this.mmu_vans = vansResponse.data;
          if (this.mmu_vans) {
            this.fetchUnmappedVans(this.mmu_vans);
          } else {
            console.log('vans are unavailable');
          }
        }
      });
  }
  fetchUnmappedVans(vanmasterData: any) {
    vanmasterData.forEach((filterUnmappedVans: any) => {
      if (!filterUnmappedVans.vanSpokeMapped) {
        this.availableVans.push(filterUnmappedVans);
      } else {
        console.log('Vans are already mapped to spoke');
      }
    });
    if (this.vanSpokeMappedData.data.length > 0) {
      this.vanSpokeMappedData.data.forEach((vanList: any) => {
        this.tempVanIDArray.push(vanList.mmu_VanID);
      });
    }
    const temp: any = [];
    this.availableVans.forEach((tempvanList: any) => {
      const index = this.tempVanIDArray.indexOf(tempvanList.vanID);
      if (index < 0) {
        temp.push(tempvanList);
      }
    });
    this.availableVans = temp.slice();
    this.tempVanIDArray = [];
  }
  addVanSpokeMapping(mmuData: any, tmData: any, mappingData: any) {
    console.log(mappingData, mmuData, tmData);
    const vanData = mappingData.mmu_van;
    vanData.forEach((van: any) => {
      const saveObj: any = {
        mmu_StateID: mmuData.mmu_state.stateID,
        mmu_StateName: mmuData.mmu_state.stateName,
        mmu_ZoneID: mmuData.mmu_zone.zoneID,
        mmu_ZoneName: mmuData.mmu_zone.zoneName,
        mmu_parkingPlaceID: mmuData.mmu_parkingPlace.parkingPlaceID,
        mmu_parkingPlaceName: mmuData.mmu_parkingPlace.parkingPlaceName,
        mmu_servicePointID: mmuData.mmu_servicePoint.servicePointID,
        mmu_servicePointName: mmuData.mmu_servicePoint.servicePointName,
        mmu_vantypeID: mmuData.mmu_vantype.vanTypeID,
        mmu_vantypeName: mmuData.mmu_vantype.vanTypeName,
        tm_StateID: tmData.tm_state.stateID,
        tm_StateName: tmData.tm_state.stateName,
        tm_ZoneID: tmData.tm_zone.zoneID,
        tm_ZoneName: tmData.tm_zone.zoneName,
        tm_HubID: tmData.tm_hub.parkingPlaceID,
        tm_HubName: tmData.tm_hub.parkingPlaceName,
        tm_servicePointID: tmData.tm_servicePoint.servicePointID,
        tm_servicepointname: tmData.tm_servicePoint.servicePointName,
        tm_vanTypeID: tmData.tm_vantype.vanTypeID,
        tm_vantypeName: tmData.tm_vantype.vanTypeName,
        mmu_VanID: van.vanID,
        mmu_vanName: van.vanName,
        tm_SpokeID: mappingData.tm_spoke.vanID,
        tm_spokeName: mappingData.tm_spoke.vanName,
        createdBy: this._dataService.uname,
        tm_ProviderServiceMapID: tmData.tm_state.providerServiceMapID,
        mmu_ProviderServiceMapID: mmuData.mmu_state.providerServiceMapID,
      };
      this.vanSpokeMappedData.data.push(saveObj);
      this.mappingForm.reset();
      this.availableVans = [];
    });
    this.fetchUnmappedVans(this.mmu_vans);
    console.log('mapped', this.vanSpokeMappedData.data);
  }
  saveVanSpokeMapping() {
    const vanSpokeMapping = {
      vanSpokeMapping: this.vanSpokeMappedData.data,
    };
    this.vanSpokeMappingService.saveMappingData(vanSpokeMapping).subscribe(
      (saveResponse) => {
        this.confirmationDialog.alert('Saved Successfully', 'success');
        this.resetAllFormsdata();
        this.getAllVanSpokeMappingData();
      },
      (err) => {
        console.log(err);
      },
    );
  }
  resetAllFormsdata() {
    this.enabletmSpokeDetailsForm = false;
    this.enableMappingForm = false;
    this.showListOfMapping = true;
    this.tmSpokeDetailsForm.reset();
    this.mappingForm.reset();
    this.vanSpokeMappedData.data = [];
  }
  remove_vanSpokeMappedData(index: any) {
    this.vanSpokeMappedData.data.splice(index, 1);
    this.getProviderMappedVansOrSpokes(
      this.mmuVanDetailsForm.value.mmu_state,
      this.mmuVanDetailsForm.value.mmu_parkingPlace,
      this.mmuVanDetailsForm.value.mmu_vantype,
      false,
    );
  }
  filterMappingList(searchTerm: any) {
    if (!searchTerm) {
      this.filteredListVanSpokeMapping.data = this.listVanSpokeMapping;
    } else {
      this.filteredListVanSpokeMapping.data = [];
      this.listVanSpokeMapping.forEach((item: any) => {
        for (const key in item) {
          if (key === 'mmu_vanName' || key === 'tm_spokeName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredListVanSpokeMapping.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
  mappingStatus(mappedVanData: any, activeParkingPlace: any) {
    if (activeParkingPlace) {
      this.confirmationDialog.alert('Parking place is inactive');
    } else {
      const returnValue = this.listVanSpokeMapping.filter(
        (filtermappedVan: any) =>
          mappedVanData.mmu_VanID === filtermappedVan.mmu_VanID &&
          !filtermappedVan.deleted &&
          mappedVanData.deleted,
      );
      console.log(returnValue);
      if (returnValue.length > 0) {
        this.confirmationDialog.alert('Already van mapping exists');
      } else {
        if (mappedVanData.deleted) {
          this.status = 'Activate';
          this.delete = false;
        } else {
          this.status = 'Deactivate';
          this.delete = true;
        }

        this.confirmationDialog
          .confirm('Confirm', 'Are you sure you want to ' + this.status + '?')
          .subscribe((response) => {
            if (response) {
              const reqObj = Object.assign({}, mappedVanData, {
                deleted: this.delete,
              });
              this.vanSpokeMappingService
                .updateMappingStatus({ vanSpokeDelete: reqObj })
                .subscribe(
                  (mappingStatusResponse) => {
                    console.log(mappingStatusResponse, 'mappingStatusResponse');
                    this.confirmationDialog.alert(
                      this.status + 'd successfully',
                      'success',
                    );
                    this.basedOnVanmappingCallApi = false;
                    this.getAllVanSpokeMappingData();
                    this.getProviderMappedVansOrSpokes(
                      this.mmuVanDetailsForm.value.mmu_state,
                      this.mmuVanDetailsForm.value.mmu_parkingPlace,
                      this.mmuVanDetailsForm.value.mmu_vantype,
                      false,
                    );
                  },
                  (err) => {
                    console.log(err);
                  },
                );
            } else {
              console.log('Can status remains same');
            }
          });
      }
    }
  }
}
