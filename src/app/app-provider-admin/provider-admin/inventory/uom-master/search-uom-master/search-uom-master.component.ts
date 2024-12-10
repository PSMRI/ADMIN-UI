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
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { UomMasterService } from 'src/app/core/services/inventory-services/uom-master.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-search-uom-master',
  templateUrl: './search-uom-master.component.html',
  styleUrls: ['./search-uom-master.component.css'],
})
export class SearchUomMasterComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  uomMasterSearchForm!: FormGroup;
  providerID!: any;
  createdBy!: any;
  userID!: any;
  providerServiceMapID!: any;

  serviceLineList!: [any];
  stateList!: [any];
  UOMMasterList: any = [];
  // filteredUOMMasterList: any = [];
  filteredUOMMasterList = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  mode = 'view';

  constructor(
    private fb: FormBuilder,
    private uomMasterService: UomMasterService,
    private commonServices: CommonServices,
    private dialogService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.providerID = this.sessionstorage.getItem('service_providerID');
    this.createdBy = this.sessionstorage.getItem('uname');
    this.userID = this.sessionstorage.getItem('uid');

    this.uomMasterSearchForm = this.createUOMMasterSearchForm();
    this.subscribeToServiceLineChange();
    this.subscribeToStateChange();
    this.getServiceLine(this.userID);
  }

  ngOnDestroy() {
    if (this.serviceLineSubs) this.serviceLineSubs.unsubscribe();
  }
  ngAfterViewInit() {
    this.filteredUOMMasterList.paginator = this.paginator;
  }
  createUOMMasterSearchForm() {
    return this.fb.group({
      service: null,
      state: null,
    });
  }

  serviceLineSubs: any;
  getServiceLine(userID: string) {
    this.serviceLineSubs = this.commonServices
      .getServiceLines(userID)
      .subscribe(
        (response: any) => {
          this.serviceLineList = response.data.filter(function (item: any) {
            console.log('item', item);
            if (
              item.serviceID === 4 ||
              item.serviceID === 9 ||
              item.serviceID === 2
            )
              return item;
          });
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching serviceLines');
        },
      );
  }

  subscribeToServiceLineChange() {
    this.uomMasterSearchForm.controls['service'].valueChanges.subscribe(
      (value) => {
        if (value) {
          this.getState(this.userID, value);
        }
      },
    );
  }

  stateSubs: any;
  getState(userID: string, service: any) {
    this.stateSubs = this.commonServices
      .getStatesOnServices(userID, service.serviceID, false)
      .subscribe(
        (response: any) => {
          this.stateList = response.data;
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching states');
        },
      );
  }

  subscribeToStateChange() {
    this.uomMasterSearchForm.controls['state'].valueChanges.subscribe(
      (value) => {
        if (value && value.providerServiceMapID) {
          this.providerServiceMapID = value.providerServiceMapID;
          this.getUOMMaster(value.providerServiceMapID);
        }
      },
    );
  }

  uomSubs: any;
  getUOMMaster(providerServiceMapID: any) {
    this.uomSubs = this.uomMasterService
      .getAllUOMMaster(providerServiceMapID)
      .subscribe(
        (response: any) => {
          this.UOMMasterList = response.data;
          this.filteredUOMMasterList.data = response.data;
          this.filteredUOMMasterList.paginator = this.paginator;
          console.log('UOM', this.UOMMasterList);
        },
        (err) => {
          this.dialogService.alert(err, 'error');
          console.error('error in fetching uom masters');
        },
      );
  }

  filterUOMMasterList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredUOMMasterList.data = this.UOMMasterList.slice();
      this.filteredUOMMasterList = new MatTableDataSource<any>(
        this.filteredUOMMasterList.data,
      );
      this.filteredUOMMasterList.paginator = this.paginator;
    } else {
      this.filteredUOMMasterList.data = [];
      this.filteredUOMMasterList.paginator = this.paginator;
      this.UOMMasterList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'uOMCode' || key === 'uOMName' || key === 'uOMDesc') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              if (this.filteredUOMMasterList.data.indexOf(item) === -1)
                this.filteredUOMMasterList.data.push(item);
              this.filteredUOMMasterList = new MatTableDataSource<any>(
                this.filteredUOMMasterList.data,
              );
              this.filteredUOMMasterList.paginator = this.paginator;
            }
          }
        }
      });
    }
  }

  activateDeactivateUOM(uomID: any, flag: any) {
    let confirmMessage: any;
    if (flag) {
      confirmMessage = 'Block';
    } else {
      confirmMessage = 'Unblock';
    }
    this.dialogService
      .confirm('confirm', 'Are you sure you want to ' + confirmMessage + '?')
      .subscribe((res) => {
        if (res) {
          this.uomMasterService.toggleDeleted(uomID, flag).subscribe(
            (response) => {
              this.dialogService.alert(
                confirmMessage + 'ed successfully',
                'success',
              );
              this.getUOMMaster(this.providerServiceMapID);
            },
            (err) => {
              console.error('error in fetching uom masters');
              this.dialogService.alert(err, 'error');
            },
          );
        }
      });
  }

  otherDetails: any;
  switchToCreateMode() {
    this.otherDetails = Object.assign({}, this.uomMasterSearchForm.value, {
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.createdBy,
    });
    this.mode = 'create';
  }

  switchToViewMode() {
    this.mode = 'view';
    this.getUOMMaster(this.providerServiceMapID);
  }

  updateUOMValue: any;
  switchToUpdateMode(UOM: any) {
    this.updateUOMValue = Object.assign(
      {},
      { UOM },
      {
        providerServiceMapID: this.providerServiceMapID,
        createdBy: this.createdBy,
      },
    );
    this.mode = 'update';
  }

  trackByFn(index: any, item: any) {
    return item.uomID;
  }
}
