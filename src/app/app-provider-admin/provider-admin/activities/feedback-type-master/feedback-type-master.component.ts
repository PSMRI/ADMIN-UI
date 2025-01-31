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
  AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { FeedbackTypeService } from '../services/feedback-type-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-feedback-type-master',
  templateUrl: './feedback-type-master.component.html',
  styleUrls: ['./feedback-type-master.component.css'],
})
export class FeedbackTypeMasterComponent implements OnInit, AfterViewInit {
  [x: string]: any;
  filteredfeedbackTypes = new MatTableDataSource<any>();
  objs = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  feedbackNameExist = false;
  userID: any;
  previous_state_id: any;
  previous_service_id: any;
  feedbackDesc: any;
  feedbackName: any;

  search_state: any;
  search_serviceline: any;
  searchForm = true;
  showTable = false;
  serviceProviderID: any;
  states: any = [];
  servicelines: any = [];
  feedbackTypes: any = [];
  providerServiceMapID: any;
  confirmMessage: any;
  // objs = [];
  @ViewChild('searchFTForm')
  searchFTForm!: NgForm;
  @ViewChild('addForm')
  addForm!: NgForm;
  @ViewChild('editForm')
  editForm!: NgForm;
  feedbackExists = false;
  isNational = false;
  searchFeedbackArray: any = [];
  msg = 'Feedback Name already exists';
  displayedColumns: string[] = [
    'SNo',
    'FeedbackName',
    'FeedbackDescription',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'FeedbackName',
    'FeedbackDescription',
    'edit',
  ];

  constructor(
    private commonData: dataService,
    private FeedbackTypeService: FeedbackTypeService,
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
    if (this.isNational === true) {
      this.search_state = undefined;
    }
  }
  ngAfterViewInit() {
    this.filteredfeedbackTypes.paginator = this.paginatorFirst;
  }

  getStates(serviceID: any, isNational: any) {
    this.FeedbackTypeService.getStates(
      this.userID,
      serviceID,
      isNational,
    ).subscribe(
      (response: any) => {
        console.log('states', response);
        this.search_state = '';
        this.states = response.data;
        this.feedbackTypes = [];
        this.filteredfeedbackTypes.data = [];

        if (isNational) {
          this.findFeedbackTypes(this.states[0].providerServiceMapID);
        }
      },
      (err) => {
        console.log('Error', err);
        this.alertService.alert(err, 'error');
      },
    );
  }

  getServiceLinesfromSearch(userID: any) {
    this.FeedbackTypeService.getServiceLines(userID).subscribe(
      (response: any) => {
        console.log('services', response);
        this.search_serviceline = '';
        // this.servicelines = response.data;
        this.servicelines = response.data.filter(function (item: any) {
          console.log('item', item);
          if (item.serviceID === 3 || item.serviceID === 1) return item;
        });
      },
      (err) => {
        console.log('Error', err);
        this.alertService.alert(err, 'error');
      },
    );
  }

  findFeedbackTypes(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.FeedbackTypeService.getFeedbackTypes({
      providerServiceMapID: this.providerServiceMapID,
    }).subscribe(
      (response: any) => {
        console.log('FeedbackTypes', response);
        this.feedbackTypes = response.data;
        this.filteredfeedbackTypes.data = response.data;
        this.showTable = true;
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  clear() {
    this.searchFTForm.resetForm();
    this.servicelines = [];
    console.log('state', this.search_state);
    console.log('serviceLine', this.search_serviceline);
    this.feedbackTypes = [];
    this.filteredfeedbackTypes.data = [];
    this.showTable = false;
  }

  editFeedback(feedbackObj: any) {
    console.log('feedbackObj', feedbackObj);
    const dialog_Ref = this.dialog.open(EditFeedbackModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        feedbackObj: feedbackObj,
        feedbackTypes: this.feedbackTypes,
        service: this.search_serviceline,
      },
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.findFeedbackTypes(this.providerServiceMapID);
      }
    });
  }

  activeDeactivate(id: any, flag: any) {
    const obj = {
      feedbackTypeID: id,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'confirm',
        'Are you sure want you to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            console.log('reqObj', obj);
            this.FeedbackTypeService.deleteFeedback(obj).subscribe(
              (res) => {
                this.alertService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.findFeedbackTypes(this.providerServiceMapID);
              },
              (err) => {
                this;
                console.log('Error', err);
              },
            );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.changeTableFlag(true);
        }
      });
  }

  changeTableFlag(flag: any) {
    this.searchForm = flag;
    if (flag === true) {
      this.objs.data = [];
    }
  }

  validateFeedback(feedback: any) {
    this.feedbackExists = false;
    this.searchFeedbackArray = this.feedbackTypes.concat(this.objs.data);
    console.log('searchArray', this.searchFeedbackArray);
    let count = 0;
    for (let i = 0; i < this.searchFeedbackArray.length; i++) {
      if (
        feedback.toUpperCase() ===
        this.searchFeedbackArray[i].feedbackTypeName.toUpperCase()
      ) {
        count++;
      }
    }
    if (count > 0) {
      this.feedbackExists = true;
    }
  }

  saveFeedback() {
    const tempArr: any = [];
    for (let i = 0; i < this.objs.data.length; i++) {
      const tempObj: any = {
        feedbackTypeName: this.objs.data[i].feedbackTypeName,
        feedbackDesc: this.objs.data[i].feedbackDesc,
        providerServiceMapID: this.providerServiceMapID,
        createdBy: 'Admin',
      };

      if (this.objs.data[i].feedbackTypeName === 'Generic Complaint') {
        tempObj['feedbackTypeCode'] = 'GC';
      } else if (this.objs.data[i].feedbackTypeName === 'Asha Complaints') {
        tempObj['feedbackTypeCode'] = 'AC';
      } else if (this.objs.data[i].feedbackTypeName === 'Epidemic Complaints') {
        tempObj['feedbackTypeCode'] = 'EC';
      } else if (
        this.objs.data[i].feedbackTypeName === 'Foodsafety Complaints'
      ) {
        tempObj['feedbackTypeCode'] = 'FC';
      }
      tempArr.push(tempObj);
    }
    ('FeedbackTypeCode');
    console.log('reqObj', tempArr);
    this.FeedbackTypeService.saveFeedback(tempArr).subscribe(
      (res) => {
        console.log('response', res);
        this.searchForm = true;
        this.alertService.alert('Saved successfully', 'success');
        this.previous_state_id = this.search_state;
        this.previous_service_id = this.search_serviceline;
        this.addForm.resetForm();
        this.objs.data = [];

        this.search_state = this.previous_state_id;
        this.search_serviceline = this.previous_service_id;

        this.findFeedbackTypes(this.providerServiceMapID);
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  add_obj(name: any, desc: any) {
    const tempObj = {
      feedbackTypeName: name,
      feedbackDesc: desc,
    };
    console.log(tempObj);
    if (this.objs.data.length === 0) {
      const isExist = this.feedbackTypes.some(
        (feedback: any) =>
          feedback.feedbackTypeName.toUpperCase() ===
          tempObj.feedbackTypeName.toUpperCase(),
      );

      if (!isExist) {
        this.objs.data = [...this.objs.data, tempObj];
        this.editForm.resetForm();
      } else {
        this.feedbackNameExist = true;
        this.alertService.alert('Already exists');
      }
    } else {
      const isExist =
        this.objs.data.some(
          (obj) =>
            obj.feedbackTypeName.toUpperCase() ===
            tempObj.feedbackTypeName.toUpperCase(),
        ) ||
        this.feedbackTypes.some(
          (feedback: any) =>
            feedback.feedbackTypeName.toUpperCase() ===
            tempObj.feedbackTypeName.toUpperCase(),
        );

      if (!isExist) {
        this.objs.data = [...this.objs.data, tempObj];
        this.editForm.resetForm();
      } else {
        this.feedbackNameExist = true;
        this.alertService.alert('Already exists');
      }
    }
  }
  checkExistance() {
    this.feedbackNameExist = false;
  }

  remove_obj(index: any) {
    const newData = [...this.objs.data];
    newData.splice(index, 1);
    this.objs.data = newData;
    this.cdr.detectChanges();
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredfeedbackTypes.data = this.feedbackTypes;
    } else {
      this.filteredfeedbackTypes.data = [];
      this.feedbackTypes.forEach((item: any) => {
        for (const key in item) {
          if (key === 'feedbackTypeName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredfeedbackTypes.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-edit-feedback-modal',
  templateUrl: './edit-feedback-type-dialog.html',
})
export class EditFeedbackModalComponent implements OnInit {
  feedbackName: any;
  feedbackDesc: any;
  originalName: any;
  searchFeedbackArray: any = [];
  feedbackExists = false;
  msg = 'Feedback Name already exists';

  service: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public FeedbackTypeService: FeedbackTypeService,
    public dialog_Ref: MatDialogRef<EditFeedbackModalComponent>,
    private alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log('update this data', this.data);
    this.feedbackName = this.data.feedbackObj.feedbackTypeName;
    this.originalName = this.data.feedbackObj.feedbackTypeName;
    this.feedbackDesc = this.data.feedbackObj.feedbackDesc;
    this.searchFeedbackArray = this.data.feedbackTypes;

    this.service = this.data.service;
  }

  update() {
    const tempObj: any = {
      feedbackTypeID: this.data.feedbackObj.feedbackTypeID,
      feedbackTypeName: this.feedbackName,
      feedbackDesc: this.feedbackDesc,
      modifiedBy: this.data.feedbackObj.createdBy,
    };
    if (this.feedbackName === 'Generic Complaint') {
      tempObj['FeedbackTypeCode'] = 'GC';
    } else if (this.feedbackName === 'Asha Complaints') {
      tempObj['FeedbackTypeCode'] = 'AC';
    } else if (this.feedbackName === 'Epidemic Complaints') {
      tempObj['FeedbackTypeCode'] = 'EC';
    } else if (this.feedbackName === 'Foodsafety Complaints') {
      tempObj['FeedbackTypeCode'] = 'FC';
    } else if (this.feedbackName === 'Bal Vivah Complaints') {
      tempObj['FeedbackTypeCode'] = 'BV';
    }

    this.FeedbackTypeService.editFeedback(tempObj).subscribe(
      (res) => {
        this.dialog_Ref.close('success');
        this.alertService.alert('Updated successfully', 'success');
      },
      (err) => {
        console.log('Error', err);
        this.alertService.alert(err, 'error');
      },
    );
  }

  validateFeedback(feedback: any) {
    console.log('check', feedback);
    this.feedbackExists = false;
    console.log('searchArray', this.searchFeedbackArray);
    let count = 0;
    for (let i = 0; i < this.searchFeedbackArray.length; i++) {
      if (
        feedback.toUpperCase() ===
          this.searchFeedbackArray[i].feedbackTypeName.toUpperCase() &&
        feedback.toUpperCase() !== this.originalName.toUpperCase()
      ) {
        count++;
      }
    }
    if (count > 0) {
      this.feedbackExists = true;
    }
  }
}
