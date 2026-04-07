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
  OnDestroy,
  SimpleChanges,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { forkJoin, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-user-facility-mapping',
  templateUrl: './user-facility-mapping.component.html',
  styleUrls: ['./user-facility-mapping.component.css'],
})
export class UserFacilityMappingComponent
  implements OnInit, OnChanges, OnDestroy
{
  private destroy$ = new Subject<void>();
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
  @Input() userOtherVillageIDs: number[] = [];
  @Input() userOtherVillageNames: string[] = [];

  @Output() facilityMappingData = new EventEmitter<any>();
  @Output() noAshaWorkersFlag = new EventEmitter<boolean>();

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
  isAshaRole = false;

  // Edit mode flags
  isEditMode = false;
  // True when user already has a facilityID
  hasExistingFacility = false;
  // True after initial facility pre-population is complete (guards blockID reset)
  initialFacilityLoadDone = false;
  // True after ASHA workers are loaded in edit mode (guards emitData for ASHA Supervisor)
  ashaWorkersLoaded = false;
  // True when ASHA Supervisor edit uses direct facility load (bypasses cascade)
  ashaDirectEditMode = false;
  // True when ASHA workers API returned but no workers available
  noAshaWorkers = false;

  // Facility levels
  facilityLevels: any[] = [];

  // Search terms for dropdown filtering
  facilityTypeSearch = '';
  facilitySearch = '';
  villageSearch = '';
  ashaSearch = '';

  // Filtered arrays for search
  filteredFacilities: any[] = [];
  filteredDisplayVillages: any[] = [];
  filteredAshaUsers: any[] = [];

  constructor(
    private facilityService: FacilityMasterService,
    private alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.loadFacilityLevels();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
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
      if (!changes['roleName'].isFirstChange()) {
        if (this.existingFacilityID) {
          // Same-category role change: reload with existing facility data
          if (this.isAshaSupervisor && this.existingFacilityIDs?.length > 0) {
            this.loadAshaDirectEdit();
          } else if (!this.isAshaSupervisor) {
            this.loadVillagesForEdit();
          }
        } else {
          // Cross-category role change (parent cleared facility/village inputs):
          // reset to fresh create-mode state — admin starts from rural/urban
          this.resetFacilitySelection();
        }
      }
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
      if (
        this.isAshaSupervisor &&
        this.existingFacilityIDs &&
        this.existingFacilityIDs.length > 0
      ) {
        // ASHA Supervisor: bypass cascade, load facilities directly from block
        this.loadAshaDirectEdit();
      } else {
        this.loadVillagesForEdit();
      }
    }

    // Normal flow: load facility types when stateID changes
    if (changes['stateID'] && this.stateID) {
      this.loadFacilityTypes();
    }
    if (
      changes['blockID'] &&
      (this.initialFacilityLoadDone || !this.hasExistingFacility)
    ) {
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
    // If we have facilityID but missing ruralUrban or facilityTypeID,
    // look up the facility from block hierarchy + facility types to derive these values.
    // ruralUrban is a property of the facility TYPE (not the facility itself),
    // so we need both: getFacilitiesByBlock → facilityTypeID, getFacilityTypesByState → ruralUrban
    if (
      this.existingFacilityID &&
      (!this.existingRuralUrban || !this.existingFacilityTypeID) &&
      this.blockID
    ) {
      const requests: any[] = [
        this.facilityService.getFacilitiesByBlock(this.blockID),
      ];
      // Also fetch facility types if not already loaded (needed to derive ruralUrban)
      if (this.stateID && this.allFacilityTypes.length === 0) {
        requests.push(
          this.facilityService.getFacilityTypesByState(this.stateID),
        );
      }

      forkJoin(requests)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (responses: any[]) => {
            const facilitiesRes = responses[0];
            const facilityTypesRes = responses.length > 1 ? responses[1] : null;

            // Load facility types if fetched
            if (facilityTypesRes && facilityTypesRes.data) {
              this.allFacilityTypes = facilityTypesRes.data.filter(
                (ft: any) => !ft.deleted,
              );
            }

            if (facilitiesRes && facilitiesRes.data) {
              const match = facilitiesRes.data.find(
                (f: any) =>
                  Number(f.facilityID) === Number(this.existingFacilityID),
              );
              if (match) {
                if (!this.existingFacilityTypeID && match.facilityTypeID) {
                  this.existingFacilityTypeID = match.facilityTypeID;
                }
                if (!this.existingFacilityName && match.facilityName) {
                  this.existingFacilityName = match.facilityName;
                }
                // Derive ruralUrban from the facility type (not from the facility itself)
                if (!this.existingRuralUrban && this.existingFacilityTypeID) {
                  const ftMatch = this.allFacilityTypes.find(
                    (ft: any) =>
                      Number(ft.facilityTypeID) ===
                      Number(this.existingFacilityTypeID),
                  );
                  if (ftMatch && ftMatch.ruralUrban) {
                    this.existingRuralUrban = ftMatch.ruralUrban;
                  }
                }
              }
            }
            this.proceedWithEditPrePopulation();
          },
          error: () => {
            this.proceedWithEditPrePopulation();
          },
        });
      return;
    }

    this.proceedWithEditPrePopulation();
  }

  /**
   * ASHA Supervisor edit: bypass the Rural/Urban → Facility Type → Facility cascade.
   * Loads ALL facilities from the block in one API call, pre-selects existing ones,
   * then loads villages + ASHA workers directly.
   */
  private loadAshaDirectEdit() {
    this.ashaDirectEditMode = true;

    if (!this.blockID) return;

    this.facilityService
      .getFacilitiesByBlock(this.blockID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.facilities = response.data.filter((f: any) => !f.deleted);
          }

          // Pre-select existing facilities by matching IDs
          const existingIDs = new Set(
            this.existingFacilityIDs.map((id: any) => Number(id)),
          );
          this.selectedFacilities = this.facilities.filter((f: any) =>
            existingIDs.has(Number(f.facilityID)),
          );

          // Skip facilityIDs not found in block (deleted facilities)
          // — don't add placeholders for deleted facilities

          this.facilitySearch = '';
          this.applyFacilityFilter();

          // Load villages + ASHA workers from selected facilities
          const selectedIDs = this.selectedFacilities.map(
            (f: any) => f.facilityID,
          );
          if (selectedIDs.length > 0) {
            this.loadVillagesFromFacilities(selectedIDs);
            this.loadAshaWorkersAndMappings(selectedIDs);
          }
        },
        error: () => {
          this.alertService.alert('Failed to load facilities', 'error');
        },
      });
  }

  private proceedWithEditPrePopulation() {
    // Pre-populate Rural/Urban
    if (this.existingRuralUrban) {
      this.selectedRuralUrban = this.existingRuralUrban;
    }

    // Pre-populate Facility Type, then load full facility list so admin can change
    if (this.existingFacilityTypeID) {
      if (this.allFacilityTypes.length > 0) {
        // Facility types already loaded — find the match immediately
        this.setFacilityTypeFromExisting();
        this.loadFullFacilityListForEdit();
      } else if (this.stateID) {
        // Facility types not loaded yet — fetch them, then set the match
        this.facilityService
          .getFacilityTypesByState(this.stateID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              if (response && response.data) {
                this.allFacilityTypes = response.data.filter(
                  (ft: any) => !ft.deleted,
                );
              }
              this.setFacilityTypeFromExisting();
              this.loadFullFacilityListForEdit();
            },
            error: () => {
              this.alertService.alert('Failed to load facility types', 'error');
            },
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
      this.filteredFacilities = this.facilities.slice();

      // Load villages from ALL facilities (parallel via forkJoin)
      this.loadVillagesFromFacilities(this.existingFacilityIDs);

      // Load ASHA workers + supervisor mappings (parallel via forkJoin)
      this.loadAshaWorkersAndMappings(this.existingFacilityIDs);
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
        this.filteredFacilities = this.facilities.slice();

        // Load village list from single facility
        this.facilityService
          .getVillageMappingsByFacility(this.existingFacilityID)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: any) => {
              if (response && response.data) {
                this.facilityVillages = response.data;
              }
              this.buildDisplayVillages();
            },
            error: () => {
              this.alertService.alert(
                'Failed to load facility villages',
                'error',
              );
              this.buildDisplayVillages();
            },
          });
      } else {
        // No existing facility (old user) — just build display with existing villages
        this.buildDisplayVillages();
      }
    }
  }

  /**
   * After pre-population, load the FULL facility list for the selected type/block
   * so admin can change the facility if needed (not limited to only the existing one).
   */
  loadFullFacilityListForEdit() {
    if (!this.selectedFacilityType || !this.blockID) return;
    const levelVal = this.selectedFacilityType.levelValue;
    this.facilityService
      .getFacilitiesByBlockAndLevel(
        this.blockID,
        levelVal,
        this.selectedRuralUrban,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.facilities = response.data.filter((f: any) => !f.deleted);
          }
          this.facilitySearch = '';
          this.applyFacilityFilter();
          this.initialFacilityLoadDone = true;
        },
        error: () => {
          this.alertService.alert('Failed to load facility list', 'error');
        },
      });
  }

  updateRoleFlags() {
    const role = (this.roleName || '').toLowerCase();
    this.isAshaSupervisor = role === 'asha supervisor';
    this.isAshaRole = role === 'asha' || role === 'asha supervisor';
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
    // Show ALL facility types for the selected Rural/Urban so admin can change
    this.filterFacilityTypes();
  }

  loadFacilityLevels() {
    this.facilityService
      .getFacilityLevels()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.facilityLevels = response.data;
          }
          this.filterFacilityTypes();
        },
        error: () => {
          this.alertService.alert('Failed to load facility levels', 'error');
        },
      });
  }

  loadFacilityTypes() {
    if (!this.stateID) return;
    this.facilityService
      .getFacilityTypesByState(this.stateID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
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
              }
            }
            // Always show all types so admin can change if needed
            this.filterFacilityTypes();
          }
        },
        error: () => {
          this.alertService.alert('Failed to load facility types', 'error');
        },
      });
  }

  filterFacilityTypes() {
    let filtered = this.allFacilityTypes;
    if (this.selectedRuralUrban) {
      filtered = filtered.filter(
        (ft: any) => ft.ruralUrban === this.selectedRuralUrban,
      );
    }
    // ASHA / ASHA Supervisor: show only lowest level (Sub-Center) facility types
    if (this.isAshaRole && this.facilityLevels.length > 0) {
      const maxLevelValue = Math.max(
        ...this.facilityLevels.map((l: any) => l.levelValue),
      );
      filtered = filtered.filter((ft: any) => ft.levelValue === maxLevelValue);
    }
    this.filteredFacilityTypes = filtered;
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
    this.ashaWorkersLoaded = false;
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
    this.ashaWorkersLoaded = false;

    if (!this.selectedFacilityType || !this.blockID) return;

    const levelVal = this.selectedFacilityType.levelValue;
    this.facilityService
      .getFacilitiesByBlockAndLevel(
        this.blockID,
        levelVal,
        this.selectedRuralUrban,
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.facilities = response.data.filter((f: any) => !f.deleted);
          }
          this.facilitySearch = '';
          this.applyFacilityFilter();
        },
        error: () => {
          this.alertService.alert('Failed to load facilities', 'error');
        },
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
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.data) {
            this.facilityVillages = response.data;
          }
          this.buildDisplayVillages();
        },
        error: () => {
          this.alertService.alert('Failed to load facility villages', 'error');
          this.buildDisplayVillages();
        },
      });
  }

  // Multi-select facilities (ASHA Supervisor role)
  onFacilitiesSelected() {
    this.facilityVillages = [];
    this.selectedVillageIDs = [];
    this.displayVillages = [];
    this.orphanVillages = [];
    this.ashaUsers = [];
    this.selectedAshaUserIDs = [];
    this.ashaWorkersLoaded = false;
    this.noAshaWorkers = false;
    this.noAshaWorkersFlag.emit(false);

    if (!this.selectedFacilities || this.selectedFacilities.length === 0)
      return;

    const facilityIDs = this.selectedFacilities.map((f: any) => f.facilityID);

    // Load villages from all selected facilities (parallel via forkJoin)
    this.loadVillagesFromFacilities(facilityIDs);

    // Load ASHA users + filter based on mode (parallel via forkJoin)
    this.loadAshaWorkersAndMappings(facilityIDs);
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

    // Edit mode uses existingVillageIDs; create mode uses userOtherVillageIDs from other mappings
    const editVillageIDs = this.existingVillageIDs.map((id: any) => Number(id));
    const otherVillageIDs = this.userOtherVillageIDs.map((id: any) =>
      Number(id),
    );

    // Merge both sources, deduplicated
    const mergedIDSet = new Set<number>([
      ...editVillageIDs,
      ...otherVillageIDs,
    ]);
    const mergedVillageIDs = Array.from(mergedIDSet);

    // Build a name lookup from both sources
    const villageNameMap = new Map<number, string>();
    editVillageIDs.forEach((id, idx) => {
      villageNameMap.set(id, this.existingVillageNames[idx] || '');
    });
    otherVillageIDs.forEach((id, idx) => {
      if (!villageNameMap.has(id)) {
        villageNameMap.set(id, this.userOtherVillageNames[idx] || '');
      }
    });

    if (mergedVillageIDs.length > 0) {
      // Find orphan villages: user's existing villages NOT in facility's village list
      this.orphanVillages = [];
      for (const vid of mergedVillageIDs) {
        if (!facilityVillageIDs.has(vid)) {
          this.orphanVillages.push({
            districtBranchID: vid,
            villageName: villageNameMap.get(vid) || `Village ID ${vid}`,
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

      // Auto-select only facility (blue) villages — orphans shown in red but unchecked/not mapped
      this.selectedVillageIDs = facilityMarked.map(
        (v: any) => v.districtBranchID,
      );
    } else {
      // No existing villages: show facility villages only
      this.displayVillages = this.facilityVillages.map((v: any) => ({
        ...v,
        districtBranchID: Number(v.districtBranchID),
        isOrphan: false,
      }));
      // Default: auto-select all (for read-only chips)
      this.selectedVillageIDs = this.displayVillages.map(
        (v: any) => v.districtBranchID,
      );
    }

    // ASHA (not supervisor) sees a selectable dropdown — override selection logic
    // Edit: pre-select only user's existing villages that are IN the facility (exclude orphans)
    // Create: empty, user picks
    if (this.isAshaRole && !this.isAshaSupervisor) {
      if (this.isEditMode && editVillageIDs.length > 0) {
        const userSet = new Set(editVillageIDs);
        this.selectedVillageIDs = this.displayVillages
          .filter((v: any) => userSet.has(v.districtBranchID) && !v.isOrphan)
          .map((v: any) => v.districtBranchID);
      } else {
        this.selectedVillageIDs = [];
      }
    }

    this.villageSearch = '';
    this.applyVillageFilter();
    this.emitData();
  }

  onVillageSelectionChange() {
    this.emitData();
  }

  onAshaSelectionChange() {
    this.emitData();
  }

  emitData() {
    // For ASHA Supervisor in edit mode, wait until ASHA workers are loaded
    // so the parent doesn't receive incomplete data before workers finish loading
    if (this.isAshaSupervisor && this.isEditMode && !this.ashaWorkersLoaded) {
      return;
    }

    const allVillages =
      this.displayVillages.length > 0
        ? this.displayVillages
        : this.facilityVillages;
    // Filter out orphan villages — only facility (non-orphan) villages get emitted
    const orphanIDSet = new Set(
      this.displayVillages
        .filter((v: any) => v.isOrphan)
        .map((v: any) => Number(v.districtBranchID)),
    );
    const selectedIDs = this.selectedVillageIDs
      .map((id: any) => Number(id))
      .filter((id) => !orphanIDSet.has(id));

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
    this.ashaSearch = '';
    this.applyAshaFilter();
    this.noAshaWorkers = this.ashaUsers.length === 0;
    this.noAshaWorkersFlag.emit(this.noAshaWorkers);
  }

  /**
   * Filter ASHA workers for edit mode:
   * - Workers assigned to THIS supervisor & still at facility → show (checked, normal)
   * - Workers assigned to THIS supervisor but moved away → show (checked, RED)
   * - Workers assigned to ANOTHER supervisor → hide (don't show)
   * - Workers not assigned to any supervisor → show (unchecked)
   */
  filterAshaWorkersForEdit(allAshas: any[], supervisorMappings: any[]) {
    const currentSupervisorID = Number(this.supervisorUserID);

    // ASHA userIDs assigned to THIS supervisor
    const thisSupervisorMappings = supervisorMappings.filter(
      (m: any) => Number(m.supervisorUserID) === currentSupervisorID,
    );
    const thisSupervisorAshaIDs = new Set(
      thisSupervisorMappings.map((m: any) => Number(m.ashaUserID)),
    );

    // ASHA userIDs assigned to OTHER supervisors
    const otherSupervisorAshaIDs = new Set(
      supervisorMappings
        .filter((m: any) => Number(m.supervisorUserID) !== currentSupervisorID)
        .map((m: any) => Number(m.ashaUserID)),
    );

    // Set of ASHA userIDs currently at the facility
    const facilityAshaIDs = new Set(allAshas.map((u: any) => Number(u.userID)));

    // Workers currently at facility: show if not assigned to another supervisor
    const visibleWorkers = allAshas
      .filter((u: any) => !otherSupervisorAshaIDs.has(Number(u.userID)))
      .map((u: any) => ({
        ...u,
        facilityID: u.facilityID,
        facilityName: this.getFacilityNameByID(u.facilityID),
        movedAway: false,
      }));

    // Workers assigned to THIS supervisor but no longer at the facility (moved away)
    const movedAwayWorkers = thisSupervisorMappings
      .filter((m: any) => !facilityAshaIDs.has(Number(m.ashaUserID)))
      .map((m: any) => ({
        userID: m.ashaUserID,
        EmployeeName:
          m.ashaEmployeeName || m.ashaName || 'ASHA ' + m.ashaUserID,
        facilityID: m.facilityID,
        facilityName: '',
        movedAway: true,
      }));

    this.ashaUsers = [...visibleWorkers, ...movedAwayWorkers];

    // Pre-select ALL workers assigned to this supervisor (including moved-away)
    this.selectedAshaUserIDs = [...thisSupervisorAshaIDs]
      .filter((id) => this.ashaUsers.some((u: any) => Number(u.userID) === id))
      .map((id) => {
        const user = this.ashaUsers.find((u: any) => Number(u.userID) === id);
        return user ? user.userID : id;
      });

    this.ashaWorkersLoaded = true;
    this.ashaSearch = '';
    this.applyAshaFilter();
    this.noAshaWorkers = this.ashaUsers.length === 0;
    this.noAshaWorkersFlag.emit(this.noAshaWorkers);
    this.emitData();
  }

  /**
   * Shared: Load villages from multiple facilities in parallel using forkJoin.
   * Deduplicates by districtBranchID, then calls buildDisplayVillages().
   */
  private loadVillagesFromFacilities(facilityIDs: number[]) {
    if (!facilityIDs || facilityIDs.length === 0) {
      this.facilityVillages = [];
      this.buildDisplayVillages();
      return;
    }

    const requests = facilityIDs.map((fID) =>
      this.facilityService.getVillageMappingsByFacility(fID),
    );

    forkJoin(requests)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (responses: any[]) => {
          const villageMap = new Map<number, any>();
          for (const response of responses) {
            if (response && response.data) {
              for (const v of response.data) {
                villageMap.set(Number(v.districtBranchID), v);
              }
            }
          }
          this.facilityVillages = Array.from(villageMap.values());
          this.buildDisplayVillages();
        },
        error: () => {
          this.alertService.alert('Failed to load village mappings', 'error');
          this.facilityVillages = [];
          this.buildDisplayVillages();
        },
      });
  }

  /**
   * Shared: Load ASHA workers + supervisor mappings from facilities in parallel.
   * Gets all ASHAs via batch API, then fetches supervisor mappings per facility using forkJoin.
   * Calls filterAshaWorkersForEdit() or filterAshaWorkersForCreate() based on mode.
   */
  private loadAshaWorkersAndMappings(facilityIDs: number[]) {
    if (!facilityIDs || facilityIDs.length === 0) return;

    this.facilityService
      .getAshasByFacility(facilityIDs)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          const allAshas = response && response.data ? response.data : [];

          const mappingRequests = facilityIDs.map((fID) =>
            this.facilityService.getSupervisorMappingByFacility(fID),
          );

          forkJoin(mappingRequests)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (mappingResponses: any[]) => {
                const allSupervisorMappings: any[] = [];
                for (const mapRes of mappingResponses) {
                  if (mapRes && mapRes.data) {
                    const mappings = Array.isArray(mapRes.data)
                      ? mapRes.data
                      : [mapRes.data];
                    allSupervisorMappings.push(...mappings);
                  }
                }
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
              },
              error: () => {
                this.alertService.alert(
                  'Failed to load supervisor mappings',
                  'error',
                );
                if (this.isEditMode) {
                  this.filterAshaWorkersForEdit(allAshas, []);
                } else {
                  this.filterAshaWorkersForCreate(allAshas, []);
                }
              },
            });
        },
        error: () => {
          this.alertService.alert('Failed to load ASHA workers', 'error');
        },
      });
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
    this.ashaWorkersLoaded = false;
    this.ashaDirectEditMode = false;
    this.noAshaWorkers = false;
    this.noAshaWorkersFlag.emit(false);
    this.clearAllSearches();
  }

  // --- Search filter methods ---

  clearAllSearches() {
    this.facilityTypeSearch = '';
    this.facilitySearch = '';
    this.villageSearch = '';
    this.ashaSearch = '';
    this.filteredFacilities = [];
    this.filteredDisplayVillages = [];
    this.filteredAshaUsers = [];
  }

  filterFacilityTypeOptions(term: string) {
    this.facilityTypeSearch = term;
  }

  getFilteredFacilityTypes(): any[] {
    if (!this.facilityTypeSearch) return this.filteredFacilityTypes;
    const s = this.facilityTypeSearch.toLowerCase();
    return this.filteredFacilityTypes.filter((ft: any) =>
      (ft.facilityTypeName || '').toLowerCase().includes(s),
    );
  }

  filterFacilityOptions(term: string) {
    this.facilitySearch = term;
    this.applyFacilityFilter();
  }

  applyFacilityFilter() {
    if (!this.facilitySearch) {
      this.filteredFacilities = this.facilities.slice();
    } else {
      const s = this.facilitySearch.toLowerCase();
      this.filteredFacilities = this.facilities.filter((f: any) =>
        (f.facilityName || '').toLowerCase().includes(s),
      );
    }
  }

  filterVillageOptions(term: string) {
    this.villageSearch = term;
    this.applyVillageFilter();
  }

  applyVillageFilter(searchValue?: string) {
    if (searchValue !== undefined) {
      this.villageSearch = searchValue;
    }
    if (!this.villageSearch) {
      this.filteredDisplayVillages = this.displayVillages.slice();
    } else {
      const s = this.villageSearch.toLowerCase();
      this.filteredDisplayVillages = this.displayVillages.filter((v: any) =>
        (v.villageName || '').toLowerCase().includes(s),
      );
    }
  }

  filterAshaOptions(term: string) {
    this.ashaSearch = term;
    this.applyAshaFilter();
  }

  applyAshaFilter() {
    if (!this.ashaSearch) {
      this.filteredAshaUsers = this.ashaUsers.slice();
    } else {
      const s = this.ashaSearch.toLowerCase();
      this.filteredAshaUsers = this.ashaUsers.filter((u: any) => {
        const name =
          u.EmployeeName ||
          (u.employeeMaster?.firstName || '') +
            ' ' +
            (u.employeeMaster?.lastName || '');
        const facility = u.facilityName || '';
        return (
          name.toLowerCase().includes(s) || facility.toLowerCase().includes(s)
        );
      });
    }
  }

  // --- Select All / Deselect All toggle methods ---

  get allFacilitiesSelected(): boolean {
    return (
      this.filteredFacilities.length > 0 &&
      this.selectedFacilities.length === this.filteredFacilities.length
    );
  }

  toggleSelectAllFacilities() {
    if (this.allFacilitiesSelected) {
      this.selectedFacilities = [];
    } else {
      this.selectedFacilities = this.filteredFacilities.slice();
    }
    this.onFacilitiesSelected();
  }

  get allVillagesSelected(): boolean {
    // Only consider non-orphan villages for Select All state
    const selectableIDs = this.filteredDisplayVillages
      .filter((v: any) => !v.isOrphan)
      .map((v: any) => v.districtBranchID);
    if (selectableIDs.length === 0) return false;
    return selectableIDs.every((id) => this.selectedVillageIDs.includes(id));
  }

  toggleSelectAllVillages() {
    // Only add/remove non-orphan villages
    const selectableIDs = this.filteredDisplayVillages
      .filter((v: any) => !v.isOrphan)
      .map((v: any) => v.districtBranchID);
    if (this.allVillagesSelected) {
      const removeSet = new Set(selectableIDs);
      this.selectedVillageIDs = this.selectedVillageIDs.filter(
        (id) => !removeSet.has(id),
      );
    } else {
      const existing = new Set(this.selectedVillageIDs);
      const newIDs = [...this.selectedVillageIDs];
      for (const id of selectableIDs) {
        if (!existing.has(id)) {
          newIDs.push(id);
        }
      }
      this.selectedVillageIDs = newIDs;
    }
    this.onVillageSelectionChange();
  }

  get allAshaSelected(): boolean {
    if (this.filteredAshaUsers.length === 0) return false;
    const filteredIDs = new Set(
      this.filteredAshaUsers.map((u: any) => u.userID),
    );
    return [...filteredIDs].every((id) =>
      this.selectedAshaUserIDs.includes(id),
    );
  }

  toggleSelectAllAsha() {
    const filteredIDs = this.filteredAshaUsers.map((u: any) => u.userID);
    if (this.allAshaSelected) {
      const removeSet = new Set(filteredIDs);
      this.selectedAshaUserIDs = this.selectedAshaUserIDs.filter(
        (id) => !removeSet.has(id),
      );
    } else {
      const existing = new Set(this.selectedAshaUserIDs);
      for (const id of filteredIDs) {
        if (!existing.has(id)) {
          this.selectedAshaUserIDs.push(id);
        }
      }
    }
    this.onAshaSelectionChange();
  }
}
