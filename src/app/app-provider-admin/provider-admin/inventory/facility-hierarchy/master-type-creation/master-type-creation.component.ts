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
  selector: 'app-master-type-creation',
  templateUrl: './master-type-creation.component.html',
  styleUrls: ['./master-type-creation.component.css'],
})
export class MasterTypeCreationComponent implements OnInit {
  facilityTypeList = new MatTableDataSource<any>();
  bufferArray = new MatTableDataSource<any>();
  @ViewChild('tablePaginator') tablePaginator: MatPaginator | null = null;
  @ViewChild('bufferPaginator') bufferPaginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'sno',
    'facilityTypeName',
    'ruralUrban',
    'facilityLevel',
    'edit',
    'action',
  ];

  bufferColumns: string[] = [
    'sno',
    'facilityTypeName',
    'ruralUrban',
    'facilityLevel',
    'delete',
  ];

  createButton = false;
  facilityTypeName: any;
  facilityTypeDesc: any;
  ruralUrban: any;
  facilityLevelID: any;
  facilityTypeID: any;
  edit_facilityTypeName: any;
  edit_facilityTypeDesc: any;
  edit_ruralUrban: any;
  createdBy: any;
  uid: any;

  state: any;
  edit_State: any;

  states_array: any = [];
  facilityLevels_array: any = [];
  facilityMasterList: any = [];
  create_filterTerm!: string;

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

  loadFacilityTypesByState(stateID: number) {
    this.createButton = true;
    this.facility
      .getFacilityTypesByState(stateID)
      .subscribe((response: any) => {
        if (response && response.data) {
          this.facilityMasterList = response.data;
          this.facilityTypeList.data = response.data;
          this.facilityTypeList.paginator = this.tablePaginator;
        } else {
          this.facilityMasterList = [];
          this.facilityTypeList.data = [];
        }
        this.showTableFlag = true;
      });
  }

  getLevelName(facilityLevelID: number): string {
    const level = this.facilityLevels_array.find(
      (l: any) => l.facilityLevelID === facilityLevelID,
    );
    return level ? level.levelName : '';
  }

  showTable() {
    this.tableMode = true;
    this.formMode = false;
    this.editMode = false;
    this.bufferArray.data = [];
    this.resetForm();
    if (this.state?.stateID) {
      this.loadFacilityTypesByState(this.state.stateID);
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
      this.facilityTypeList.data = this.facilityMasterList;
      this.facilityTypeList.paginator = this.tablePaginator;
    } else {
      this.facilityTypeList.data = [];
      this.facilityMasterList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'facilityTypeName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.facilityTypeList.data.push(item);
              break;
            }
          }
        }
      });
      this.facilityTypeList.paginator = this.tablePaginator;
    }
  }

  add2bufferArray() {
    const levelName = this.getLevelName(this.facilityLevelID);
    const obj: any = {
      facilityTypeName: this.facilityTypeName,
      facilityTypeDesc: this.facilityTypeDesc,
      ruralUrban: this.ruralUrban,
      facilityLevelID: this.facilityLevelID,
      levelName: levelName,
      stateID: this.state?.stateID,
      createdBy: this.createdBy,
    };
    this.checkDuplicates(obj);
    this.resetForm();
  }

  checkDuplicates(object: any) {
    let duplicateStatus = 0;
    if (this.bufferArray.data.length === 0) {
      this.bufferArray.data.push(object);
      this.bufferArray.paginator = this.bufferPaginator;
    } else {
      for (let i = 0; i < this.bufferArray.data.length; i++) {
        if (
          this.bufferArray.data[i].facilityTypeName?.toLowerCase() ===
          object.facilityTypeName?.toLowerCase()
        ) {
          duplicateStatus++;
        }
      }
      if (duplicateStatus === 0) {
        this.bufferArray.data.push(object);
        this.bufferArray.paginator = this.bufferPaginator;
      }
    }
  }

  removeRow(index: number) {
    this.bufferArray.data.splice(index, 1);
  }

  saveFacilityTypes() {
    this.facility.savefacilities(this.bufferArray.data).subscribe(
      (response: any) => {
        if (response) {
          this.dialogService.alert('Saved successfully', 'success');
          this.resetForm();
          this.showTable();
        }
      },
      (err: any) => {
        console.log(err, 'ERROR');
      },
    );
  }

  editFacilityType(item: any) {
    this.edit_State = this.state;
    this.facilityTypeID = item.facilityTypeID;
    this.edit_facilityTypeName = item.facilityTypeName;
    this.edit_facilityTypeDesc = item.facilityTypeDesc;
    this.edit_ruralUrban = item.ruralUrban;
    this.showEditForm();
  }

  updateFacilityType() {
    const editObj: any = {
      facilityTypeID: this.facilityTypeID,
      facilityTypeDesc: this.edit_facilityTypeDesc,
      modifiedBy: this.createdBy,
    };
    if (this.edit_ruralUrban) {
      editObj.ruralUrban = this.edit_ruralUrban;
    }
    this.facility.updateFacility(editObj).subscribe(
      (response: any) => {
        if (response) {
          this.dialogService.alert('Updated successfully', 'success');
          this.resetForm();
          this.showTable();
        }
      },
      (err: any) => {
        console.log(err, 'ERROR');
      },
    );
  }

  activate(facilityTypeID: any) {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to Activate?')
      .subscribe((response: any) => {
        if (response) {
          const object = { facilityTypeID: facilityTypeID, deleted: false };
          this.facility.deleteFacility(object).subscribe(
            (res: any) => {
              if (res) {
                this.dialogService.alert('Activated successfully', 'success');
                if (this.state?.stateID) {
                  this.loadFacilityTypesByState(this.state.stateID);
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

  deactivate(facilityTypeID: any) {
    this.dialogService
      .confirm('Confirm', 'Are you sure you want to Deactivate?')
      .subscribe((response: any) => {
        if (response) {
          const object = { facilityTypeID: facilityTypeID, deleted: true };
          this.facility.deleteFacility(object).subscribe(
            (res: any) => {
              if (res) {
                this.dialogService.alert(
                  'Deactivated successfully',
                  'success',
                );
                if (this.state?.stateID) {
                  this.loadFacilityTypesByState(this.state.stateID);
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
    this.facilityTypeName = undefined;
    this.facilityTypeDesc = undefined;
    this.ruralUrban = undefined;
    this.facilityLevelID = undefined;
    this.edit_facilityTypeName = undefined;
    this.edit_facilityTypeDesc = undefined;
    this.edit_ruralUrban = undefined;
  }
}
