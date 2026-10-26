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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';

@Component({
  selector: 'app-link-nikshay-device',
  templateUrl: './link-nikshay-device.component.html',
  styleUrls: ['./link-nikshay-device.component.css'],
})
export class LinkNikshayDeviceComponent implements OnInit {
  @ViewChild('linkDeviceForm') linkDeviceForm!: NgForm;

  devices_array: any = [];
  states_array: any = [];
  districts_array: any = [];
  tus_array: any = [];
  facilities_array: any = [];
  villages_array: any = [];

  selectedDevice: any;
  state: any;
  district: any;
  tu: any;
  facility: any;
  selectedVillages: any = [];

  villageSearch = '';
  filteredVillages: any = [];

  createdBy: any;

  constructor(
    private nikshayDeviceService: NikshayDeviceConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.getDevices();
    this.getStates();
  }

  getDevices() {
    this.nikshayDeviceService.listDevices().subscribe(
      (response: any) => {
        this.devices_array = (response && response.data) || [];
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load devices',
          'error',
        );
      },
    );
  }

  getStates() {
    this.nikshayDeviceService.getStates().subscribe(
      (response: any) => {
        this.states_array = (response && response.data) || [];
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load states',
          'error',
        );
      },
    );
  }

  getDistricts() {
    this.districts_array = [];
    this.tus_array = [];
    this.facilities_array = [];
    this.resetVillages();
    this.district = undefined;
    this.tu = undefined;
    this.facility = undefined;

    if (!this.state) return;
    this.nikshayDeviceService.getDistricts(this.state.nikshayStateID).subscribe(
      (response: any) => {
        this.districts_array = (response && response.data) || [];
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load districts',
          'error',
        );
      },
    );
  }

  getTUs() {
    this.tus_array = [];
    this.facilities_array = [];
    this.resetVillages();
    this.tu = undefined;
    this.facility = undefined;

    if (!this.district) return;
    this.nikshayDeviceService.getTUs(this.district.nikshayDistrictID).subscribe(
      (response: any) => {
        this.tus_array = (response && response.data) || [];
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load TUs',
          'error',
        );
      },
    );
  }

  getFacilities() {
    this.facilities_array = [];
    this.resetVillages();
    this.facility = undefined;

    if (!this.tu) return;
    this.nikshayDeviceService.getFacilities(this.tu.nikshayTUID).subscribe(
      (response: any) => {
        this.facilities_array = (response && response.data) || [];
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load facilities',
          'error',
        );
      },
    );
  }

  getVillages() {
    this.resetVillages();

    if (!this.facility) return;
    this.nikshayDeviceService
      .getVillages(this.facility.nikshayFacilityID)
      .subscribe(
        (response: any) => {
          this.villages_array = (response && response.data) || [];
          this.applyVillageFilter();
        },
        (err: any) => {
          this.dialogService.alert(
            err?.errorMessage || 'Failed to load villages',
            'error',
          );
        },
      );
  }

  resetVillages() {
    this.villages_array = [];
    this.selectedVillages = [];
    this.villageSearch = '';
    this.applyVillageFilter();
  }

  applyVillageFilter(term?: string) {
    if (term !== undefined) this.villageSearch = term;
    if (!this.villageSearch) {
      this.filteredVillages = this.villages_array.slice();
    } else {
      const s = this.villageSearch.toLowerCase();
      const selectedIDs = new Set(
        (this.selectedVillages || []).map((v: any) => v.nikshayVillageID),
      );
      this.filteredVillages = this.villages_array.filter(
        (v: any) =>
          selectedIDs.has(v.nikshayVillageID) ||
          (v.villageName || '').toLowerCase().includes(s),
      );
    }
  }

  get allVillagesSelected(): boolean {
    return (
      this.filteredVillages.length > 0 &&
      this.selectedVillages.length === this.villages_array.length
    );
  }

  toggleSelectAllVillages() {
    if (this.allVillagesSelected) {
      this.selectedVillages = [];
    } else {
      this.selectedVillages = this.villages_array.slice();
    }
  }

  compareVillages(v1: any, v2: any): boolean {
    return v1 && v2 && v1.nikshayVillageID === v2.nikshayVillageID;
  }

  linkDevice() {
    const requestObj = {
      deviceDetailId: this.selectedDevice.id,
      createdBy: this.createdBy,
      villages: this.selectedVillages.map((v: any) => ({
        stateId: this.state.nikshayStateID,
        districtId: this.district.nikshayDistrictID,
        tbuId: this.tu.nikshayTUID,
        facilityId: this.facility.nikshayFacilityID,
        villageId: v.nikshayVillageID,
      })),
    };

    this.nikshayDeviceService.linkDeviceToVillage(requestObj).subscribe(
      () => {
        this.dialogService.alert('Device linked successfully', 'success');
        this.resetForm();
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to link device',
          'error',
        );
      },
    );
  }

  resetForm() {
    this.districts_array = [];
    this.tus_array = [];
    this.facilities_array = [];
    this.resetVillages();
    this.linkDeviceForm.resetForm();
  }
}
