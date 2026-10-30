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
import { PhiTransferConfigService } from '../../services/phi-transfer-config.service';

@Component({
  selector: 'app-create-phi-transfer',
  templateUrl: './create-phi-transfer.component.html',
  styleUrls: ['./create-phi-transfer.component.css'],
})
export class CreatePhiTransferComponent implements OnInit {
  @ViewChild('createPhiTransferForm') createPhiTransferForm!: NgForm;

  states_array: any = [];
  districts_array: any = [];
  tus_array: any = [];
  facilities_array: any = [];
  villages_array: any = [];

  state: any;
  district: any;
  tu: any;
  facility: any;
  village: any;

  designatedPhiId: any;
  designationHierarchyId: any;
  createdBy: any;

  constructor(
    private nikshayDeviceService: NikshayDeviceConfigService,
    private phiService: PhiTransferConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.getStates();
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
    this.villages_array = [];
    this.district = undefined;
    this.tu = undefined;
    this.facility = undefined;
    this.village = undefined;

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
    this.villages_array = [];
    this.tu = undefined;
    this.facility = undefined;
    this.village = undefined;

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
    this.villages_array = [];
    this.facility = undefined;
    this.village = undefined;

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
    this.villages_array = [];
    this.village = undefined;

    if (!this.facility) return;
    this.nikshayDeviceService
      .getVillages(this.facility.nikshayFacilityID)
      .subscribe(
        (response: any) => {
          this.villages_array = (response && response.data) || [];
        },
        (err: any) => {
          this.dialogService.alert(
            err?.errorMessage || 'Failed to load villages',
            'error',
          );
        },
      );
  }

  createPhiTransfer() {
    const requestObj = {
      villageId: this.village.nikshayVillageID,
      tbuId: this.tu.nikshayTUID,
      designatedPhiId: this.designatedPhiId,
      designationHierarchyId: this.designationHierarchyId || null,
      createdBy: this.createdBy,
    };

    this.phiService.createDesignatedPhi(requestObj).subscribe(
      () => {
        this.dialogService.alert(
          'Designated PHI transfer created successfully',
          'success',
        );
        this.resetForm();
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to create designated PHI transfer',
          'error',
        );
      },
    );
  }

  resetForm() {
    this.districts_array = [];
    this.tus_array = [];
    this.facilities_array = [];
    this.villages_array = [];
    this.createPhiTransferForm.resetForm();
  }
}
