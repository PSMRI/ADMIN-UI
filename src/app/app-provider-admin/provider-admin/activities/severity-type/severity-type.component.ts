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
  Inject,
  ViewChild,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SeverityTypeService } from 'src/app/core/services/ProviderAdminServices/severity-type-service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NgForm } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-severity-type',
  templateUrl: './severity-type.component.html',
  styleUrls: ['./severity-type.component.css'],
})
export class SeverityTypeComponent implements OnInit, AfterViewInit {
  [x: string]: any;

  displayedColumns: string[] = [
    'SNo',
    'Severity',
    'SeverityDescription',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = [
    'SNo',
    'Severity',
    'SeverityDescription',
    'edit',
  ];

  // filtereddata: any = [];
  states: any = [];
  stateId: any;
  serviceProviderID: any;
  service: any;
  services: any = [];
  firstPage = true;
  description: any;
  severity: any;
  data: any = [];
  searchArray: any = [];
  search = false;
  alreadyExist = false;
  providerServiceMapID: any;
  showTable = false;
  userID: any;
  isNational: any;
  providerServiceMapID_1097: any;
  // severityArray: any = [];
  createdBy: any;
  filtereddata = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild('paginatorFirst') paginatorFirst!: MatPaginator;
  @ViewChild('paginatorSecond') paginatorSecond!: MatPaginator;
  severityArray = new MatTableDataSource<any>();
  @ViewChild('severityAdding')
  severityAdding!: NgForm;
  constructor(
    public commonDataService: dataService,
    public severityTypeService: SeverityTypeService,
    public dialog: MatDialog,
    private alertService: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage
      .getItem('service_providerID')
      ?.toString();
    this.userID = this.commonDataService.uid;
    this.createdBy = this.commonDataService.uname;

    this.getProviderServices();
  }

  getProviderServices() {
    this.severityTypeService.getServices(this.userID).subscribe(
      (response: any) => {
        console.log('success while getting services', response);
        // this.services = response.data;
        this.services = response.data.filter(function (item: any) {
          console.log('item', item);
          if (item.serviceID === 3 || item.serviceID === 1) return item;
        });
      },
      (err) => {
        console.log('err while getting services', err);
      },
    );
  }
  ngAfterViewInit() {
    this.filtereddata.paginator = this.paginatorFirst;
  }

  getProviderStates(serviceID: any, isNational: any) {
    this.severityTypeService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => {
          console.log('success while getting states', response.data);
          this.stateId = undefined;
          this.states = response.data;
          this.setIsNational(isNational);
        },
        (err) => {
          console.log('err while getting states', err);
        },
      );
  }

  // getServices(state) {
  //   this.search = false;
  //   this.service = "";
  //   this.ProviderAdminRoleService.getServices(this.serviceProviderID, state)
  // .subscribe(response => this.servicesSuccesshandeler(response));
  // }

  setIsNational(value: any) {
    this.isNational = value;

    if (value) {
      this.providerServiceMapID_1097 = this.states[0].providerServiceMapID;
      this.findSeverity(this.providerServiceMapID_1097);
    }
  }

  // servicesSuccesshandeler(response) {
  //   console.log(response);
  //   this.services = response.filter(function (obj) {
  //     // return obj.serviceName == 104 || obj.serviceName == 1097 || obj.serviceName == "MCTS"
  //     return obj.serviceName == 104 || obj.serviceName == 1097
  //   });
  // }

  findSeverity(psmID: any) {
    console.log(psmID);
    this.data = [];
    this.filtereddata.data = [];
    this.providerServiceMapID = psmID;
    this.search = true;
    this.severityTypeService.getSeverity(this.providerServiceMapID).subscribe(
      (response: any) => this.getSeveritysuccesshandler(response),
      (err) => {
        console.log('Error', err);
        //this.dialogService.alert(err, 'error')
      },
    );
  }

  getSeveritysuccesshandler(response: any) {
    this.data = response.data;
    this.filtereddata.data = response.data;
  }

  showAddScreen() {
    this.handlingFlag(false);
  }

  addSeverity(severity: any) {
    this.alreadyExist = false;
    // this.searchArray = this.data.concat(this.severityArray);
    console.log('searchArray', this.searchArray);
    let count = 0;
    for (let i = 0; i < this.data.length; i++) {
      if (
        this.data[i].severityTypeName.toLowerCase() === severity.toLowerCase()
      ) {
        count++;
      }
    }
    if (count > 0) {
      this.alreadyExist = true;
    }
  }

  add(values: any) {
    // Trim leading and trailing whitespace from the severity type name
    const newSeverityTypeName = values.severity.trim();

    // Check if the severity type name is empty
    if (!newSeverityTypeName) {
      this.alertService.alert('Severity type name cannot be empty.');
      return; // Exit the function early if the severity type name is empty
    }

    // Check for duplicates
    const isDuplicate = this.severityArray.data.some(
      (item) =>
        item.severityTypeName.trim().toLowerCase() ===
        newSeverityTypeName.toLowerCase(),
    );

    if (isDuplicate) {
      this.alertService.alert('Severity type name already exists.');
      return; // Exit the function if a duplicate is found
    }

    // Create a new object for the severity type
    const newObj = {
      severityTypeName: newSeverityTypeName,
      severityDesc: values.description,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
    };

    // Add the new object to the severityArray
    this.severityArray.data = [...this.severityArray.data, newObj];

    // Reset the form
    this.severityAdding.resetForm();
  }

  handlingFlag(flag: any) {
    this.firstPage = flag;

    if (flag) {
      this.severity = '';
      this.description = '';
      this.severityArray.data = [];
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
          this.handlingFlag(true);
        }
      });
  }
  removeObj(index: any) {
    const newData = [...this.severityArray.data];
    newData.splice(index, 1);
    this.severityArray.data = newData;
    this.cdr.detectChanges();
  }
  finalSubmit() {
    this.severityTypeService.addSeverity(this.severityArray.data).subscribe(
      (response) => this.createdSuccessHandler(response),
      (err) => {
        console.log('Error', err);
        //this.dialogService.alert(err, 'error')
      },
    );
  }
  createdSuccessHandler(res: any) {
    // alert("severity added successfully");
    this.alertService.alert('Saved successfully', 'success');
    this.handlingFlag(true);
    this.findSeverity(this.providerServiceMapID);
    this.severityArray.data = [];
    this.severity = '';
    this.description = '';
  }
  //severityID
  confirmMessage: any;
  deleteSeverity(id: any, flag: any) {
    const obj = {
      severityID: id,
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
            this.severityTypeService
              .deleteSeverity(obj)
              .subscribe((response) => this.deleteSuccessHandler(response));
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  deleteSuccessHandler(res: any) {
    // alert("deleted successfully");
    this.severityTypeService.getSeverity(this.providerServiceMapID).subscribe(
      (response) => this.getSeveritysuccesshandler(response),
      (err) => {
        console.log('Error', err);
        //this.dialogService.alert(err, 'error')
      },
    );

    this.alertService.alert(this.confirmMessage + 'd successfully', 'success');
  }
  editSeverity(obj: any) {
    const dialogReff = this.dialog.open(EditSeverityModalComponent, {
      width: '500px',
      disableClose: true,
      data: {
        severityObj: obj,
        searchArray: this.data,
      },
    });
    //     dialogReff.afterClosed().subscribe(()=>{
    //     this.severityTypeService.getSeverity(this.providerServiceMapID).subscribe(response=>this.getSeveritysuccesshandler(response));
    // });

    dialogReff.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.alertService.alert('Updated successfully', 'success');
        this.severityTypeService
          .getSeverity(this.providerServiceMapID)
          .subscribe(
            (response) => this.getSeveritysuccesshandler(response),
            (err) => {
              console.log('Error', err);
              //this.dialogService.alert(err, 'error')
            },
          );
      }
    });
  }
  clear() {
    this.data = [];
    this.services = [];
    this.search = false;
    this.filtereddata.data = [];
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filtereddata.data = this.data;
      this.filtereddata.paginator = this.paginatorFirst;
    } else {
      this.filtereddata.data = [];
      this.data.forEach((item: any) => {
        for (const key in item) {
          if (key === 'severityTypeName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filtereddata.data.push(item);
              break;
            }
          }
        }
      });
      this.filtereddata.paginator = this.paginatorFirst;
    }
  }
}

@Component({
  selector: 'app-edit-severity-component',
  templateUrl: './edit-severity-component-modal.html',
})
export class EditSeverityModalComponent implements OnInit {
  severity: any;
  originalSeverity: any;
  description: any;
  alreadyExist = false;
  searchArray: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public severityTypeService: SeverityTypeService,
    public alertService: ConfirmationDialogsService,
    public dialogReff: MatDialogRef<EditSeverityModalComponent>,
  ) {}
  ngOnInit() {
    this.originalSeverity = this.data.severityObj.severityTypeName;
    this.severity = this.data.severityObj.severityTypeName;
    this.description = this.data.severityObj.severityDesc;
    this.searchArray = this.data.searchArray;
  }
  modify(value: any) {
    const object = {
      severityID: this.data.severityObj.severityID,
      severityTypeName: value.severity,
      severityDesc: value.description,
    };
    this.severityTypeService.modifySeverity(object).subscribe(
      (response) => this.modifiedSuccessHandler(response),
      (err) => {
        console.log('error', err);
        //this.alertService.alert(err, 'error')});
      },
    );
  }
  addSeverity(value: any) {
    this.alreadyExist = false;
    console.log('searchArray', this.searchArray);
    let count = 0;
    for (let i = 0; i < this.searchArray.length; i++) {
      if (
        this.searchArray[i].severityTypeName.toLowerCase() ===
          value.toLowerCase() &&
        value.toLowerCase() !== this.originalSeverity.toLowerCase()
      ) {
        count++;
      }
    }
    if (count > 0) {
      this.alreadyExist = true;
    }
  }
  modifiedSuccessHandler(res: any) {
    this.dialogReff.close('success');
  }
}
