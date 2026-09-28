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
import { Component, OnInit } from '@angular/core';
import { UpdateVillageService } from 'src/app/core/services/ProviderAdminServices/update-village.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

export interface MappedVillage {
  villageID: string;
  villageName: string;
}

@Component({
  selector: 'app-update-village',
  templateUrl: './update-village.component.html',
  styleUrls: ['./update-village.component.css'],
})
export class UpdateVillageComponent implements OnInit {
  readonly countryID = 1; // hardcoded as country is INDIA

  serviceProviderID: any;
  userNamesList: any = [];
  user: any;
  userDetail: any = null;

  userMappings: any[] = [];
  mappingsLoaded = false;
  selectedMapping: any = null;
  oldVillage: MappedVillage | null = null;

  statesList: any[] = [];
  districtsList: any[] = [];
  blocksList: any[] = [];
  villagesList: any[] = [];

  state: any = null;
  district: any = null;
  block: any = null;
  newVillage: any = null;

  updateResult: any = null;
  submitting = false;

  displayedColumns = [
    'select',
    'uSRMappingID',
    'role',
    'serviceName',
    'stateName',
    'districtName',
    'blockName',
    'facilityName',
    'villages',
  ];

  constructor(
    private updateVillageService: UpdateVillageService,
    private alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getUserList();
    this.getStates();
  }

  getUserList() {
    this.updateVillageService.getUserList(this.serviceProviderID).subscribe(
      (response: any) => {
        this.userNamesList = response.data;
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  getStates() {
    this.updateVillageService.getStates(this.countryID).subscribe(
      (response: any) => {
        this.statesList = response.data || [];
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  onUserChange() {
    this.updateResult = null;
    this.userDetail = null;
    this.userMappings = [];
    this.mappingsLoaded = false;
    this.clearMappingSelection();
    if (!this.user) {
      return;
    }
    this.updateVillageService.getUserDetail(this.user.userName).subscribe(
      (response: any) => {
        this.userDetail = response.data || null;
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
    this.getUserMappings(this.user.userID);
  }

  getUserMappings(userID: any) {
    this.updateVillageService
      .getUserRoleMapped(this.serviceProviderID)
      .subscribe(
        (response: any) => {
          const rows = Array.isArray(response.data) ? response.data : [];
          this.userMappings = rows
            .filter((row: any) => row.userID === userID)
            .map((row: any) => ({
              ...row,
              mappedVillages: this.toMappedVillages(row),
            }));
          this.mappingsLoaded = true;
          if (this.userMappings.length === 1) {
            this.onMappingChange(this.userMappings[0]);
          }
        },
        (err: any) => {
          this.mappingsLoaded = true;
          this.alertService.alert(err.errorMessage, 'error');
        },
      );
  }

  // getUserRoleMapped returns villageID/villageName as parallel arrays split
  // from the comma-separated Villageid/VillageName columns.
  toMappedVillages(row: any): MappedVillage[] {
    const ids: any[] = row.villageID || [];
    const names: any[] = row.villageName || [];
    return ids
      .map((id: any, index: number) => ({
        villageID: String(id).trim(),
        villageName: (names[index] || '').toString().trim(),
      }))
      .filter((village: MappedVillage) => village.villageID !== '');
  }

  get displayName(): string {
    const source = this.userDetail || this.user || {};
    return [source.firstName, source.middleName, source.lastName]
      .filter((part: any) => !!part)
      .join(' ');
  }

  get mappingsWithVillages(): any[] {
    return this.userMappings.filter(
      (mapping: any) => mapping.mappedVillages.length > 0,
    );
  }

  clearMappingSelection() {
    this.selectedMapping = null;
    this.oldVillage = null;
    this.clearLocation();
  }

  clearLocation() {
    this.state = null;
    this.district = null;
    this.block = null;
    this.newVillage = null;
    this.districtsList = [];
    this.blocksList = [];
    this.villagesList = [];
  }

  selectMapping(mapping: any) {
    this.updateResult = null;
    this.onMappingChange(mapping);
  }

  onMappingChange(mapping: any) {
    this.selectedMapping = mapping;
    this.oldVillage =
      mapping.mappedVillages.length === 1 ? mapping.mappedVillages[0] : null;
    this.clearLocation();
    this.prefillLocation(mapping);
  }

  // Start the hierarchy at the mapping's current state/district/block, since
  // a correction is usually to a village in the same block.
  prefillLocation(mapping: any) {
    const state = this.statesList.find(
      (item: any) => item.stateID === mapping.stateID,
    );
    if (!state) {
      return;
    }
    this.state = state;
    this.loadDistricts(
      state.stateID,
      mapping.workingDistrictID,
      mapping.blockID,
    );
  }

  onStateChange() {
    this.updateResult = null;
    this.district = null;
    this.block = null;
    this.newVillage = null;
    this.districtsList = [];
    this.blocksList = [];
    this.villagesList = [];
    if (this.state) {
      this.loadDistricts(this.state.stateID);
    }
  }

  onDistrictChange() {
    this.updateResult = null;
    this.block = null;
    this.newVillage = null;
    this.blocksList = [];
    this.villagesList = [];
    if (this.district) {
      this.loadBlocks(this.district.districtID);
    }
  }

  onBlockChange() {
    this.updateResult = null;
    this.newVillage = null;
    this.villagesList = [];
    if (this.block) {
      this.loadVillages(this.block.blockID);
    }
  }

  onVillageChange() {
    this.updateResult = null;
  }

  loadDistricts(
    stateID: any,
    preselectDistrictID?: any,
    preselectBlockID?: any,
  ) {
    this.updateVillageService.getDistricts(stateID).subscribe(
      (response: any) => {
        this.districtsList = response.data || [];
        if (preselectDistrictID == null) {
          return;
        }
        const district = this.districtsList.find(
          (item: any) =>
            String(item.districtID) === String(preselectDistrictID),
        );
        if (district) {
          this.district = district;
          this.loadBlocks(district.districtID, preselectBlockID);
        }
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  loadBlocks(districtID: any, preselectBlockID?: any) {
    this.updateVillageService.getBlocks(districtID).subscribe(
      (response: any) => {
        this.blocksList = response.data || [];
        if (preselectBlockID == null) {
          return;
        }
        const block = this.blocksList.find(
          (item: any) => String(item.blockID) === String(preselectBlockID),
        );
        if (block) {
          this.block = block;
          this.loadVillages(block.blockID);
        }
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  loadVillages(blockID: any) {
    this.updateVillageService.getVillages(blockID).subscribe(
      (response: any) => {
        this.villagesList = response.data || [];
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  isAlreadyMapped(village: any): boolean {
    if (!this.selectedMapping || !village) {
      return false;
    }
    return this.selectedMapping.mappedVillages.some(
      (mapped: MappedVillage) =>
        mapped.villageID === String(village.districtBranchID),
    );
  }

  get blockChanged(): boolean {
    return (
      !!this.selectedMapping &&
      !!this.block &&
      this.selectedMapping.blockID != null &&
      String(this.selectedMapping.blockID) !== String(this.block.blockID)
    );
  }

  get validationMessage(): string | null {
    if (!this.user) {
      return 'Select a user';
    }
    if (!this.selectedMapping) {
      return 'Select the work location mapping to update';
    }
    if (!this.oldVillage) {
      return 'Select the village to replace';
    }
    if (!this.newVillage) {
      return 'Select the new village';
    }
    if (this.isAlreadyMapped(this.newVillage)) {
      return `${this.newVillage.villageName} is already mapped to this user`;
    }
    return null;
  }

  get canSubmit(): boolean {
    return this.validationMessage === null && !this.submitting;
  }

  buildRequest() {
    return {
      userID: this.user.userID,
      userName: this.user.userName,
      uSRMappingID: this.selectedMapping.uSRMappingID,
      roleID: this.selectedMapping.roleID,
      providerServiceMapID: this.selectedMapping.providerServiceMapID,
      oldBlockID: this.selectedMapping.blockID,
      oldVillageID: Number(this.oldVillage?.villageID),
      oldVillageName: this.oldVillage?.villageName,
      newStateID: this.state.stateID,
      newDistrictID: this.district.districtID,
      newBlockID: this.block.blockID,
      newBlockName: this.block.blockName,
      newVillageID: this.newVillage.districtBranchID,
      newVillageName: this.newVillage.villageName,
      modifiedBy: this.sessionstorage.getItem('uname'),
    };
  }

  confirmAndUpdate() {
    if (!this.canSubmit) {
      return;
    }
    const request = this.buildRequest();
    this.alertService
      .confirm('Confirm', this.confirmMessage(request))
      .subscribe((accept: any) => {
        if (accept) {
          this.update(request);
        }
      });
  }

  confirmMessage(request: any): string {
    const blockNote = this.blockChanged
      ? ` The new village is in a different block (${request.newBlockName}).`
      : '';
    return (
      `Change village for ${request.userName} (mapping ${request.uSRMappingID}) ` +
      `from ${request.oldVillageName} to ${request.newVillageName}?` +
      `${blockNote} This cannot be undone.`
    );
  }

  update(request: any) {
    this.submitting = true;
    this.updateVillageService.updateVillage(request).subscribe(
      (response: any) => {
        this.submitting = false;
        this.updateResult = response.data || request;
        this.alertService.alert('Village updated successfully', 'success');
        this.clearMappingSelection();
        this.getUserMappings(this.user.userID);
      },
      (err: any) => {
        this.submitting = false;
        this.alertService.alert(err.errorMessage, 'error');
      },
    );
  }
}
