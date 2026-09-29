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
  facilitiesList: any[] = [];
  facilityVillagesLoaded = false;
  villagesList: any[] = [];

  state: any = null;
  district: any = null;
  block: any = null;
  facility: any = null;
  newVillage: any = null;

  // districtBranchIDs mapped to the selected mapping's facility; null when the
  // mapping has no facility or they have not loaded.
  facilityVillageIDs: Set<string> | null = null;
  private pendingPrefill: any = null;

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
      (err: any) => this.showError(err),
    );
  }

  showError(err: any) {
    this.alertService.alert(
      err?.errorMessage || err?.error?.errorMessage || 'Something went wrong',
      'error',
    );
  }

  getStates() {
    this.updateVillageService.getStates(this.countryID).subscribe(
      (response: any) => {
        this.statesList = response.data || [];
        if (this.pendingPrefill) {
          const mapping = this.pendingPrefill;
          this.pendingPrefill = null;
          this.prefillLocation(mapping);
        }
      },
      (err: any) => this.showError(err),
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
    const userID = this.user.userID;
    this.updateVillageService.getUserDetail(this.user.userName).subscribe(
      (response: any) => {
        if (this.user?.userID === userID) {
          this.userDetail = response.data || null;
        }
      },
      (err: any) => this.showError(err),
    );
    this.getUserMappings(this.user.userID);
  }

  getUserMappings(userID: any) {
    this.updateVillageService
      .getUserRoleMapped(this.serviceProviderID)
      .subscribe(
        (response: any) => {
          if (this.user?.userID !== userID) {
            return;
          }
          const rows = Array.isArray(response.data) ? response.data : [];
          this.userMappings = rows
            .filter((row: any) => this.isEditableMapping(row, userID))
            .map((row: any) => ({
              ...row,
              mappedVillages: this.toMappedVillages(row),
            }));
          this.mappingsLoaded = true;
          if (this.mappingsWithVillages.length === 1) {
            this.onMappingChange(this.mappingsWithVillages[0]);
          }
        },
        (err: any) => {
          if (this.user?.userID !== userID) {
            return;
          }
          this.mappingsLoaded = true;
          this.showError(err);
        },
      );
  }

  // Databases before the V100 view change still return deactivated rows, and
  // Stop TB mappings hold Nikshay village IDs rather than AMRIT villages.
  isEditableMapping(row: any, userID: any): boolean {
    return (
      row.userID === userID &&
      row.userServciceRoleDeleted !== true &&
      row.userDeleted !== true &&
      row.serviceName !== 'Stop TB'
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
    this.facilityVillageIDs = null;
    this.pendingPrefill = null;
    this.clearLocation();
  }

  clearLocation() {
    this.state = null;
    this.district = null;
    this.block = null;
    this.newVillage = null;
    this.districtsList = [];
    this.blocksList = [];
    this.clearFacilities();
  }

  clearFacilities() {
    this.facility = null;
    this.facilitiesList = [];
    this.facilityVillagesLoaded = false;
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
    this.loadFacilityVillages(mapping);
    this.prefillLocation(mapping);
  }

  loadFacilityVillages(mapping: any) {
    this.facilityVillageIDs = null;
    if (mapping.facilityID == null) {
      return;
    }
    this.updateVillageService.getFacilityVillages(mapping.facilityID).subscribe(
      (response: any) => {
        if (this.selectedMapping !== mapping) {
          return;
        }
        const villages = Array.isArray(response.data) ? response.data : [];
        this.facilityVillageIDs = new Set(
          villages.map((village: any) => String(village.districtBranchID)),
        );
      },
      (err: any) => this.showError(err),
    );
  }

  isOutsideFacility(village: any): boolean {
    return (
      !!village &&
      !!this.facilityVillageIDs &&
      !this.facilityVillageIDs.has(String(village.districtBranchID))
    );
  }

  // Start the hierarchy at the mapping's current state/district/block, since
  // a correction is usually to a village in the same block.
  prefillLocation(mapping: any) {
    if (this.statesList.length === 0) {
      this.pendingPrefill = mapping;
      return;
    }
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
      mapping.facilityID,
    );
  }

  onStateChange() {
    this.updateResult = null;
    this.district = null;
    this.block = null;
    this.newVillage = null;
    this.districtsList = [];
    this.blocksList = [];
    this.clearFacilities();
    if (this.state) {
      this.loadDistricts(this.state.stateID);
    }
  }

  onDistrictChange() {
    this.updateResult = null;
    this.block = null;
    this.newVillage = null;
    this.blocksList = [];
    this.clearFacilities();
    if (this.district) {
      this.loadBlocks(this.district.districtID);
    }
  }

  onBlockChange() {
    this.updateResult = null;
    this.newVillage = null;
    this.clearFacilities();
    if (this.block) {
      this.loadFacilities(this.block.blockID);
    }
  }

  onFacilityChange() {
    this.updateResult = null;
    this.newVillage = null;
    this.villagesList = [];
    if (this.facility) {
      this.loadFacilityVillageList(this.facility.facilityID);
    } else if (this.block) {
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
    preselectFacilityID?: any,
  ) {
    this.updateVillageService.getDistricts(stateID).subscribe(
      (response: any) => {
        if (this.state?.stateID !== stateID) {
          return;
        }
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
          this.loadBlocks(
            district.districtID,
            preselectBlockID,
            preselectFacilityID,
          );
        }
      },
      (err: any) => this.showError(err),
    );
  }

  loadBlocks(
    districtID: any,
    preselectBlockID?: any,
    preselectFacilityID?: any,
  ) {
    this.updateVillageService.getBlocks(districtID).subscribe(
      (response: any) => {
        if (this.district?.districtID !== districtID) {
          return;
        }
        this.blocksList = response.data || [];
        if (preselectBlockID == null) {
          return;
        }
        const block = this.blocksList.find(
          (item: any) => String(item.blockID) === String(preselectBlockID),
        );
        if (block) {
          this.block = block;
          this.loadFacilities(block.blockID, preselectFacilityID);
        }
      },
      (err: any) => this.showError(err),
    );
  }

  // Facility is optional: without one the Village list is the whole block,
  // with one it narrows to that facility's villages.
  loadFacilities(blockID: any, preselectFacilityID?: any) {
    this.updateVillageService.getFacilitiesByBlock(blockID).subscribe(
      (response: any) => {
        if (this.block?.blockID !== blockID) {
          return;
        }
        this.facilitiesList = Array.isArray(response.data) ? response.data : [];
        const facility = this.facilitiesList.find(
          (item: any) =>
            preselectFacilityID != null &&
            String(item.facilityID) === String(preselectFacilityID),
        );
        if (facility) {
          this.facility = facility;
          this.loadFacilityVillageList(facility.facilityID);
        } else {
          this.loadVillages(blockID);
        }
      },
      (err: any) => {
        if (this.block?.blockID !== blockID) {
          return;
        }
        this.showError(err);
        this.loadVillages(blockID);
      },
    );
  }

  loadFacilityVillageList(facilityID: any) {
    this.facilityVillagesLoaded = false;
    this.updateVillageService.getFacilityVillages(facilityID).subscribe(
      (response: any) => {
        if (this.facility?.facilityID !== facilityID) {
          return;
        }
        this.villagesList = Array.isArray(response.data) ? response.data : [];
        this.facilityVillagesLoaded = true;
      },
      (err: any) => {
        if (this.facility?.facilityID === facilityID) {
          this.facilityVillagesLoaded = true;
        }
        this.showError(err);
      },
    );
  }

  get hasFacilities(): boolean {
    return this.facilitiesList.length > 0;
  }

  get villageSelectDisabled(): boolean {
    return !this.block;
  }

  loadVillages(blockID: any) {
    this.updateVillageService.getVillages(blockID).subscribe(
      (response: any) => {
        if (this.block?.blockID !== blockID || this.facility) {
          return;
        }
        this.villagesList = response.data || [];
      },
      (err: any) => this.showError(err),
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
    const facilityNote = this.isOutsideFacility(this.newVillage)
      ? ` It is not mapped to facility ${this.selectedMapping.facilityName || this.selectedMapping.facilityID}, so Work Location Mapping will drop it on the next edit unless the facility's villages are updated.`
      : '';
    const addressNote =
      this.selectedMapping.mappedVillages.length === 1
        ? ` All beneficiary addresses registered by ${request.userName} will be moved to ${request.newVillageName}.`
        : ` Beneficiary addresses registered by ${request.userName} in ${request.oldVillageName} will be moved to ${request.newVillageName}.`;
    return (
      `Change village for ${request.userName} (mapping ${request.uSRMappingID}) ` +
      `from ${request.oldVillageName} to ${request.newVillageName}?` +
      `${addressNote}${blockNote}${facilityNote} This cannot be undone.`
    );
  }

  update(request: any) {
    this.submitting = true;
    this.updateVillageService.updateVillage(request).subscribe(
      (response: any) => {
        this.submitting = false;
        this.updateResult = { ...request, ...(response?.data || {}) };
        this.alertService.alert('Village updated successfully', 'success');
        this.clearMappingSelection();
        this.getUserMappings(this.user.userID);
      },
      (err: any) => {
        this.submitting = false;
        this.showError(err);
      },
    );
  }
}
