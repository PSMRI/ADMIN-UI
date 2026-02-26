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
    'facilityTypeName',
    'ruralUrban',
    'edit',
    'action',
  ];

  createButton = false;
  facilityName: any;
  facilityDesc: any;
  facilityTypeID: any;
  formRuralUrban: any;
  facilityID: any;
  edit_facilityName: any;
  edit_facilityDesc: any;
  edit_ruralUrban: any;
  edit_facilityTypeID: any;
  edit_selectedLevel: any = null;
  edit_villages_array: any = [];
  edit_selectedVillages: any = [];
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

  selectedLevel: any = null;
  villages_array: any = [];
  selectedVillages: any = [];
  childFacilities_array: any = [];
  selectedChildFacilities: any = [];

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
    this.facility.getFacilitiesByBlock(blockID).subscribe((response: any) => {
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

  onRuralUrbanChange() {
    this.facilityTypeID = undefined;
    this.selectedLevel = null;
    this.villages_array = [];
    this.selectedVillages = [];
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
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
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];

    if (!this.facilityTypeID) return;

    const selectedType = this.facilityTypes_array.find(
      (item: any) => item.facilityTypeID === this.facilityTypeID,
    );
    if (!selectedType || !selectedType.facilityLevelID) return;

    this.selectedLevel = this.facilityLevels_array.find(
      (level: any) => level.facilityLevelID === selectedType.facilityLevelID,
    );
    if (!this.selectedLevel) return;

    const blockID = this.taluk?.blockID;
    if (!blockID) return;

    if (this.selectedLevel.levelValue === 1) {
      this.facility.getVillages(blockID).subscribe((response: any) => {
        if (response && response.data) {
          const allVillages = response.data;
          this.facility
            .getMappedVillageIDs(blockID)
            .subscribe((mappedRes: any) => {
              if (mappedRes && mappedRes.data) {
                const mappedIDs: number[] = mappedRes.data;
                this.villages_array = allVillages.filter(
                  (v: any) => !mappedIDs.includes(v.districtBranchID),
                );
              } else {
                this.villages_array = allVillages;
              }
            });
        }
      });
    } else {
      const lowerLevelValue = this.selectedLevel.levelValue - 1;
      const lowerLevel = this.facilityLevels_array.find(
        (level: any) => level.levelValue === lowerLevelValue,
      );
      if (lowerLevel) {
        this.facility
          .getFacilitiesByBlockAndLevel(
            blockID,
            lowerLevel.facilityLevelID,
            this.formRuralUrban,
          )
          .subscribe((response: any) => {
            if (response && response.data) {
              this.childFacilities_array = response.data;
            }
          });
      }
    }
  }

  getLowerLevelName(): string {
    if (!this.selectedLevel || this.selectedLevel.levelValue <= 1) return '';
    const lowerLevelValue = this.selectedLevel.levelValue - 1;
    const lowerLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === lowerLevelValue,
    );
    return lowerLevel ? lowerLevel.levelName : '';
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
      this.facilityList.data = [];
      this.facilityMasterList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'facilityName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.facilityList.data.push(item);
              break;
            }
          }
        }
      });
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

  saveSingleFacility() {
    const facilityObj: any = {
      facilityName: this.facilityName,
      facilityDesc: this.facilityDesc,
      facilityTypeID: this.facilityTypeID,
      ruralUrban: this.formRuralUrban,
      stateID: this.state?.stateID,
      districtID: this.district?.districtID,
      blockID: this.taluk?.blockID,
      isMainFacility: true,
      createdBy: this.createdBy,
    };

    const villageIDs: number[] = [];
    const childFacilityIDs: number[] = [];

    if (
      this.selectedLevel?.levelValue === 1 &&
      this.selectedVillages.length > 0
    ) {
      for (const v of this.selectedVillages) {
        villageIDs.push(v.districtBranchID);
      }
    } else if (
      this.selectedLevel?.levelValue > 1 &&
      this.selectedChildFacilities.length > 0
    ) {
      for (const c of this.selectedChildFacilities) {
        childFacilityIDs.push(c.facilityID);
      }
    }

    const requestObj = {
      facility: facilityObj,
      villageIDs: villageIDs.length > 0 ? villageIDs : null,
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
    this.edit_facilityTypeID = item.facilityTypeID;

    console.log('[editFacility] item:', item);
    console.log(
      '[editFacility] facilityTypes_array length:',
      this.facilityTypes_array.length,
    );
    console.log(
      '[editFacility] facilityLevels_array:',
      this.facilityLevels_array,
    );

    const selectedType = this.facilityTypes_array.find(
      (ft: any) => ft.facilityTypeID === item.facilityTypeID,
    );
    console.log('[editFacility] selectedType:', selectedType);
    this.edit_ruralUrban = selectedType ? selectedType.ruralUrban : '';

    this.edit_selectedLevel = null;
    if (selectedType && selectedType.facilityLevelID) {
      this.edit_selectedLevel = this.facilityLevels_array.find(
        (level: any) => level.facilityLevelID === selectedType.facilityLevelID,
      );
    }
    console.log('[editFacility] edit_selectedLevel:', this.edit_selectedLevel);

    const blockID = this.taluk?.blockID;
    console.log('[editFacility] blockID:', blockID);
    if (this.edit_selectedLevel && blockID) {
      if (this.edit_selectedLevel.levelValue === 1) {
        this.loadEditVillages(blockID, item.facilityID);
      } else {
        this.loadEditChildFacilities(blockID, item.facilityID);
      }
    } else {
      console.warn(
        '[editFacility] Skipping village/child load: edit_selectedLevel or blockID is missing',
      );
    }

    this.showEditForm();
  }

  loadEditVillages(blockID: number, facilityID: number) {
    console.log(
      '[loadEditVillages] blockID:',
      blockID,
      'facilityID:',
      facilityID,
    );
    this.facility.getVillages(blockID).subscribe(
      (allVillagesRes: any) => {
        console.log('[loadEditVillages] allVillagesRes:', allVillagesRes);
        if (allVillagesRes && allVillagesRes.data) {
          const allVillages = allVillagesRes.data;
          console.log(
            '[loadEditVillages] allVillages count:',
            allVillages.length,
          );
          this.facility.getMappedVillageIDs(blockID).subscribe(
            (mappedRes: any) => {
              console.log('[loadEditVillages] mappedRes:', mappedRes);
              const allMappedIDs: number[] =
                mappedRes && mappedRes.data ? mappedRes.data : [];
              console.log('[loadEditVillages] allMappedIDs:', allMappedIDs);
              this.facility.getVillageMappingsByFacility(facilityID).subscribe(
                (myMappingsRes: any) => {
                  console.log(
                    '[loadEditVillages] myMappingsRes:',
                    myMappingsRes,
                  );
                  const myMappings =
                    myMappingsRes && myMappingsRes.data
                      ? myMappingsRes.data
                      : [];
                  const myMappedIDs: number[] = myMappings.map(
                    (m: any) => m.districtBranchID,
                  );
                  console.log('[loadEditVillages] myMappedIDs:', myMappedIDs);

                  this.edit_villages_array = allVillages.filter(
                    (v: any) =>
                      !allMappedIDs.includes(v.districtBranchID) ||
                      myMappedIDs.includes(v.districtBranchID),
                  );
                  console.log(
                    '[loadEditVillages] edit_villages_array count:',
                    this.edit_villages_array.length,
                  );

                  this.edit_selectedVillages = this.edit_villages_array.filter(
                    (v: any) => myMappedIDs.includes(v.districtBranchID),
                  );
                  console.log(
                    '[loadEditVillages] edit_selectedVillages count:',
                    this.edit_selectedVillages.length,
                  );
                  console.log(
                    '[loadEditVillages] edit_selectedVillages:',
                    this.edit_selectedVillages,
                  );
                },
                (err: any) => {
                  console.error(
                    '[loadEditVillages] getVillageMappingsByFacility error:',
                    err,
                  );
                },
              );
            },
            (err: any) => {
              console.error(
                '[loadEditVillages] getMappedVillageIDs error:',
                err,
              );
            },
          );
        }
      },
      (err: any) => {
        console.error('[loadEditVillages] getVillages error:', err);
      },
    );
  }

  loadEditChildFacilities(blockID: number, facilityID: number) {
    const lowerLevelValue = this.edit_selectedLevel.levelValue - 1;
    const lowerLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === lowerLevelValue,
    );
    console.log('[loadEditChildFacilities] lowerLevel:', lowerLevel);
    if (!lowerLevel) return;

    this.facility
      .getFacilitiesByBlockAndLevel(
        blockID,
        lowerLevel.facilityLevelID,
        this.edit_ruralUrban,
      )
      .subscribe(
        (availableRes: any) => {
          const availableFacilities =
            availableRes && availableRes.data ? availableRes.data : [];
          console.log(
            '[loadEditChildFacilities] availableFacilities:',
            availableFacilities,
          );
          this.facility.getChildFacilitiesByParent(facilityID).subscribe(
            (childrenRes: any) => {
              const currentChildren =
                childrenRes && childrenRes.data ? childrenRes.data : [];
              const currentChildIDs: number[] = currentChildren.map(
                (c: any) => c.facilityID,
              );
              console.log(
                '[loadEditChildFacilities] currentChildren:',
                currentChildren,
              );

              this.edit_childFacilities_array = [
                ...availableFacilities,
                ...currentChildren,
              ];

              this.edit_selectedChildFacilities =
                this.edit_childFacilities_array.filter((c: any) =>
                  currentChildIDs.includes(c.facilityID),
                );
              console.log(
                '[loadEditChildFacilities] edit_selectedChildFacilities:',
                this.edit_selectedChildFacilities,
              );
            },
            (err: any) => {
              console.error(
                '[loadEditChildFacilities] getChildFacilitiesByParent error:',
                err,
              );
            },
          );
        },
        (err: any) => {
          console.error(
            '[loadEditChildFacilities] getFacilitiesByBlockAndLevel error:',
            err,
          );
        },
      );
  }

  getEditLowerLevelName(): string {
    if (!this.edit_selectedLevel || this.edit_selectedLevel.levelValue <= 1)
      return '';
    const lowerLevelValue = this.edit_selectedLevel.levelValue - 1;
    const lowerLevel = this.facilityLevels_array.find(
      (level: any) => level.levelValue === lowerLevelValue,
    );
    return lowerLevel ? lowerLevel.levelName : '';
  }

  compareVillages(v1: any, v2: any): boolean {
    return v1 && v2 && v1.districtBranchID === v2.districtBranchID;
  }

  compareFacilities(f1: any, f2: any): boolean {
    return f1 && f2 && f1.facilityID === f2.facilityID;
  }

  updateFacility() {
    const facilityObj: any = {
      facilityID: this.facilityID,
      facilityName: this.edit_facilityName,
      facilityDesc: this.edit_facilityDesc,
      modifiedBy: this.createdBy,
    };

    let villageIDs: number[] | null = null;
    let childFacilityIDs: number[] | null = null;

    if (this.edit_selectedLevel?.levelValue === 1) {
      villageIDs = this.edit_selectedVillages.map(
        (v: any) => v.districtBranchID,
      );
    } else if (this.edit_selectedLevel?.levelValue > 1) {
      childFacilityIDs = this.edit_selectedChildFacilities.map(
        (c: any) => c.facilityID,
      );
    }

    const requestObj = {
      facility: facilityObj,
      villageIDs: villageIDs,
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
      .confirm('Confirm', 'Are you sure you want to Activate?')
      .subscribe((response: any) => {
        if (response) {
          const object = { facilityID: facilityID, deleted: false };
          this.facility.deleteFacilityStore(object).subscribe(
            (res: any) => {
              if (res) {
                this.dialogService.alert('Activated successfully', 'success');
                if (this.taluk?.blockID) {
                  this.loadFacilitiesByBlock(this.taluk.blockID);
                }
                this.create_filterTerm = '';
              }
            },
            (err: any) => {
              console.log('error', err);
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
          const object = { facilityID: facilityID, deleted: true };
          this.facility.deleteFacilityStore(object).subscribe(
            (res: any) => {
              if (res) {
                this.dialogService.alert('Deactivated successfully', 'success');
                if (this.taluk?.blockID) {
                  this.loadFacilitiesByBlock(this.taluk.blockID);
                }
                this.create_filterTerm = '';
              }
            },
            (err: any) => {
              console.log('error', err);
            },
          );
        }
      });
  }

  resetForm() {
    this.facilityName = undefined;
    this.facilityDesc = undefined;
    this.facilityTypeID = undefined;
    this.formRuralUrban = undefined;
    this.selectedLevel = null;
    this.filteredFacilityTypes = [];
    this.villages_array = [];
    this.selectedVillages = [];
    this.childFacilities_array = [];
    this.selectedChildFacilities = [];
    this.edit_facilityName = undefined;
    this.edit_facilityDesc = undefined;
    this.edit_ruralUrban = undefined;
    this.edit_facilityTypeID = undefined;
    this.edit_selectedLevel = null;
    this.edit_villages_array = [];
    this.edit_selectedVillages = [];
    this.edit_childFacilities_array = [];
    this.edit_selectedChildFacilities = [];
  }
}
