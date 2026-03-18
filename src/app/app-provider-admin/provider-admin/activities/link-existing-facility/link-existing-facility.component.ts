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
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-link-existing-facility',
  templateUrl: './link-existing-facility.component.html',
  styleUrls: ['./link-existing-facility.component.css'],
})
export class LinkExistingFacilityComponent implements OnInit {
  unmappedFacilityList = new MatTableDataSource<any>();
  @ViewChild('tablePaginator') tablePaginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'sno',
    'facilityName',
    'facilityCode',
    'storeType',
    'action',
  ];

  // Service Line & State
  service: any;
  state: any;
  services_array: any = [];
  states_array: any = [];
  providerServiceMapID: any;
  userID: any;

  // For hierarchy form - need location info
  district: any;
  taluk: any;
  districts_array: any = [];
  taluks_array: any = [];

  facilityTypes_array: any = [];
  filteredFacilityTypes: any = [];
  facilityLevels_array: any = [];
  allFacilitiesList: any = [];

  // Link form fields
  selectedFacility: any = null;
  facilityTypeID: any;
  formRuralUrban: any;
  selectedLevel: any = null;

  // Villages (for SC level)
  villages_array: any = [];
  selectedVillages: any = [];
  mainVillageID: number | null = null;
  villageSearch = '';
  filteredVillages: any = [];

  // Child facilities (for PHC/CHC/DH level)
  childFacilities_array: any = [];
  selectedChildFacilities: any = [];
  childFacilitySearch = '';
  filteredChildFacilities: any = [];

  // Drill-down for higher levels (PHC/CHC → select SC → Main Village)
  drillDownSteps: any[] = [];
  drillDownVillages: any[] = [];

  createdBy: any;
  showTableFlag = false;
  tableMode = true;
  formMode = false;
  create_filterTerm!: string;

  constructor(
    private facility: FacilityMasterService,
    private storeService: Mainstroreandsubstore,
    public commonDataService: dataService,
    public commonServices: CommonServices,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.userID = this.commonDataService.uid;
    this.getAllServices();
    this.getFacilityLevels();
  }

  getAllServices() {
    this.commonServices.getServiceLines(this.userID).subscribe(
      (response: any) => {
        this.services_array = response.data.filter(
          (item: any) => item.serviceID === 4 || item.serviceID === 9,
        );
      },
      () => {
        console.log('ERROR in fetching serviceline');
      },
    );
  }

  getStates(service: any) {
    this.commonServices
      .getStatesOnServices(this.userID, service.serviceID, false)
      .subscribe(
        (response: any) => {
          this.states_array = response.data;
        },
        () => {
          console.log('error in fetching states');
        },
      );
  }

  onStateSelect(state: any) {
    this.providerServiceMapID = state.providerServiceMapID;
    this.loadFacilityTypesByState(state.stateID, () => {
      this.loadUnmappedFacilities(this.providerServiceMapID);
    });
  }

  getFacilityLevels() {
    this.facility.getFacilityLevels().subscribe((response: any) => {
      if (response && response.data) {
        this.facilityLevels_array = response.data;
      }
    });
  }

  getMaxLevelValue(): number {
    if (!this.facilityLevels_array || this.facilityLevels_array.length === 0)
      return 5;
    return Math.max(...this.facilityLevels_array.map((l: any) => l.levelValue));
  }

  isLowestLevel(levelValue: number): boolean {
    return levelValue === this.getMaxLevelValue();
  }

  isHigherLevel(levelValue: number): boolean {
    return levelValue < this.getMaxLevelValue();
  }

  initDrillDown() {
    if (!this.selectedLevel) return;
    const currentLevel = this.selectedLevel.levelValue;
    const maxLevel = this.getMaxLevelValue();
    this.drillDownSteps = [];
    this.drillDownVillages = [];
    this.mainVillageID = null;

    for (let lv = currentLevel + 1; lv <= maxLevel; lv++) {
      const level = this.facilityLevels_array.find(
        (l: any) => l.levelValue === lv,
      );
      this.drillDownSteps.push({
        levelValue: lv,
        levelName: level ? level.levelName : 'Level ' + lv,
        facilities: [],
        selectedFacilityID: null,
      });
    }

    if (
      this.drillDownSteps.length > 0 &&
      this.selectedChildFacilities.length > 0
    ) {
      this.drillDownSteps[0].facilities = this.selectedChildFacilities;
    }
  }

  onDrillDownSelect(stepIndex: number, facilityID: number) {
    for (let i = stepIndex + 1; i < this.drillDownSteps.length; i++) {
      this.drillDownSteps[i].facilities = [];
      this.drillDownSteps[i].selectedFacilityID = null;
    }
    this.drillDownVillages = [];
    this.mainVillageID = null;

    if (!facilityID) return;

    if (stepIndex === this.drillDownSteps.length - 1) {
      this.facility
        .getVillageMappingsByFacility(facilityID)
        .subscribe((res: any) => {
          this.drillDownVillages = res.data || res || [];
        });
    } else {
      this.facility
        .getChildFacilitiesByParent(facilityID)
        .subscribe((res: any) => {
          this.drillDownSteps[stepIndex + 1].facilities = res.data || res || [];
        });
    }
  }

  loadFacilityTypesByState(stateID: number, callback?: () => void) {
    this.facility
      .getFacilityTypesByState(stateID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.facilityTypes_array = response.data.filter(
            (item: any) => !item.deleted,
          );
        } else {
          this.facilityTypes_array = [];
        }
        this.filteredFacilityTypes = [];
        if (callback) callback();
      });
  }

  loadUnmappedFacilities(providerServiceMapID: any) {
    this.storeService
      .getAllStores(providerServiceMapID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.allFacilitiesList = response.data;
          // Get hierarchy facilityType IDs to exclude already-linked facilities
          const hierarchyTypeIDs = this.facilityTypes_array.map(
            (ft: any) => ft.facilityTypeID,
          );
          // Show facilities not yet in hierarchy: valid name, has PSMID, facilityTypeID not a hierarchy type
          const unmapped = response.data.filter(
            (f: any) =>
              !f.deleted &&
              !f.parentFacilityID &&
              f.facilityName &&
              f.providerServiceMapID &&
              !hierarchyTypeIDs.includes(f.facilityTypeID),
          );
          this.unmappedFacilityList.data = unmapped;
          this.unmappedFacilityList.paginator = this.tablePaginator;
        } else {
          this.allFacilitiesList = [];
          this.unmappedFacilityList.data = [];
        }
        this.showTableFlag = true;
      });
  }

  filterList(searchTerm?: string) {
    const hierarchyTypeIDs = this.facilityTypes_array.map(
      (ft: any) => ft.facilityTypeID,
    );
    const unmapped = this.allFacilitiesList.filter(
      (f: any) =>
        !f.deleted &&
        !f.parentFacilityID &&
        f.facilityName &&
        f.providerServiceMapID &&
        !hierarchyTypeIDs.includes(f.facilityTypeID),
    );
    if (!searchTerm) {
      this.unmappedFacilityList.data = unmapped;
    } else {
      this.unmappedFacilityList.data = unmapped.filter((item: any) =>
        (item.facilityName || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
      );
    }
    this.unmappedFacilityList.paginator = this.tablePaginator;
  }

  linkFacility(item: any) {
    this.selectedFacility = item;
    this.tableMode = false;
    this.formMode = true;
    this.resetFormFields();
    // Load districts for the state
    if (this.state?.stateID) {
      this.facility
        .getDistricts(this.state.stateID)
        .subscribe((response: any) => {
          if (response && response.data) {
            this.districts_array = response.data;
          }
        });
    }
  }

  onDistrictChange(districtId: number) {
    this.taluks_array = [];
    this.taluk = undefined;
    this.facility.getTaluks(districtId).subscribe((response: any) => {
      if (response && response.data) {
        this.taluks_array = response.data;
      }
    });
  }

  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.selectedFacility = null;
    this.resetFormFields();
    if (this.providerServiceMapID) {
      this.loadUnmappedFacilities(this.providerServiceMapID);
    }
    this.create_filterTerm = '';
  }

  onTalukChange() {
    // If facility type is already selected, reload villages/children for new block
    if (this.facilityTypeID) {
      this.onFacilityTypeChange();
    }
  }

  onRuralUrbanChange() {
    this.facilityTypeID = undefined;
    this.selectedLevel = null;
    this.villages_array = [];
    this.selectedVillages = [];
    this.mainVillageID = null;
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
    this.villageSearch = '';
    this.childFacilitySearch = '';
    this.applyVillageFilter();
    this.applyChildFacilityFilter();
    if (this.formRuralUrban) {
      this.filteredFacilityTypes = this.facilityTypes_array.filter(
        (item: any) => item.ruralUrban === this.formRuralUrban,
      );
    } else {
      this.filteredFacilityTypes = [];
    }
  }

  onFacilityTypeChange() {
    this.selectedLevel = null;
    this.villages_array = [];
    this.selectedVillages = [];
    this.mainVillageID = null;
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
    this.villageSearch = '';
    this.childFacilitySearch = '';
    this.applyVillageFilter();
    this.applyChildFacilityFilter();

    if (!this.facilityTypeID) return;

    const selectedType = this.facilityTypes_array.find(
      (item: any) => item.facilityTypeID === this.facilityTypeID,
    );
    if (!selectedType || !selectedType.levelValue) return;

    this.selectedLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === selectedType.levelValue,
    );
    if (!this.selectedLevel) return;

    const blockID = this.taluk?.blockID || this.selectedFacility?.blockID;
    if (!blockID) return;

    if (this.isLowestLevel(this.selectedLevel.levelValue)) {
      this.facility.getVillages(blockID).subscribe(
        (response: any) => {
          if (response && response.data) {
            const allVillages = response.data;
            this.facility.getMappedVillageIDs(blockID).subscribe(
              (mappedRes: any) => {
                if (mappedRes && mappedRes.data) {
                  const mappedIDs: number[] = mappedRes.data;
                  this.villages_array = allVillages.filter(
                    (v: any) => !mappedIDs.includes(v.districtBranchID),
                  );
                } else {
                  this.villages_array = allVillages;
                }
                this.villageSearch = '';
                this.applyVillageFilter();
              },
              () => {
                this.dialogService.alert(
                  'Failed to load mapped villages',
                  'error',
                );
              },
            );
          }
        },
        () => {
          this.dialogService.alert('Failed to load villages', 'error');
        },
      );
    } else {
      const childLevelValue = this.selectedLevel.levelValue + 1;
      this.facility
        .getFacilitiesByBlockAndLevel(
          blockID,
          childLevelValue,
          this.formRuralUrban,
        )
        .subscribe(
          (response: any) => {
            if (response && response.data) {
              this.childFacilities_array = response.data;
              this.childFacilitySearch = '';
              this.applyChildFacilityFilter();
            }
          },
          () => {
            this.dialogService.alert(
              'Failed to load child facilities',
              'error',
            );
          },
        );
    }
  }

  getChildLevelName(): string {
    if (
      !this.selectedLevel ||
      this.isLowestLevel(this.selectedLevel.levelValue)
    )
      return '';
    const childLevelValue = this.selectedLevel.levelValue + 1;
    const childLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === childLevelValue,
    );
    return childLevel ? childLevel.levelName : '';
  }

  onVillageSelectionChange() {
    if (this.mainVillageID) {
      const stillSelected = this.selectedVillages.some(
        (v: any) => v.districtBranchID === this.mainVillageID,
      );
      if (!stillSelected) {
        this.mainVillageID = null;
      }
    }
  }

  saveLinkFacility() {
    if (!this.selectedFacility) return;

    const facilityObj: any = {
      facilityID: this.selectedFacility.facilityID,
      facilityTypeID: this.facilityTypeID,
      ruralUrban: this.formRuralUrban,
      stateID: this.state?.stateID,
      districtID: this.district?.districtID,
      blockID: this.taluk?.blockID,
      modifiedBy: this.createdBy,
    };

    const villageIDs: number[] = [];
    const childFacilityIDs: number[] = [];

    if (
      this.selectedLevel &&
      this.isLowestLevel(this.selectedLevel.levelValue) &&
      this.selectedVillages.length > 0
    ) {
      for (const v of this.selectedVillages) {
        villageIDs.push(v.districtBranchID);
      }
    } else if (
      this.selectedLevel &&
      !this.isLowestLevel(this.selectedLevel.levelValue) &&
      this.selectedChildFacilities.length > 0
    ) {
      for (const c of this.selectedChildFacilities) {
        childFacilityIDs.push(c.facilityID);
      }
    }

    const requestObj = {
      facility: facilityObj,
      villageIDs: villageIDs.length > 0 ? villageIDs : null,
      mainVillageID: this.mainVillageID ? this.mainVillageID : null,
      childFacilityIDs: childFacilityIDs.length > 0 ? childFacilityIDs : null,
    };

    this.facility.updateFacilityWithHierarchy(requestObj).subscribe(
      (response: any) => {
        if (response) {
          this.dialogService.alert(
            'Facility linked to hierarchy successfully',
            'success',
          );
          this.showTable();
        }
      },
      () => {
        this.dialogService.alert('Failed to link facility', 'error');
      },
    );
  }

  // --- Search filter methods ---

  applyVillageFilter(term?: string) {
    if (term !== undefined) this.villageSearch = term;
    if (!this.villageSearch) {
      this.filteredVillages = this.villages_array.slice();
    } else {
      const s = this.villageSearch.toLowerCase();
      this.filteredVillages = this.villages_array.filter((v: any) =>
        (v.villageName || '').toLowerCase().includes(s),
      );
    }
  }

  applyChildFacilityFilter(term?: string) {
    if (term !== undefined) this.childFacilitySearch = term;
    if (!this.childFacilitySearch) {
      this.filteredChildFacilities = this.childFacilities_array.slice();
    } else {
      const s = this.childFacilitySearch.toLowerCase();
      this.filteredChildFacilities = this.childFacilities_array.filter(
        (c: any) => (c.facilityName || '').toLowerCase().includes(s),
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

  get allChildFacilitiesSelected(): boolean {
    return (
      this.filteredChildFacilities.length > 0 &&
      this.selectedChildFacilities.length === this.childFacilities_array.length
    );
  }

  toggleSelectAllChildFacilities() {
    if (this.allChildFacilitiesSelected) {
      this.selectedChildFacilities = [];
    } else {
      this.selectedChildFacilities = this.childFacilities_array.slice();
    }
  }

  resetFormFields() {
    this.facilityTypeID = undefined;
    this.formRuralUrban = undefined;
    this.selectedLevel = null;
    this.filteredFacilityTypes = [];
    this.villages_array = [];
    this.selectedVillages = [];
    this.mainVillageID = null;
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
    this.villageSearch = '';
    this.childFacilitySearch = '';
    this.filteredVillages = [];
    this.filteredChildFacilities = [];
    this.districts_array = [];
    this.taluks_array = [];
    this.district = undefined;
    this.taluk = undefined;
  }
}
