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
import {
  Component,
  OnInit,
  OnChanges,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';

@Component({
  selector: 'app-user-facility-mapping',
  templateUrl: './user-facility-mapping.component.html',
  styleUrls: ['./user-facility-mapping.component.css'],
})
export class UserFacilityMappingComponent implements OnInit, OnChanges {
  @Input() blockID: any;
  @Input() stateID: any;
  @Input() providerServiceMapID: any;
  @Input() roleName = '';
  @Input() serviceName = '';
  @Input() existingVillageIDs: number[] = [];
  @Input() existingVillageNames: string[] = [];
  @Input() existingFacilityID: any;
  @Input() existingFacilityIDs: any[] = [];
  @Input() existingFacilityNames: string[] = [];
  @Input() existingFacilityName = '';
  @Input() existingFacilityTypeID: any;
  @Input() existingRuralUrban = '';
  @Input() supervisorUserID: any;

  @Output() facilityMappingData = new EventEmitter<any>();

  // Rural/Urban dropdown
  selectedRuralUrban = '';

  // Facility Type dropdown
  allFacilityTypes: any[] = [];
  filteredFacilityTypes: any[] = [];
  selectedFacilityType: any;

  // Facility dropdown - single select (non-ASHA Supervisor)
  facilities: any[] = [];
  selectedFacility: any;

  // Facility dropdown - multi-select (ASHA Supervisor)
  selectedFacilities: any[] = [];

  // Village dropdown (multi-select for all roles)
  facilityVillages: any[] = [];
  selectedVillageIDs: number[] = [];

  // Display villages: merged facility + orphan villages
  displayVillages: any[] = [];
  orphanVillages: any[] = [];

  // ASHA user dropdown (multi-select, ASHA Supervisor only)
  ashaUsers: any[] = [];
  selectedAshaUserIDs: number[] = [];

  // Role flags
  isAshaSupervisor = false;

  // Edit mode flags
  isEditMode = false;
  // True when user already has a facilityID → dropdowns disabled
  hasExistingFacility = false;

  // Facility levels
  facilityLevels: any[] = [];

  constructor(private facilityService: FacilityMasterService) {}

  ngOnInit() {
    this.loadFacilityLevels();
  }

  /**
   * ngOnChanges flow:
   *
   * CASE 1: User WITH facilityID (new user created with facility, editing later)
   *   - First ngOnChanges: stateID, blockID, roleName, existingVillageIDs arrive
   *     → isEditMode = true, hasExistingFacility = false (facilityID not yet arrived)
   *     → loadFacilityTypes(), updateRoleFlags(), resetFacilitySelection()
   *   - Second ngOnChanges: existingFacilityID/Name/TypeID/RuralUrban arrive from async API
   *     → hasExistingFacility = true
   *     → loadVillagesForEdit() → pre-populates disabled dropdowns + compares villages
   *
   * CASE 2: Old user WITHOUT facilityID (need to assign facility)
   *   - First ngOnChanges: stateID, blockID, roleName, existingVillageIDs arrive
   *     → isEditMode = true, hasExistingFacility = false
   *     → loadFacilityTypes(), updateRoleFlags(), resetFacilitySelection()
   *   - existingFacilityID stays null → no second phase
   *   - User manually selects Rural/Urban → Facility Type → Facility
   *   - onFacilitySelected() → loads villages → buildDisplayVillages() compares
   */
  ngOnChanges(changes: SimpleChanges) {
    // Always update role flags first (needed before loadVillagesForEdit)
    if (changes['roleName']) {
      this.updateRoleFlags();
    }

    // Determine edit mode: user has existing villages OR existing facilityID
    if (changes['existingVillageIDs'] || changes['existingFacilityID']) {
      this.isEditMode =
        (this.existingVillageIDs && this.existingVillageIDs.length > 0) ||
        !!this.existingFacilityID;
      this.hasExistingFacility = !!this.existingFacilityID;
    }

    // CASE 1: existingFacilityID just arrived → pre-populate & load villages
    if (this.hasExistingFacility && changes['existingFacilityID']) {
      this.loadVillagesForEdit();
      // Don't return — let loadFacilityTypes() run below as a backup
    }

    // Normal flow: load facility types when stateID changes
    if (changes['stateID'] && this.stateID) {
      this.loadFacilityTypes();
    }
    if (changes['blockID'] && !this.hasExistingFacility) {
      this.resetFacilitySelection();
    }
  }

  /**
   * CASE 1 only: Pre-populate all dropdowns (disabled) and load facility villages
   * Then compare with user's existing villages → buildDisplayVillages()
   *
   * For ASHA Supervisor: multiple facilities → load villages from ALL facilities
   * For FLW/HWC: single facility → load villages from one facility
   */
  loadVillagesForEdit() {
    // Pre-populate Rural/Urban
    if (this.existingRuralUrban) {
      this.selectedRuralUrban = this.existingRuralUrban;
    }

    // Pre-populate Facility Type
    if (this.existingFacilityTypeID) {
      if (this.allFacilityTypes.length > 0) {
        // Facility types already loaded — find the match immediately
        this.setFacilityTypeFromExisting();
      } else if (this.stateID) {
        // Facility types not loaded yet — fetch them, then set the match
        this.facilityService
          .getFacilityTypesByState(this.stateID)
          .subscribe((response: any) => {
            if (response && response.data) {
              this.allFacilityTypes = response.data.filter(
                (ft: any) => !ft.deleted,
              );
            }
            this.setFacilityTypeFromExisting();
          });
      }
    }

    // ASHA Supervisor: multiple facilities
    if (
      this.isAshaSupervisor &&
      this.existingFacilityIDs &&
      this.existingFacilityIDs.length > 0
    ) {
      // Pre-populate multi-select facility dropdown
      this.selectedFacilities = this.existingFacilityIDs.map(
        (id: any, idx: number) => ({
          facilityID: id,
          facilityName:
            (this.existingFacilityNames && this.existingFacilityNames[idx]) ||
            'Facility ID ' + id,
        }),
      );
      this.facilities = this.selectedFacilities.slice();

      // Load villages from ALL facilities
      const villageMap = new Map<number, any>();
      let pending = this.existingFacilityIDs.length;
      for (const fID of this.existingFacilityIDs) {
        this.facilityService.getVillageMappingsByFacility(fID).subscribe(
          (response: any) => {
            if (response && response.data) {
              for (const v of response.data) {
                villageMap.set(Number(v.districtBranchID), v);
              }
            }
            pending--;
            if (pending === 0) {
              this.facilityVillages = Array.from(villageMap.values());
              this.buildDisplayVillages();
            }
          },
          () => {
            pending--;
            if (pending === 0) {
              this.facilityVillages = Array.from(villageMap.values());
              this.buildDisplayVillages();
            }
          },
        );
      }

      // Load ASHA workers + supervisor mappings to filter and pre-select
      this.facilityService
        .getAshasByFacility(this.existingFacilityIDs)
        .subscribe(
          (response: any) => {
            const allAshas = response && response.data ? response.data : [];

            // Fetch supervisor mappings for each facility to know assignments
            let pendingMappings = this.existingFacilityIDs.length;
            const allSupervisorMappings: any[] = [];
            for (const fID of this.existingFacilityIDs) {
              this.facilityService
                .getSupervisorMappingByFacility(fID)
                .subscribe(
                  (mapRes: any) => {
                    if (mapRes && mapRes.data) {
                      const mappings = Array.isArray(mapRes.data)
                        ? mapRes.data
                        : [mapRes.data];
                      allSupervisorMappings.push(...mappings);
                    }
                    pendingMappings--;
                    if (pendingMappings === 0) {
                      this.filterAshaWorkersForEdit(
                        allAshas,
                        allSupervisorMappings,
                      );
                    }
                  },
                  () => {
                    pendingMappings--;
                    if (pendingMappings === 0) {
                      this.filterAshaWorkersForEdit(
                        allAshas,
                        allSupervisorMappings,
                      );
                    }
                  },
                );
            }
          },
          (err: any) => {
            console.log('Error loading ASHA users for edit', err);
          },
        );
    } else {
      // Non-ASHA: single facility
      if (this.existingFacilityID) {
        this.selectedFacility = {
          facilityID: this.existingFacilityID,
          facilityName:
            this.existingFacilityName ||
            'Facility ID ' + this.existingFacilityID,
        };
        this.facilities = [this.selectedFacility];
      }

      // Load village list from single facility
      this.facilityService
        .getVillageMappingsByFacility(this.existingFacilityID)
        .subscribe(
          (response: any) => {
            if (response && response.data) {
              this.facilityVillages = response.data;
            }
            this.buildDisplayVillages();
          },
          (err: any) => {
            console.log('Error loading facility villages for edit', err);
            this.buildDisplayVillages();
          },
        );
    }
  }

  updateRoleFlags() {
    const role = (this.roleName || '').toLowerCase();
    this.isAshaSupervisor = role === 'asha supervisor';
  }

  setFacilityTypeFromExisting() {
    const existingTypeID = Number(this.existingFacilityTypeID);
    const match = this.allFacilityTypes.find(
      (ft: any) => Number(ft.facilityTypeID) === existingTypeID,
    );
    this.selectedFacilityType = match || {
      facilityTypeName: 'Facility Type ID ' + this.existingFacilityTypeID,
      facilityTypeID: existingTypeID,
    };
    this.filteredFacilityTypes = [this.selectedFacilityType];
  }

  loadFacilityLevels() {
    this.facilityService.getFacilityLevels().subscribe((response: any) => {
      if (response && response.data) {
        this.facilityLevels = response.data;
      }
    });
  }

  loadFacilityTypes() {
    if (!this.stateID) return;
    this.facilityService
      .getFacilityTypesByState(this.stateID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.allFacilityTypes = response.data.filter(
            (ft: any) => !ft.deleted,
          );
          // Race condition fix: if loadFacilityTypes() completes AFTER loadVillagesForEdit()
          // was called, update the placeholder with real facility type data
          if (this.hasExistingFacility && this.existingFacilityTypeID) {
            const existingTypeID = Number(this.existingFacilityTypeID);
            const match = this.allFacilityTypes.find(
              (ft: any) => Number(ft.facilityTypeID) === existingTypeID,
            );
            if (match) {
              this.selectedFacilityType = match;
              this.filteredFacilityTypes = [match];
            }
          } else {
            this.filterFacilityTypes();
          }
        }
      });
  }

  filterFacilityTypes() {
    if (this.selectedRuralUrban) {
      this.filteredFacilityTypes = this.allFacilityTypes.filter(
        (ft: any) => ft.ruralUrban === this.selectedRuralUrban,
      );
    } else {
      this.filteredFacilityTypes = this.allFacilityTypes;
    }
  }

  onRuralUrbanChange() {
    this.selectedFacilityType = null;
    this.selectedFacility = null;
    this.selectedFacilities = [];
    this.facilities = [];
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];
    this.ashaUsers = [];
    this.selectedAshaUserIDs = [];
    this.filterFacilityTypes();
  }

  onFacilityTypeSelected() {
    this.facilities = [];
    this.selectedFacility = null;
    this.selectedFacilities = [];
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];
    this.ashaUsers = [];
    this.selectedAshaUserIDs = [];

    if (!this.selectedFacilityType || !this.blockID) return;

    const levelID = this.selectedFacilityType.facilityLevelID;
    this.facilityService
      .getFacilitiesByBlockAndLevel(
        this.blockID,
        levelID,
        this.selectedRuralUrban,
      )
      .subscribe((response: any) => {
        if (response && response.data) {
          this.facilities = response.data.filter((f: any) => !f.deleted);
        }
      });
  }

  // Single-select facility (non-ASHA Supervisor roles)
  onFacilitySelected() {
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];

    if (!this.selectedFacility) return;

    this.facilityService
      .getVillageMappingsByFacility(this.selectedFacility.facilityID)
      .subscribe(
        (response: any) => {
          if (response && response.data) {
            this.facilityVillages = response.data;
          }
          this.buildDisplayVillages();
        },
        (err: any) => {
          console.log('Error loading facility villages', err);
          this.buildDisplayVillages();
        },
      );
  }

  // Multi-select facilities (ASHA Supervisor role)
  onFacilitiesSelected() {
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];
    this.ashaUsers = [];
    this.selectedAshaUserIDs = [];

    if (!this.selectedFacilities || this.selectedFacilities.length === 0)
      return;

    const facilityIDs = this.selectedFacilities.map((f: any) => f.facilityID);

    // Load villages from all selected facilities
    const villageMap = new Map<number, any>();
    let pending = this.selectedFacilities.length;
    for (const facility of this.selectedFacilities) {
      this.facilityService
        .getVillageMappingsByFacility(facility.facilityID)
        .subscribe(
          (response: any) => {
            if (response && response.data) {
              for (const v of response.data) {
                villageMap.set(v.districtBranchID, v);
              }
            }
            pending--;
            if (pending === 0) {
              this.facilityVillages = Array.from(villageMap.values());
              this.buildDisplayVillages();
            }
          },
          () => {
            pending--;
            if (pending === 0) {
              this.facilityVillages = Array.from(villageMap.values());
              this.buildDisplayVillages();
            }
          },
        );
    }

    // Load ASHA users + filter based on mode (edit vs create)
    this.facilityService.getAshasByFacility(facilityIDs).subscribe(
      (response: any) => {
        const allAshas = response && response.data ? response.data : [];

        // Fetch supervisor mappings for each facility
        let pendingMappings = facilityIDs.length;
        const allSupervisorMappings: any[] = [];
        for (const fID of facilityIDs) {
          this.facilityService.getSupervisorMappingByFacility(fID).subscribe(
            (mapRes: any) => {
              if (mapRes && mapRes.data) {
                const mappings = Array.isArray(mapRes.data)
                  ? mapRes.data
                  : [mapRes.data];
                allSupervisorMappings.push(...mappings);
              }
              pendingMappings--;
              if (pendingMappings === 0) {
                if (this.isEditMode) {
                  this.filterAshaWorkersForEdit(
                    allAshas,
                    allSupervisorMappings,
                  );
                } else {
                  this.filterAshaWorkersForCreate(
                    allAshas,
                    allSupervisorMappings,
                  );
                }
              }
            },
            () => {
              pendingMappings--;
              if (pendingMappings === 0) {
                if (this.isEditMode) {
                  this.filterAshaWorkersForEdit(
                    allAshas,
                    allSupervisorMappings,
                  );
                } else {
                  this.filterAshaWorkersForCreate(
                    allAshas,
                    allSupervisorMappings,
                  );
                }
              }
            },
          );
        }
      },
      (err: any) => {
        console.log('Error loading ASHA users', err);
      },
    );
  }

  /**
   * Core comparison logic for edit mode:
   *
   * Example: User has villages [1, 2, 4], Facility has villages [4, 5, 6, 7, 8]
   *
   * Result in dropdown:
   *   4       → BLUE, CHECKED    (in both user & facility)
   *   5,6,7,8 → BLUE, UNCHECKED  (in facility only, user can add)
   *   1,2     → RED,  CHECKED    (user has it, NOT in facility = orphan)
   *
   * User can:
   *   - Uncheck orphan (RED) villages to remove them
   *   - Check new facility (BLUE) villages to add them
   *   - Uncheck existing matched villages to remove them
   */
  buildDisplayVillages() {
    // Normalize to Number to avoid type mismatch (API may return string or number)
    const facilityVillageIDs = new Set(
      this.facilityVillages.map((v: any) => Number(v.districtBranchID)),
    );
    const userVillageIDs = this.existingVillageIDs.map((id: any) => Number(id));

    if (this.isEditMode && userVillageIDs.length > 0) {
      // Find orphan villages: user's existing villages NOT in facility's village list
      this.orphanVillages = [];
      for (let i = 0; i < userVillageIDs.length; i++) {
        const vid = userVillageIDs[i];
        if (!facilityVillageIDs.has(vid)) {
          this.orphanVillages.push({
            districtBranchID: vid,
            villageName: this.existingVillageNames[i] || `Village ID ${vid}`,
            isOrphan: true,
          });
        }
      }

      // Mark facility villages as non-orphan (BLUE)
      const facilityMarked = this.facilityVillages.map((v: any) => ({
        ...v,
        districtBranchID: Number(v.districtBranchID),
        isOrphan: false,
      }));

      // Merged list: facility villages (BLUE) first, then orphans (RED) at bottom
      this.displayVillages = [...facilityMarked, ...this.orphanVillages];

      // Pre-select ALL of user's existing village IDs:
      // - Matched villages (in facility) → BLUE checked
      // - Orphan villages (not in facility) → RED checked
      this.selectedVillageIDs = userVillageIDs.slice();
    } else {
      // Create mode OR edit mode with no existing villages:
      // just show facility villages, all unchecked
      this.displayVillages = this.facilityVillages.map((v: any) => ({
        ...v,
        districtBranchID: Number(v.districtBranchID),
        isOrphan: false,
      }));
      this.selectedVillageIDs = [];
    }

    this.emitData();
  }

  onVillageSelectionChange() {
    this.emitData();
  }

  onAshaSelectionChange() {
    this.emitData();
  }

  emitData() {
    const allVillages =
      this.displayVillages.length > 0
        ? this.displayVillages
        : this.facilityVillages;
    const selectedIDs = this.selectedVillageIDs.map((id: any) => Number(id));

    if (this.isAshaSupervisor) {
      const ashaSupervisorMappings = this.selectedAshaUserIDs.map((id) => {
        const user = this.ashaUsers.find(
          (u: any) => Number(u.userID) === Number(id),
        );
        return {
          ashaUserID: id,
          facilityID: user ? user.facilityID : null,
        };
      });

      const villageNames = allVillages
        .filter((v: any) => selectedIDs.includes(Number(v.districtBranchID)))
        .map((v: any) => v.villageName);

      this.facilityMappingData.emit({
        isAshaSupervisor: true,
        ashaSupervisorMappings,
        villageIDs: selectedIDs.slice(),
        villageNames,
        facilityID:
          this.selectedFacilities.length > 0
            ? this.selectedFacilities[0].facilityID
            : null,
        facilityIDs: this.selectedFacilities.map((f: any) => f.facilityID),
      });
    } else {
      const villageNames = allVillages
        .filter((v: any) => selectedIDs.includes(Number(v.districtBranchID)))
        .map((v: any) => v.villageName);

      this.facilityMappingData.emit({
        isAshaSupervisor: false,
        facilityID:
          this.selectedFacility?.facilityID || this.existingFacilityID || null,
        villageIDs: selectedIDs.slice(),
        villageNames,
      });
    }
  }

  /**
   * Filter ASHA workers for create mode:
   * - Workers assigned to ANY supervisor → hide (don't show)
   * - Workers not assigned → show & unchecked
   */
  filterAshaWorkersForCreate(allAshas: any[], supervisorMappings: any[]) {
    const assignedAshaIDs = new Set(
      supervisorMappings.map((m: any) => Number(m.ashaUserID)),
    );

    this.ashaUsers = allAshas
      .filter((u: any) => !assignedAshaIDs.has(Number(u.userID)))
      .map((u: any) => ({
        ...u,
        facilityID: u.facilityID,
        facilityName: this.getFacilityNameByID(u.facilityID),
      }));

    this.selectedAshaUserIDs = [];
  }

  /**
   * Filter ASHA workers for edit mode:
   * - Workers assigned to THIS supervisor → show & pre-check
   * - Workers assigned to ANOTHER supervisor → hide (don't show)
   * - Workers not assigned to any supervisor → show & unchecked
   */
  filterAshaWorkersForEdit(allAshas: any[], supervisorMappings: any[]) {
    // Normalize to Number to avoid type mismatch (string vs number)
    const currentSupervisorID = Number(this.supervisorUserID);

    // Build set of ASHA userIDs assigned to THIS supervisor
    const thisSupervisorAshaIDs = new Set(
      supervisorMappings
        .filter((m: any) => Number(m.supervisorUserID) === currentSupervisorID)
        .map((m: any) => Number(m.ashaUserID)),
    );

    // Build set of ASHA userIDs assigned to ANY other supervisor
    const otherSupervisorAshaIDs = new Set(
      supervisorMappings
        .filter((m: any) => Number(m.supervisorUserID) !== currentSupervisorID)
        .map((m: any) => Number(m.ashaUserID)),
    );

    // Filter: show only workers assigned to this supervisor OR unassigned
    this.ashaUsers = allAshas
      .filter((u: any) => !otherSupervisorAshaIDs.has(Number(u.userID)))
      .map((u: any) => ({
        ...u,
        facilityID: u.facilityID,
        facilityName: this.getFacilityNameByID(u.facilityID),
      }));

    // Pre-select workers already assigned to this supervisor
    this.selectedAshaUserIDs = allAshas
      .filter((u: any) => thisSupervisorAshaIDs.has(Number(u.userID)))
      .map((u: any) => u.userID);

    this.emitData();
  }

  getFacilityNameByID(facilityID: any): string {
    if (!facilityID) return '';
    const id = Number(facilityID);
    const facility =
      this.facilities.find((f: any) => Number(f.facilityID) === id) ||
      this.selectedFacilities.find((f: any) => Number(f.facilityID) === id);
    return facility ? facility.facilityName : '';
  }

  compareFacilityTypes(a: any, b: any): boolean {
    return a && b && Number(a.facilityTypeID) === Number(b.facilityTypeID);
  }

  compareFacilities(a: any, b: any): boolean {
    return a && b && Number(a.facilityID) === Number(b.facilityID);
  }

  resetFacilitySelection() {
    this.selectedRuralUrban = '';
    this.selectedFacilityType = null;
    this.selectedFacility = null;
    this.selectedFacilities = [];
    this.facilities = [];
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];
    this.ashaUsers = [];
    this.selectedAshaUserIDs = [];
  }
}
