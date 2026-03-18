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
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-facility-creation',
  templateUrl: './facility-creation.component.html',
  styleUrls: ['./facility-creation.component.css'],
})
export class FacilityCreationComponent implements OnInit {
  facilityList = new MatTableDataSource<any>();
  @ViewChild('tablePaginator') tablePaginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'sno',
    'facilityName',
    'facilityCode',
    'facilityTypeName',
    'ruralUrban',
    'edit',
    'action',
  ];

  createButton = false;
  facilityName: any;
  facilityDesc: any;
  facilityCode: any;
  facilityTypeID: any;
  formRuralUrban: any;
  facilityID: any;
  edit_facilityName: any;
  edit_facilityDesc: any;
  edit_facilityCode: any;
  edit_ruralUrban: any;
  edit_facilityTypeID: any;
  original_facilityTypeID: any; // Fix 13: track original type to warn on change
  original_levelValue: any; // Lock edit to same level
  edit_filteredFacilityTypes: any[] = [];
  edit_selectedLevel: any = null;
  edit_villages_array: any = [];
  edit_selectedVillages: any = [];
  edit_mainVillageID: number | null = null;
  edit_childFacilities_array: any = [];
  edit_selectedChildFacilities: any = [];
  createdBy: any;
  uid: any;

  state: any;
  district: any;
  taluk: any;

  states_array: any = [];
  districts_array: any = [];
  taluks_array: any = [];
  facilityTypes_array: any = [];
  filteredFacilityTypes: any = [];
  facilityLevels_array: any = [];
  facilityMasterList: any = [];
  create_filterTerm!: string;
  duplicateFacilityName = false;
  edit_duplicateFacilityName = false;

  selectedLevel: any = null;
  villages_array: any = [];
  selectedVillages: any = [];
  mainVillageID: number | null = null;
  childFacilities_array: any = [];
  selectedChildFacilities: any = [];

  // For higher levels: cascading drill-down to reach village
  // Each entry: { levelValue, levelName, facilities: [], selectedFacilityID }
  drillDownSteps: any[] = [];
  drillDownVillages: any[] = [];

  // Search & filtered arrays for multi-select dropdowns
  villageSearch = '';
  childFacilitySearch = '';
  edit_villageSearch = '';
  edit_childFacilitySearch = '';
  filteredVillages: any = [];
  filteredChildFacilities: any = [];
  edit_filteredVillages: any = [];
  edit_filteredChildFacilities: any = [];

  tableMode = true;
  formMode = false;
  editMode = false;
  showTableFlag = false;

  @ViewChild('facilityAddForm')
  facilityAddForm!: NgForm;

  constructor(
    private facility: FacilityMasterService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
    this.uid = this.sessionstorage.getItem('uid');
    this.getAllStates();
    this.getFacilityLevels();
  }

  getAllStates() {
    this.facility.getAllStates(1).subscribe((response: any) => {
      if (response && response.data) {
        this.states_array = response.data;
      }
    });
  }

  getFacilityLevels() {
    this.facility.getFacilityLevels().subscribe((response: any) => {
      if (response && response.data) {
        this.facilityLevels_array = response.data;
      }
    });
  }

  // Returns the max levelValue (lowest level = Sub-Center)
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

    // Build steps from currentLevel+1 down to maxLevel (SC)
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

    // First step: load from selected child facilities
    if (
      this.drillDownSteps.length > 0 &&
      this.selectedChildFacilities.length > 0
    ) {
      this.drillDownSteps[0].facilities = this.selectedChildFacilities;
    }
  }

  onDrillDownSelect(stepIndex: number, facilityID: number) {
    // Clear subsequent steps
    for (let i = stepIndex + 1; i < this.drillDownSteps.length; i++) {
      this.drillDownSteps[i].facilities = [];
      this.drillDownSteps[i].selectedFacilityID = null;
    }
    this.drillDownVillages = [];
    this.mainVillageID = null;

    if (!facilityID) return;

    // If this is the last step (SC level), load villages
    if (stepIndex === this.drillDownSteps.length - 1) {
      this.facility
        .getVillageMappingsByFacility(facilityID)
        .subscribe((res: any) => {
          this.drillDownVillages = res.data || res || [];
        });
    } else {
      // Load children of selected facility for next step
      this.facility
        .getChildFacilitiesByParent(facilityID)
        .subscribe((res: any) => {
          this.drillDownSteps[stepIndex + 1].facilities = res.data || res || [];
        });
    }
  }

  getDistricts(stateId: number) {
    this.districts_array = [];
    this.taluks_array = [];
    this.district = undefined;
    this.taluk = undefined;
    this.showTableFlag = false;
    this.createButton = false;
    this.facility.getDistricts(stateId).subscribe((response: any) => {
      if (response && response.data) {
        this.districts_array = response.data;
      }
    });
    this.loadFacilityTypesByState(stateId);
  }

  getTaluks(districtId: number) {
    this.taluks_array = [];
    this.taluk = undefined;
    this.showTableFlag = false;
    this.createButton = false;
    this.facility.getTaluks(districtId).subscribe((response: any) => {
      if (response && response.data) {
        this.taluks_array = response.data;
      }
    });
  }

  loadFacilitiesByBlock(blockID: number) {
    this.createButton = true;
    this.facility
      .getAllFacilitiesByBlock(blockID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.facilityMasterList = response.data;
          this.facilityList.data = response.data;
          this.facilityList.paginator = this.tablePaginator;
        } else {
          this.facilityMasterList = [];
          this.facilityList.data = [];
        }
        this.showTableFlag = true;
      });
  }

  loadFacilityTypesByState(stateID: number) {
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
      });
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

  onEditVillageSelectionChange() {
    if (this.edit_mainVillageID) {
      const stillSelected = this.edit_selectedVillages.some(
        (v: any) => v.districtBranchID === this.edit_mainVillageID,
      );
      if (!stillSelected) {
        this.edit_mainVillageID = null;
      }
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

    const blockID = this.taluk?.blockID;
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
              (err: any) => {
                this.dialogService.alert(
                  'Failed to load mapped villages',
                  'error',
                );
              },
            );
          }
        },
        (err: any) => {
          this.dialogService.alert('Failed to load villages', 'error');
        },
      );
    } else {
      const childLevelValue = this.selectedLevel.levelValue + 1;
      const childLevel = this.facilityLevels_array.find(
        (level: any) => level.levelValue === childLevelValue,
      );
      if (childLevel) {
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
            (err: any) => {
              this.dialogService.alert(
                'Failed to load child facilities',
                'error',
              );
            },
          );
      }
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

  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.resetForm();
    if (this.taluk?.blockID) {
      this.loadFacilitiesByBlock(this.taluk.blockID);
    }
    this.create_filterTerm = '';
  }

  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;
  }

  showEditForm() {
    this.tableMode = false;
    this.formMode = false;
    this.editMode = true;
  }

  filterList(searchTerm?: string) {
    if (!searchTerm) {
      this.facilityList.data = this.facilityMasterList;
      this.facilityList.paginator = this.tablePaginator;
    } else {
      const filtered: any[] = [];
      this.facilityMasterList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'facilityName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              filtered.push(item);
              break;
            }
          }
        }
      });
      this.facilityList.data = filtered;
      this.facilityList.paginator = this.tablePaginator;
    }
  }

  getFacilityTypeName(facilityTypeID: number): string {
    const ft = this.facilityTypes_array.find(
      (item: any) => item.facilityTypeID === facilityTypeID,
    );
    return ft ? ft.facilityTypeName : '';
  }

  getRuralUrban(facilityTypeID: number): string {
    const ft = this.facilityTypes_array.find(
      (item: any) => item.facilityTypeID === facilityTypeID,
    );
    return ft ? ft.ruralUrban : '';
  }

  checkDuplicateFacilityName() {
    if (this.facilityName) {
      this.duplicateFacilityName = this.facilityMasterList.some(
        (item: any) =>
          item.facilityName?.trim().toLowerCase() ===
          this.facilityName.trim().toLowerCase(),
      );
    } else {
      this.duplicateFacilityName = false;
    }
  }

  checkEditDuplicateFacilityName() {
    if (this.edit_facilityName) {
      this.edit_duplicateFacilityName = this.facilityMasterList.some(
        (item: any) =>
          item.facilityName?.trim().toLowerCase() ===
            this.edit_facilityName.trim().toLowerCase() &&
          item.facilityID !== this.facilityID,
      );
    } else {
      this.edit_duplicateFacilityName = false;
    }
  }

  saveSingleFacility() {
    const facilityObj: any = {
      facilityName: this.facilityName,
      facilityDesc: this.facilityDesc,
      facilityCode: this.facilityCode || null,
      facilityTypeID: this.facilityTypeID,
      ruralUrban: this.formRuralUrban,
      stateID: this.state?.stateID,
      districtID: this.district?.districtID,
      blockID: this.taluk?.blockID,
      providerServiceMapID:
        this.commonDataService.provider_serviceMapID || null,
      isMainFacility: true,
      createdBy: this.createdBy,
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

    this.facility.createFacilityWithHierarchy(requestObj).subscribe(
      (response: any) => {
        if (response) {
          this.dialogService.alert('Saved successfully', 'success');
          this.resetForm();
          this.showTable();
        }
      },
      (err: any) => {
        this.dialogService.alert('Failed to save facility', 'error');
      },
    );
  }

  editFacility(item: any) {
    this.facilityID = item.facilityID;
    this.edit_facilityName = item.facilityName;
    this.edit_facilityDesc = item.facilityDesc;
    this.edit_facilityCode = item.facilityCode;
    this.edit_facilityTypeID = item.facilityTypeID;
    this.original_facilityTypeID = item.facilityTypeID; // Fix 13: remember original type
    this.edit_mainVillageID = item.mainVillageID || null;

    const selectedType = this.facilityTypes_array.find(
      (ft: any) => ft.facilityTypeID === item.facilityTypeID,
    );
    this.edit_ruralUrban = selectedType ? selectedType.ruralUrban : '';
    this.original_levelValue = selectedType ? selectedType.levelValue : null;

    // Only show facility types with same level (e.g., SC Rural ↔ SC Urban, but not SC → PHC)
    this.edit_filteredFacilityTypes = this.facilityTypes_array.filter(
      (ft: any) =>
        ft.ruralUrban === this.edit_ruralUrban &&
        ft.levelValue === this.original_levelValue,
    );

    this.edit_selectedLevel = null;
    if (selectedType && selectedType.levelValue) {
      this.edit_selectedLevel = this.facilityLevels_array.find(
        (level: any) => level.levelValue === selectedType.levelValue,
      );
    }

    const blockID = this.taluk?.blockID;
    if (this.edit_selectedLevel && blockID) {
      if (this.isLowestLevel(this.edit_selectedLevel.levelValue)) {
        this.loadEditVillages(blockID, item.facilityID);
      } else {
        this.loadEditChildFacilities(blockID, item.facilityID);
      }
    }

    this.showEditForm();
  }

  loadEditVillages(blockID: number, facilityID: number) {
    this.facility.getVillages(blockID).subscribe(
      (allVillagesRes: any) => {
        if (allVillagesRes && allVillagesRes.data) {
          const allVillages = allVillagesRes.data;
          this.facility.getMappedVillageIDs(blockID).subscribe(
            (mappedRes: any) => {
              const allMappedIDs: number[] =
                mappedRes && mappedRes.data ? mappedRes.data : [];
              this.facility.getVillageMappingsByFacility(facilityID).subscribe(
                (myMappingsRes: any) => {
                  const myMappings =
                    myMappingsRes && myMappingsRes.data
                      ? myMappingsRes.data
                      : [];
                  const myMappedIDs: number[] = myMappings.map(
                    (m: any) => m.districtBranchID,
                  );

                  this.edit_villages_array = allVillages.filter(
                    (v: any) =>
                      !allMappedIDs.includes(v.districtBranchID) ||
                      myMappedIDs.includes(v.districtBranchID),
                  );

                  this.edit_selectedVillages = this.edit_villages_array.filter(
                    (v: any) => myMappedIDs.includes(v.districtBranchID),
                  );

                  this.edit_villageSearch = '';
                  this.applyEditVillageFilter();
                },
                (err: any) => {
                  this.dialogService.alert(
                    'Failed to load facility village mappings',
                    'error',
                  );
                },
              );
            },
            (err: any) => {
              this.dialogService.alert(
                'Failed to load mapped villages',
                'error',
              );
            },
          );
        }
      },
      (err: any) => {
        this.dialogService.alert('Failed to load villages', 'error');
      },
    );
  }

  loadEditChildFacilities(blockID: number, facilityID: number) {
    const childLevelValue = this.edit_selectedLevel.levelValue + 1;
    const childLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === childLevelValue,
    );
    if (!childLevel) return;

    this.facility
      .getFacilitiesByBlockAndLevel(
        blockID,
        childLevelValue,
        this.edit_ruralUrban,
      )
      .subscribe(
        (availableRes: any) => {
          const availableFacilities =
            availableRes && availableRes.data ? availableRes.data : [];
          this.facility.getChildFacilitiesByParent(facilityID).subscribe(
            (childrenRes: any) => {
              const currentChildren =
                childrenRes && childrenRes.data ? childrenRes.data : [];
              const currentChildIDs: number[] = currentChildren.map(
                (c: any) => c.facilityID,
              );

              const filteredAvailable = availableFacilities.filter(
                (f: any) => !currentChildIDs.includes(f.facilityID),
              );
              this.edit_childFacilities_array = [
                ...filteredAvailable,
                ...currentChildren,
              ];

              this.edit_selectedChildFacilities =
                this.edit_childFacilities_array.filter((c: any) =>
                  currentChildIDs.includes(c.facilityID),
                );
              this.edit_childFacilitySearch = '';
              this.applyEditChildFacilityFilter();
            },
            (err: any) => {
              this.dialogService.alert(
                'Failed to load child facilities',
                'error',
              );
            },
          );
        },
        (err: any) => {
          this.dialogService.alert('Failed to load child facilities', 'error');
        },
      );
  }

  getEditChildLevelName(): string {
    if (
      !this.edit_selectedLevel ||
      this.isLowestLevel(this.edit_selectedLevel.levelValue)
    )
      return '';
    const childLevelValue = this.edit_selectedLevel.levelValue + 1;
    const childLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === childLevelValue,
    );
    return childLevel ? childLevel.levelName : '';
  }

  onEditRuralUrbanChange() {
    this.edit_facilityTypeID = undefined;
    if (this.edit_ruralUrban && this.original_levelValue != null) {
      // Only show facility types with same level (lock level, allow rural/urban switch)
      this.edit_filteredFacilityTypes = this.facilityTypes_array.filter(
        (item: any) =>
          item.ruralUrban === this.edit_ruralUrban &&
          item.levelValue === this.original_levelValue,
      );
      // Auto-select if only one type at this level
      if (this.edit_filteredFacilityTypes.length === 1) {
        this.edit_facilityTypeID =
          this.edit_filteredFacilityTypes[0].facilityTypeID;
      }
    } else {
      this.edit_filteredFacilityTypes = [];
    }
  }

  onEditFacilityTypeChange() {
    this.edit_selectedLevel = null;
    this.edit_villages_array = [];
    this.edit_selectedVillages = [];
    this.edit_mainVillageID = null;
    this.edit_childFacilities_array = [];
    this.edit_selectedChildFacilities = [];
    this.edit_villageSearch = '';
    this.edit_childFacilitySearch = '';
    this.applyEditVillageFilter();
    this.applyEditChildFacilityFilter();

    if (!this.edit_facilityTypeID) return;

    const selectedType = this.facilityTypes_array.find(
      (item: any) => item.facilityTypeID === this.edit_facilityTypeID,
    );
    if (!selectedType || !selectedType.levelValue) return;

    this.edit_selectedLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === selectedType.levelValue,
    );
    if (!this.edit_selectedLevel) return;

    const blockID = this.taluk?.blockID;
    if (!blockID) return;

    if (this.isLowestLevel(this.edit_selectedLevel.levelValue)) {
      this.facility.getVillages(blockID).subscribe(
        (response: any) => {
          if (response && response.data) {
            const allVillages = response.data;
            this.facility.getMappedVillageIDs(blockID).subscribe(
              (mappedRes: any) => {
                const allMappedIDs: number[] =
                  mappedRes && mappedRes.data ? mappedRes.data : [];
                // Also fetch this facility's own village mappings to keep them available
                this.facility
                  .getVillageMappingsByFacility(this.facilityID)
                  .subscribe(
                    (myMappingsRes: any) => {
                      const myMappings =
                        myMappingsRes && myMappingsRes.data
                          ? myMappingsRes.data
                          : [];
                      const myMappedIDs: number[] = myMappings.map(
                        (m: any) => m.districtBranchID,
                      );
                      this.edit_villages_array = allVillages.filter(
                        (v: any) =>
                          !allMappedIDs.includes(v.districtBranchID) ||
                          myMappedIDs.includes(v.districtBranchID),
                      );
                      this.edit_selectedVillages =
                        this.edit_villages_array.filter((v: any) =>
                          myMappedIDs.includes(v.districtBranchID),
                        );
                      this.edit_villageSearch = '';
                      this.applyEditVillageFilter();
                    },
                    (err: any) => {
                      this.dialogService.alert(
                        'Failed to load facility village mappings',
                        'error',
                      );
                    },
                  );
              },
              (err: any) => {
                this.dialogService.alert(
                  'Failed to load mapped village IDs',
                  'error',
                );
              },
            );
          }
        },
        (err: any) => {
          this.dialogService.alert('Failed to load villages', 'error');
        },
      );
    } else {
      const childLevelValue = this.edit_selectedLevel.levelValue + 1;
      const childLevel = this.facilityLevels_array.find(
        (level: any) => level.levelValue === childLevelValue,
      );
      if (childLevel) {
        this.facility
          .getFacilitiesByBlockAndLevel(
            blockID,
            childLevelValue,
            this.edit_ruralUrban,
          )
          .subscribe(
            (availableRes: any) => {
              if (availableRes && availableRes.data) {
                const availableFacilities = availableRes.data;
                // Fetch current children from backend for proper dedup and pre-selection
                this.facility
                  .getChildFacilitiesByParent(this.facilityID)
                  .subscribe(
                    (childrenRes: any) => {
                      const currentChildren =
                        childrenRes && childrenRes.data ? childrenRes.data : [];
                      const currentChildIDs: number[] = currentChildren.map(
                        (c: any) => c.facilityID,
                      );
                      const filteredAvailable = availableFacilities.filter(
                        (f: any) => !currentChildIDs.includes(f.facilityID),
                      );
                      this.edit_childFacilities_array = [
                        ...filteredAvailable,
                        ...currentChildren,
                      ];
                      this.edit_selectedChildFacilities =
                        this.edit_childFacilities_array.filter((c: any) =>
                          currentChildIDs.includes(c.facilityID),
                        );
                      this.edit_childFacilitySearch = '';
                      this.applyEditChildFacilityFilter();
                    },
                    (err: any) => {
                      this.dialogService.alert(
                        'Failed to load current child facilities',
                        'error',
                      );
                    },
                  );
              }
            },
            (err: any) => {
              this.dialogService.alert(
                'Failed to load child facilities',
                'error',
              );
            },
          );
      }
    }
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

  applyEditVillageFilter(term?: string) {
    if (term !== undefined) this.edit_villageSearch = term;
    if (!this.edit_villageSearch) {
      this.edit_filteredVillages = this.edit_villages_array.slice();
    } else {
      const s = this.edit_villageSearch.toLowerCase();
      this.edit_filteredVillages = this.edit_villages_array.filter((v: any) =>
        (v.villageName || '').toLowerCase().includes(s),
      );
    }
  }

  applyEditChildFacilityFilter(term?: string) {
    if (term !== undefined) this.edit_childFacilitySearch = term;
    if (!this.edit_childFacilitySearch) {
      this.edit_filteredChildFacilities =
        this.edit_childFacilities_array.slice();
    } else {
      const s = this.edit_childFacilitySearch.toLowerCase();
      this.edit_filteredChildFacilities =
        this.edit_childFacilities_array.filter((c: any) =>
          (c.facilityName || '').toLowerCase().includes(s),
        );
    }
  }

  // --- Select All toggle methods ---

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

  get allEditVillagesSelected(): boolean {
    return (
      this.edit_filteredVillages.length > 0 &&
      this.edit_selectedVillages.length === this.edit_villages_array.length
    );
  }

  toggleSelectAllEditVillages() {
    if (this.allEditVillagesSelected) {
      this.edit_selectedVillages = [];
    } else {
      this.edit_selectedVillages = this.edit_villages_array.slice();
    }
  }

  get allEditChildFacilitiesSelected(): boolean {
    return (
      this.edit_filteredChildFacilities.length > 0 &&
      this.edit_selectedChildFacilities.length ===
        this.edit_childFacilities_array.length
    );
  }

  toggleSelectAllEditChildFacilities() {
    if (this.allEditChildFacilitiesSelected) {
      this.edit_selectedChildFacilities = [];
    } else {
      this.edit_selectedChildFacilities =
        this.edit_childFacilities_array.slice();
    }
  }

  compareVillages(v1: any, v2: any): boolean {
    return v1 && v2 && v1.districtBranchID === v2.districtBranchID;
  }

  compareFacilities(f1: any, f2: any): boolean {
    return f1 && f2 && f1.facilityID === f2.facilityID;
  }

  updateFacility() {
    // Fix 13: level change is locked via UI (same-level filter on dropdown)
    // No warning needed — only rural/urban switch within same level is possible
    this.doUpdateFacility();
  }

  doUpdateFacility() {
    const facilityObj: any = {
      facilityID: this.facilityID,
      facilityName: this.edit_facilityName,
      facilityDesc: this.edit_facilityDesc,
      facilityCode: this.edit_facilityCode || null,
      facilityTypeID: this.edit_facilityTypeID,
      ruralUrban: this.edit_ruralUrban,
      modifiedBy: this.createdBy,
    };

    let villageIDs: number[] | null = null;
    let childFacilityIDs: number[] | null = null;

    if (
      this.edit_selectedLevel &&
      this.isLowestLevel(this.edit_selectedLevel.levelValue)
    ) {
      villageIDs = this.edit_selectedVillages.map(
        (v: any) => v.districtBranchID,
      );
    } else if (
      this.edit_selectedLevel &&
      !this.isLowestLevel(this.edit_selectedLevel.levelValue)
    ) {
      childFacilityIDs = this.edit_selectedChildFacilities.map(
        (c: any) => c.facilityID,
      );
    }

    const requestObj = {
      facility: facilityObj,
      villageIDs: villageIDs,
      mainVillageID: this.edit_mainVillageID || null,
      childFacilityIDs: childFacilityIDs,
    };

    this.facility.updateFacilityWithHierarchy(requestObj).subscribe(
      (response: any) => {
        if (response) {
          this.dialogService.alert('Updated successfully', 'success');
          this.resetForm();
          this.showTable();
        }
      },
      (err: any) => {
        this.dialogService.alert('Failed to update facility', 'error');
      },
    );
  }

  activate(facilityID: any) {
    this.dialogService
      .confirm(
        'Confirm',
        'Are you sure you want to Activate? Note: Village mappings and ASHA supervisor mappings were cleared on deactivation. Please reassign them after activation.',
      )
      .subscribe((response: any) => {
        if (response) {
          const object = { facilityID: facilityID, deleted: false };
          this.facility.deleteFacilityStore(object).subscribe(
            (res: any) => {
              if (res) {
                this.dialogService.alert(
                  'Activated successfully. Please reassign villages and ASHA mappings.',
                  'success',
                );
                if (this.taluk?.blockID) {
                  this.loadFacilitiesByBlock(this.taluk.blockID);
                }
                this.create_filterTerm = '';
              }
            },
            (err: any) => {
              this.dialogService.alert('Failed to activate facility', 'error');
            },
          );
        }
      });
  }

  deactivate(facilityID: any) {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response: any) => {
        if (response) {
          this.facility
            .deleteFacilityWithHierarchy(facilityID, this.createdBy)
            .subscribe(
              (res: any) => {
                if (res) {
                  this.dialogService.alert(
                    'Deactivated successfully',
                    'success',
                  );
                  if (this.taluk?.blockID) {
                    this.loadFacilitiesByBlock(this.taluk.blockID);
                  }
                  this.create_filterTerm = '';
                }
              },
              (err: any) => {
                const msg =
                  err?.error?.errorMessage || 'Failed to deactivate facility';
                this.dialogService.alert(msg, 'error');
              },
            );
        }
      });
  }

  resetForm() {
    this.facilityName = undefined;
    this.facilityDesc = undefined;
    this.facilityCode = undefined;
    this.facilityTypeID = undefined;
    this.formRuralUrban = undefined;
    this.selectedLevel = null;
    this.filteredFacilityTypes = [];
    this.villages_array = [];
    this.selectedVillages = [];
    this.mainVillageID = null;
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
    this.edit_facilityName = undefined;
    this.edit_facilityDesc = undefined;
    this.edit_facilityCode = undefined;
    this.edit_ruralUrban = undefined;
    this.edit_facilityTypeID = undefined;
    this.edit_filteredFacilityTypes = [];
    this.edit_selectedLevel = null;
    this.edit_villages_array = [];
    this.edit_selectedVillages = [];
    this.edit_mainVillageID = null;
    this.edit_childFacilities_array = [];
    this.edit_selectedChildFacilities = [];
    this.duplicateFacilityName = false;
    this.edit_duplicateFacilityName = false;
    this.villageSearch = '';
    this.childFacilitySearch = '';
    this.edit_villageSearch = '';
    this.edit_childFacilitySearch = '';
    this.filteredVillages = [];
    this.filteredChildFacilities = [];
    this.edit_filteredVillages = [];
    this.edit_filteredChildFacilities = [];
  }
}
