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
  ViewChild,
  Inject,
  ChangeDetectorRef,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import { FeedbackTypeService } from '../services/feedback-type-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';
@Component({
  selector: 'app-feedback-complaint-nature-master',
  templateUrl: './feedback-complaint-nature-master.component.html',
  styleUrls: ['./feedback-complaint-nature-master.component.css'],
})
export class FeedbackComplaintNatureMasterComponent implements OnInit {
  [x: string]: any;
  // filterednatureTypes: any = [];
  previous_state_id: any;
  previous_service_id: any;
  previous_feedbacktype: any;

  search_state: any;
  search_serviceline: any;
  search_feedbacktype: any;
  searchForm = true;
  showTable = false;
  serviceProviderID: any;
  states: any = [];
  servicelines: any = [];
  feedbackTypes: any = [];
  natureTypes: any = [];
  providerServiceMapID: any = [];
  feedbackTypeID: any;
  confirmMessage: any;
  // objs = [];
  @ViewChild('searchCNForm')
  searchCNForm!: NgForm;
  @ViewChild('addForm')
  addForm!: NgForm;
  @ViewChild('editForm')
  editForm!: NgForm;
  natureExists = false;
  searchFeedbackNatureArray: any = [];
  msg = 'Complaint nature already exists';
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filterednatureTypes = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filterednatureTypes.paginator = this.paginator;
  }
  objs = new MatTableDataSource<any>();
  isNational = false;
  userID: any;

  displayedColumns: string[] = [
    'SNo',
    'FeedbackNature',
    'FeedbackNaturekDescription',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'FeedbackNature',
    'FeedbackNaturekDescription',
    'edit',
  ];

  feedbackNature: any = [];
  feedbackNatureDesc: any;

  constructor(
    private commonData: dataService,
    private _feedbackTypeService: FeedbackTypeService,
    private alertService: ConfirmationDialogsService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.userID = this.commonData.uid;
    this.getServiceLinesfromSearch(this.userID);
  }

  setIsNational(value: any) {
    this.isNational = value;
  }

  getStates(serviceID: any, isNational: any) {
    this._feedbackTypeService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => {
          console.log('states', response);
          this.search_state = '';
          this.states = response.data;
          this.feedbackTypes = [];
          this.natureTypes = [];
          this.filterednatureTypes.data = [];

          if (isNational) {
            this.findFeedbackTypes(this.states[0].providerServiceMapID);
          }
        },
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  getServiceLinesfromSearch(userID: any) {
    this._feedbackTypeService.getServiceLines(userID).subscribe(
      (response: any) => {
        console.log('services', response);
        this.servicelines = response.data.filter(function (item: any) {
          console.log('item', item);
          if (item.serviceID === 3 || item.serviceID === 1) return item;
        });
      },
      (err) => {
        console.log('Error', err);
        // this.alertService.alert(err, 'error');
      },
    );
  }

  findFeedbackTypes(providerServiceMapID: any) {
    this.search_feedbacktype = '';
    this.providerServiceMapID = providerServiceMapID;
    this._feedbackTypeService
      .getFeedbackTypes_nature({
        providerServiceMapID: this.providerServiceMapID,
      })
      .subscribe(
        (response: any) => {
          console.log('FeedbackTypes', response);
          this.feedbackTypes = response.data;
          this.natureTypes = [];
          this.filterednatureTypes.data = [];
        },
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  findFeedbackNature(feedbackTypeID: any) {
    this.feedbackTypeID = feedbackTypeID;
    const tempObj = {
      feedbackTypeID: this.feedbackTypeID,
    };
    this._feedbackTypeService.getFeedbackNatureTypes(tempObj).subscribe(
      (response: any) => {
        console.log('Feedback Nature Types', response);
        this.natureTypes = response.data;
        this.filterednatureTypes.data = response.data;
        this.showTable = true;
      },
      (err) => {
        console.log('Error', err);
        // this.alertService.alert(err, 'error');
      },
    );
  }

  editFeedbackNature(feedbackObj: any) {
    console.log('feedbackObj', feedbackObj);
    const dialog_Ref = this.dialog.open(EditFeedbackNatureModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        feedbackObj: feedbackObj,
        natureTypes: this.natureTypes,
      },
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.findFeedbackNature(this.feedbackTypeID);
      }
    });
  }

  clear() {
    this.searchCNForm.resetForm();
    console.log('state', this.search_state);
    console.log('serviceLine', this.search_serviceline);
    this.natureTypes = [];
    this.filterednatureTypes.data = [];
    this.showTable = false;
  }

  activeDeactivate(id: any, flag: any) {
    const obj = {
      feedbackNatureID: id,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('reqObj', obj);
            this._feedbackTypeService.deleteFeedbackNatureType(obj).subscribe(
              (res) => {
                this.alertService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.findFeedbackNature(this.feedbackTypeID);
              },
              (err) => {
                console.log('Error', err);
                // this.alertService.alert(err, 'error');
              },
            );
          }
        },
        (err) => {
          console.log('Error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  changeTableFlag(flag: any) {
    this.searchForm = flag;
  }
  changeTableFlag1(flag: any) {
    this.searchForm = flag;
    this.feedbackNature = undefined;
    this.feedbackNatureDesc = undefined;
  }

  validateFeedbackNature(feedbackNature: any) {
    // console.log("check",feedbackNature);
    this.natureExists = false;
    // this.searchFeedbackNatureArray = this.natureTypes.concat(this.objs);
    console.log('searchArray', this.searchFeedbackNatureArray);
    let count = 0;
    for (let i = 0; i < this.natureTypes.length; i++) {
      if (
        feedbackNature.toUpperCase() ===
        this.natureTypes[i].feedbackNature.toUpperCase()
      ) {
        // console.log("gotcha",feedbacknature,"exists");
        count++;
      }
      // console.log(i,"iterating");
    }
    if (count > 0) {
      // console.log("error found");

      this.natureExists = true;
    }
  }

  saveComplaintNature() {
    // console.log("dataObj", obj);
    const tempArr: any = [];
    for (let i = 0; i < this.objs.data.length; i++) {
      const tempObj: any = {
        feedbackNature:
          this.objs.data[i].feedbackNature !== undefined &&
          this.objs.data[i].feedbackNature !== null
            ? this.objs.data[i].feedbackNature.trim()
            : null,
        feedbackNatureDesc:
          this.objs.data[i].feedbackNatureDesc !== undefined &&
          this.objs.data[i].feedbackNatureDesc !== null
            ? this.objs.data[i].feedbackNatureDesc.trim()
            : null,
        feedbackTypeID: this.feedbackTypeID,
        createdBy: this.commonData.uname,
      };
      tempArr.push(tempObj);
    }

    console.log('reqObj', tempArr);
    this._feedbackTypeService.saveFeedbackNatureType(tempArr).subscribe(
      (res) => {
        console.log('response', res);
        this.searchForm = true;
        this.alertService.alert('Saved successfully', 'success');
        this.previous_state_id = this.search_state;
        this.previous_service_id = this.search_serviceline;
        this.previous_feedbacktype = this.search_feedbacktype;
        this.addForm.resetForm();
        this.objs.data = [];

        this.search_state = this.previous_state_id;
        this.search_serviceline = this.previous_service_id;
        this.search_feedbacktype = this.previous_feedbacktype;

        this.findFeedbackNature(this.feedbackTypeID);
      },
      (err) => {
        // this.alertService.alert(err, 'error');
      },
    );
  }

  add_obj(nature: any, desc: any) {
    const isDuplicate = this.objs.data.some(
      (obj) => obj.feedbackNature === nature,
    );
    if (!isDuplicate) {
      const tempObj = {
        feedbackNature: nature,
        feedbackNatureDesc: desc,
      };

      console.log(tempObj);
      this.validateFeedbackNature(nature);
      this.natureExists = false;
      console.log('this.feedbackNature', this.feedbackNature);
      this.objs.data = [...this.objs.data, tempObj];
    } else {
      this.alertService.alert('Nature already exists');
    }
  }

  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.changeTableFlag(true);

          this.objs.data = [];
          this.changeTableFlag(true);
        }
      });
  }
  checkDuplicates(tempObj: any) {
    let duplicateValue = 0;
    if (this.objs.data.length === 0) {
      this.objs.data.push(tempObj);
    } else {
      for (let i = 0; i < this.objs.data.length; i++) {
        if (this.objs.data[i].feedbackNature === tempObj.feedbackNature) {
          duplicateValue = duplicateValue + 1;
        }
      }
      if (duplicateValue === 0) {
        this.objs.data.push(tempObj);
      } else {
        this.alertService.alert('Already exists');
      }
    }
  }

  remove_obj(index: any) {
    const newData = [...this.objs.data];
    newData.splice(index, 1);
    this.objs.data = newData;
    this.cdr.detectChanges();
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filterednatureTypes.data = this.natureTypes;
    } else {
      this.filterednatureTypes.data = [];
      this.natureTypes.forEach((item: any) => {
        for (const key in item) {
          if (key === 'feedbackNature') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filterednatureTypes.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-edit-feedback-nature-modal',
  templateUrl: './edit-feedback-nature-dialog.html',
})
export class EditFeedbackNatureModalComponent implements OnInit {
  feedbackNature: any;
  feedbackNatureDesc: any;
  originalNature: any;
  searchFeedbackArray: any = [];
  natureExists = false;
  msg = 'Complaint nature already exists';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public _feedbackTypeService: FeedbackTypeService,
    public dialog_Ref: MatDialogRef<EditFeedbackNatureModalComponent>,
    private alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log('update this data', this.data);
    this.feedbackNature = this.data.feedbackObj.feedbackNature;
    this.originalNature = this.data.feedbackObj.feedbackNature;
    this.feedbackNatureDesc = this.data.feedbackObj.feedbackNatureDesc;
    this.searchFeedbackArray = this.data.natureTypes;
  }

  update() {
    const tempObj = {
      feedbackNatureID: this.data.feedbackObj.feedbackNatureID,
      feedbackNature:
        this.feedbackNature !== undefined && this.feedbackNature !== null
          ? this.feedbackNature.trim()
          : null,
      feedbackNatureDesc:
        this.feedbackNatureDesc !== undefined &&
        this.feedbackNatureDesc !== null
          ? this.feedbackNatureDesc.trim()
          : null,
      modifiedBy: this.data.feedbackObj.createdBy,
    };

    this._feedbackTypeService.editFeedbackNatureType(tempObj).subscribe(
      (res) => {
        this.dialog_Ref.close('success');
        // this.alertService.alert("Feedback Nature edited successfully");
      },
      (err) => {
        this.alertService.alert(err, 'error');
      },
    );
  }

  validateFeedback(feedbackNature: any) {
    console.log('check', feedbackNature);
    this.natureExists = false;
    console.log('searchArray', this.searchFeedbackArray);
    let count = 0;
    for (let i = 0; i < this.searchFeedbackArray.length; i++) {
      if (
        feedbackNature.toUpperCase() ===
          this.searchFeedbackArray[i].feedbackNature.toUpperCase() &&
        feedbackNature.toUpperCase() !== this.originalNature.toUpperCase()
      ) {
        // console.log("gotcha",feedbackNature,"exists");
        count++;
      }
      // console.log(i,"iterating");
    }
    if (count > 0) {
      // console.log("error found");
      this.natureExists = true;
    }
  }
}
