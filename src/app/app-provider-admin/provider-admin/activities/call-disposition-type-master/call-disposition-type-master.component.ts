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
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CallTypeSubtypeService } from 'src/app/app-provider-admin/provider-admin/activities/services/calltype-subtype-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

declare let jQuery: any;

@Component({
  selector: 'app-call-disposition-type-master',
  templateUrl: './call-disposition-type-master.component.html',
  styleUrls: ['./call-disposition-type-master.component.css'],
})
export class CallDispositionTypeMasterComponent
  implements OnInit, AfterViewInit
{
  [x: string]: any;

  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  filtereddata = new MatTableDataSource<any>();
  temporarySubtypeArray = new MatTableDataSource<any>();
  // filtereddata: any = [];
  note!: string;
  service_provider_id: any;
  providerServiceMapID: any;
  // ngmodels
  state: any;
  service: any;

  callType: any;
  callSubType: any;
  fitToBlock = false;
  fitForFollowup = false;
  maxRedial: any = undefined;

  // api related
  request_array: any;
  request_object: any;

  // temporarySubtypeArray: any = [];

  // arrays
  data: any;
  provider_states: any = [];
  provider_services: any = [];

  // flags
  showTable: boolean;
  showForm: boolean;
  showCallType = false;
  tempCorrespondingSubCallType: any = [];
  subCallTypeExist = false;
  userID: any;
  nationalFlag: any;
  disableSelect = false;

  isInbound = false;
  isOutbound = false;
  displayedColumns: string[] = [
    'SNo',
    'CallType',
    'CallSubType',
    'Inbound',
    'Outbound',
    'MaxRedial',
    'BlockingRequired',
    'FollowupRequired',
    'edit',
    'action',
  ];
  displayedColumnsTable2: string[] = [
    'SNo',
    'CallGroupType',
    'callType',
    'Block',
    'Followup',
    'Inbound',
    'Outbound',
    'action',
  ];

  @ViewChild('callTypeSubCallType')
  callTypeSubCallType!: NgForm;

  constructor(
    public callTypeSubtypeService: CallTypeSubtypeService,
    private alertService: ConfirmationDialogsService,
    public commonDataService: dataService,
    public dialog: MatDialog,
    private cdr: ChangeDetectorRef,
  ) {
    this.data = [];
    this.service_provider_id = this.commonDataService.providerServiceMapID_104;
    // this.providerServiceMapID = this.service_provider_id;

    this.showTable = false;
    this.showForm = false;
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;

    this.callTypeSubtypeService.getServiceLinesNew(this.userID).subscribe(
      (response: any) => this.successhandeler(response),
      (err) => {
        console.log('error', err);
        // this.alertService.alert(err, 'error');
      },
    );
    this.request_array = [];
    this.request_object = {
      callGroupType: '',
      callType1: [],
      createdBy: this.commonDataService.uname,
    };
  }

  // data getters and setters for the component
  // getServices(stateID) {
  // 	this.showTable = false;
  // 	this.callTypeSubtypeService.getServices(this.service_provider_id, stateID).subscribe(response => this.getServicesSuccessHandeler(response));
  // } //commented on 11/4/18(1097 regarding changes) Gursimran

  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.callTypeSubtypeService.getStatesNew(obj).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response, value),
      (err) => {
        console.log('error', err);
        // this.alertService.alert(err, 'error');
      },
    );
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.get_calltype_subtype_history();
  }

  hideTable(flag: any) {
    this.disableSelect = flag;
    this.showTable = !flag;
    this.showForm = flag;
    // if (flag) {
    // 	jQuery("#addingSubTypes").trigger("reset");
    // 	;
    // }
    this.callType = '';
    this.callSubType = '';
    this.subCallTypeExist = false;
    this.temporarySubtypeArray.data = [];
    this.temporarySubtypeArray.paginator = this.paginatorSecond;
  }

  ngAfterViewInit() {
    this.filtereddata.paginator = this.paginatorFirst;
    this.temporarySubtypeArray.paginator = this.paginatorSecond;
  }

  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.hideTable(false);
          this.reset();
          this.callType = '';
          this.request_array = [];
        }
      });
  }

  hideForm() {
    this.showTable = true;
    this.showForm = false;
  }

  reset() {
    this.callSubType = '';
    this.temporarySubtypeArray.data = [];
    this.temporarySubtypeArray.paginator = this.paginatorSecond;
    this.fitToBlock = false;
    this.fitForFollowup = false;
    this.isInbound = false;
    this.isOutbound = false;
    this.maxRedial = undefined;
  }

  setIsInbound(ev: any) {
    console.log(ev, 'INBOUND CHECKBOX');
    this.isInbound = ev.checked;
  }

  setIsOutbound(ev: any) {
    console.log(ev, 'OUTBOUND CHECKBOX');
    this.note = '(* This functionality is only applicable for 104 )';
    this.isOutbound = ev.checked;
    if (!ev.checked) {
      this.maxRedial = undefined;
    }
  }

  pushCallSubType(
    callType: any,
    call_subtype: any,
    fitToBlock: any,
    fitForFollowup: any,
  ) {
    if (
      this.isInbound === false &&
      this.isOutbound === false &&
      this.service.serviceID !== 6
    ) {
      this.alertService.alert('Select checkbox Inbound/Outbound/Both');
      this.fitToBlock = false;
      this.fitForFollowup = false;
      this.isInbound = false;
      this.isOutbound = false;
    } else {
      if (
        call_subtype !== undefined &&
        call_subtype !== null &&
        call_subtype.trim().length > 0
      ) {
        const obj: any = {
          callGroupType: callType,
          callType: call_subtype,
          providerServiceMapID: this.providerServiceMapID,
          callTypeDesc: call_subtype,
          fitToBlock: fitToBlock,
          fitForFollowup: fitForFollowup,
          isInbound: this.isInbound,
          isOutbound: this.isOutbound,
          maxRedial: this.maxRedial,
          createdBy: this.commonDataService.uname,
        };
        console.log('dummy obj', obj);
        this.temporarySubtypeArray.data = [
          ...this.temporarySubtypeArray.data,
          obj,
        ];
        this.callSubType = '';
        this.fitToBlock = false;
        this.fitForFollowup = false;
        this.isInbound = false;
        this.isOutbound = false;
        this.maxRedial = undefined;
      }
    }
  }

  // removeFromCallSubType(index) {
  //   this.temporarySubtypeArray.splice(index, 1);
  //   console.log(this.temporarySubtypeArray);
  // }
  removeObj(index: any) {
    const newData = [...this.temporarySubtypeArray.data];
    newData.splice(index, 1);
    this.temporarySubtypeArray.data = newData;
    this.cdr.detectChanges();
  }
  save() {
    this.callTypeSubtypeService
      .saveCallTypeSubtype(this.temporarySubtypeArray.data)
      .subscribe(
        (response: any) => this.saveCallTypeSubTypeSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }

  // CRUD
  get_calltype_subtype_history() {
    this.showTable = true;
    this.callTypeSubtypeService
      .getCallTypeSubType(this.providerServiceMapID)
      .subscribe(
        (response: any) => this.getCallTypeSubTypeSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          // this.alertService.alert(err, 'error');
        },
      );
  }
  dataWithoutWrapUp: any = [];
  getCallTypeSubTypeSuccessHandeler(response: any) {
    console.log('PARTH', response);
    this.dataWithoutWrapUp = [];
    console.log('call type subtype history', response);
    this.data = response.data;
    this.filtereddata.data = response.data;
    console.log('this.filtereddata.data', this.filtereddata.data);
    this.filtereddata.paginator = this.paginatorFirst;
    console.log('this.data', this.data);

    this.data.forEach((element: { callGroupType: string }) => {
      console.log('element', element);

      if (element.callGroupType !== 'Wrapup Exceeds') {
        // this.data = [];
        this.dataWithoutWrapUp.push(element);
      }
    });
    this.data = this.dataWithoutWrapUp;
    this.filtereddata.data = this.dataWithoutWrapUp;
    console.log('after this.data', this.data);
  }

  // successhandelers

  // getStatesSuccessHandeler(response) {
  // 	this.provider_states = response;
  // }  //commented on 11/4/18(1097 regarding changes) Gursimran

  successhandeler(response: any) {
    this.service = '';
    this.provider_services = response.data.filter(function (obj: any) {
      return (
        obj.serviceID === 1 ||
        obj.serviceID === 3 ||
        obj.serviceID === 6 ||
        obj.serviceID === 10
      );
    });

    if (this.provider_services.length === 0) {
      this.alertService.alert('No servicelines mapped');
    }
  }
  // getServicesSuccessHandeler(response) {

  // 	this.service = "";
  // 	this.provider_services = response.filter(function (obj) {
  // 		return obj.serviceID == 1 || obj.serviceID == 3;
  // 	});

  // 	if (this.provider_services.length == 0) {
  // 		this.alertService.alert("104 & 1097 are not working in this state");
  // 	}
  // } //commented on 11/4/18(1097 regarding changes) Gursimran

  getStatesSuccessHandeler(response: any, value: any) {
    this.provider_states = response.data;
    console.log('UNKNWON', response.data);
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(response.data[0].providerServiceMapID);
    } else {
      this.nationalFlag = value.isNational;
      this.showTable = false;
    }
  }

  saveCallTypeSubTypeSuccessHandeler(response: any) {
    console.log(response.data, 'save call type sub type success');
    this.alertService.alert('Saved successfully', 'success');
    this.hideTable(false); // going back to table view

    // resetting the ngmodels
    this.reset();
    this.callType = '';
    this.request_array = [];

    this.get_calltype_subtype_history(); // refreshing the table contents
  }

  callTypeSelected(callType: any) {
    this.tempCorrespondingSubCallType = [];
    this.callSubType = '';
    this.showCallType = true;
    this.tempCorrespondingSubCallType = this.data.filter(function (obj: any) {
      return obj.callGroupType === callType;
    });
    console.log(this.data);
    console.log(this.tempCorrespondingSubCallType);
  }
  callSubTypes(value: any) {
    let a = false;
    const b = false;
    for (let i = 0; i < this.tempCorrespondingSubCallType.length; i++) {
      if (
        value !== undefined &&
        value !== null &&
        value.trim().toLowerCase() ===
          this.tempCorrespondingSubCallType[i].callType.toLowerCase()
      ) {
        this.subCallTypeExist = true;
        a = true;
        break;
      } else {
        a = false;
      }
    }
    // for (var i = 0; i < this.temporarySubtypeArray.length; i++) {
    //   if (value.trim().toLowerCase() == this.temporarySubtypeArray[i].callType.toLowerCase()) {
    //     this.subCallTypeExist = true;
    //     b = true;
    //     break;
    //   }
    //   else {
    //     b = false;
    //   }
    // }
    if (a === false) {
      this.subCallTypeExist = false;
    }
  }
  fitToBlocks(flag: any) {
    if (flag) {
      this.fitForFollowup = false;
    }
  }
  fitForFollowups(flag: any) {
    if (flag) {
      this.fitToBlock = false;
    }
  }
  deleteSubCallType(callTypeID: any, flag: any) {
    if (flag === true) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Deactivate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              callTypeID: callTypeID,
              deleted: flag,
            };
            console.log(obj);
            this.callTypeSubtypeService
              .deleteSubCallType(obj)
              .subscribe((res) => this.deletedSuccess(res, 'Deactivated'));
          }
        });
    }
    if (flag === false) {
      this.alertService
        .confirm('confirm', 'Are you sure you want to Activate?')
        .subscribe((response) => {
          if (response) {
            const obj = {
              callTypeID: callTypeID,
              deleted: flag,
            };
            console.log(obj);
            this.callTypeSubtypeService
              .deleteSubCallType(obj)
              .subscribe((res) => this.deletedSuccess(res, 'Activated'));
          }
        });
    }
  }
  deletedSuccess(res: any, action: any) {
    if (res) {
      this.alertService.alert(action + ' successfully', 'success');
      this.get_calltype_subtype_history();
      console.log(res);
    }
  }

  editCallDisposition(obj: any) {
    obj['service'] = this.service.serviceID;
    const dialogReff = this.dialog.open(EditCallTypeComponent, {
      // height: '500px',
      width: '700px',
      disableClose: true,
      data: obj,
    });
    dialogReff.afterClosed().subscribe(() => {
      this.get_calltype_subtype_history();
    });
    // this.disableSelect = true;
    // this.showTable = false;
    // this.showForm = true;
    // this.subCallTypeExist = false;
    // this.callType = obj.callGroupType;
    // this.callSubType = obj.callType;
    // this.fitToBlock = obj.fitToBlock;
    // this.fitForFollowup = obj.fitForFollowup;
  }
  clear() {
    this.provider_services = [];
    this.data = [];
    this.filtereddata.data = [];
    this.showTable = false;
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
    } else {
      this.filtereddata.data = [];
      this.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'callGroupType' || key === 'callType') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filtereddata.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}
@Component({
  selector: 'app-edit-call-type',
  templateUrl: './edit-call-type-model.html',
})
export class EditCallTypeComponent implements OnInit {
  note!: string;
  callType: any;
  callSubType: any;
  fitToBlock!: boolean;
  fitForFollowup!: boolean;
  service: any;

  providerServiceMapID: any;
  existingName: any;
  subCallTypeExist = false;

  isInbound!: boolean;
  isOutbound!: boolean;
  maxRedial: any;
  fitToBlock_y = false;
  fitToBlock_n = false;
  fitForFollowup_y = false;
  fitForFollowup_n = false;
  tableData: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public callTypeSubtypeService: CallTypeSubtypeService,
    public commonDataService: dataService,
    public dialogReff: MatDialogRef<EditCallTypeComponent>,
    private alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log('edit data', this.data);
    this.service = this.data.service;
    this.callType = this.data.callGroupType;
    this.callSubType = this.data.callType;
    this.fitToBlock = this.data.fitToBlock;
    this.fitForFollowup = this.data.fitForFollowup;
    this.providerServiceMapID = this.data.providerServiceMapID;
    this.existingName = this.data.callType;
    this.isInbound = this.data.isInbound;
    this.isOutbound = this.data.isOutbound;
    if (this.data.maxRedial !== undefined) {
      this.maxRedial = this.data.maxRedial.toString();
    }

    this.get_calltype_subtype_history();
  }

  setIsInbound(ev: any) {
    console.log(ev, 'INBOUND CHECKBOX');
    this.isInbound = ev.checked;
  }

  setIsOutbound(ev: any) {
    console.log(ev, 'OUTBOUND CHECKBOX');
    this.note = '(* This functionality is only applicable for 104 )';
    this.isOutbound = ev.checked;
    if (!ev.checked) {
      this.maxRedial = undefined;
    }
  }

  CTS(callType: any) {
    this.tempCorrespondingSubCallType = [];
    this.tempCorrespondingSubCallType = this.tableData.filter(function (
      obj: any,
    ) {
      return obj.callGroupType === callType;
    });

    console.log(this.tempCorrespondingSubCallType, 'array to check dupes from');
  }

  get_calltype_subtype_history() {
    this.callTypeSubtypeService
      .getCallTypeSubType(this.providerServiceMapID)
      .subscribe(
        (response: any) => this.getCallTypeSubTypeSuccessHandeler(response),
        (err) => {
          console.log('error', err);

          // this.alertService.alert(err, 'error');
        },
      );
  }

  getCallTypeSubTypeSuccessHandeler(response: any) {
    console.log('call type subtype history', response);
    this.tableData = response.data;
    console.log(this.tableData);

    this.CTS(this.data.callGroupType);
  }

  fitToBlocks(flag: any) {
    if (flag) {
      this.fitForFollowup = false;
    }
  }
  fitForFollowups(flag: any) {
    if (flag) {
      this.fitToBlock = false;
    }
  }

  /**/
  tempCorrespondingSubCallType: any = [];
  callTypeSelected(callType: any) {
    this.tempCorrespondingSubCallType = [];
    this.callSubType = '';
    this.tempCorrespondingSubCallType = this.tableData.filter(function (
      obj: any,
    ) {
      return obj.callGroupType === callType;
    });

    console.log(this.tempCorrespondingSubCallType, 'array to check dupes from');
  }

  validateCallSubtype(value: any) {
    let a = false;
    const b = false;
    for (let i = 0; i < this.tempCorrespondingSubCallType.length; i++) {
      if (
        value !== undefined &&
        value !== null &&
        value.trim().toLowerCase() ===
          this.tempCorrespondingSubCallType[i].callType.toLowerCase()
      ) {
        this.subCallTypeExist = true;
        a = true;
        break;
      } else {
        a = false;
      }
    }
    // for(var i=0; i<this.temporarySubtypeArray.length; i++) {
    // 	if(value.trim().toLowerCase() == this.temporarySubtypeArray[i].callType.toLowerCase()) {
    // 		this.subCallTypeExist = true;
    // 		b = true;
    // 		break;
    // 	}
    // 	else {
    // 		b = false;
    // 	}
    // }
    if (a === false) {
      this.subCallTypeExist = false;
    }
    if (value !== undefined && value !== null && value.trim().length === 0) {
      this.subCallTypeExist = true;
    }
    if (
      value !== undefined &&
      value !== null &&
      value.trim().toLowerCase() === this.existingName.toLowerCase()
    ) {
      this.subCallTypeExist = false;
    }
  }

  /**/

  modify(value: any) {
    console.log('values to be updated', value);
    if (this.isInbound === false && this.isOutbound === false) {
      this.alertService.alert('Select checkbox Inbound/Outbound/Both');
    } else {
      const object = {
        callTypeID: this.data.callTypeID,
        callGroupType: this.data.callGroupType,
        callType: this.data.callType,
        providerServiceMapID: this.data.providerServiceMapID,
        callTypeDesc: this.data.callTypeDesc,
        fitToBlock: value.fitToBlock,
        fitForFollowup: value.fitForFollowup,
        isInbound: this.isInbound,
        isOutbound: this.isOutbound,
        maxRedial: this.maxRedial,
        createdBy: this.commonDataService.uname,
      };
      this.callTypeSubtypeService
        .modificallType(object)
        .subscribe((response: any) => this.modifySuccess(response));
    }
  }

  modifySuccess(res: any) {
    if (res) {
      this.alertService.alert('Updated successfully', 'success');
      this.dialogReff.close();
    }
  }
}
