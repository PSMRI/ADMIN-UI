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
import {
  FormGroup,
  FormBuilder,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { WrapupTimeConfigurationService } from 'src/app/core/services/ProviderAdminServices/wrapup-time-configuration.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-wrapup-time-configuration',
  templateUrl: './wrapup-time-configuration.component.html',
  styleUrls: ['./wrapup-time-configuration.component.css'],
})
export class WrapupTimeConfigurationComponent implements OnInit {
  service: any;
  state: any;

  services: any = [];
  userID: any;
  states: any = [];
  activeRoles: any;
  providerServiceMapID: any;
  roleIDList: any = [];
  alertMessage: any;

  //Flags
  showRoles = false;
  disableInputField = false;

  wrapupTimeForm!: FormGroup;
  uncheck = false;
  disableState = false;
  displayedColumns = ['role', 'isWrapupTimeRequired', 'wrapUpTime', 'action'];

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(
    private dataService: dataService,
    private fb: FormBuilder,
    private wrapupTimeConfigurationService: WrapupTimeConfigurationService,
    private dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    //this.uncheck=false;
    this.userID = this.dataService.uid;
    this.getServiceLines();
    this.wrapupTimeForm = this.fb.group({
      timings: this.fb.array([]),
      // wrapUpTime:[null,[Validators.min(1), Validators.max(600)]]
    });
  }

  // getWrapUpTime(): AbstractControl[] | null {
  //   const wrapUpControl = this.wrapupTimeForm.get('timings');
  //   return wrapUpControl instanceof FormArray     ? wrapUpControl.controls
  //     : null;
  // }

  getWrapUpTime() {
    const wrapUpControl = this.wrapupTimeForm.get('timings');
    if (wrapUpControl instanceof FormArray) {
      this.dataSource.data = wrapUpControl.controls;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
    }
  }

  getTimingControl(index: number) {
    return (this.wrapupTimeForm.get('timings') as FormArray).at(index);
  }

  /*
   * Service line
   */
  getServiceLines() {
    this.wrapupTimeConfigurationService
      .getServiceLinesWrapup(this.userID)
      .subscribe(
        (response: any) => {
          if (response && response.data)
            // this.services = response.data;
            this.services = response.data.filter(function (item: any) {
              console.log('item', item);
              if (
                item.serviceID === 1 ||
                item.serviceID === 3 ||
                item.serviceID === 6
              )
                return item;
            });
        },
        (err) => {
          console.log('Error in fetching servicelines');
        },
      );
  }

  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.wrapupTimeConfigurationService.getStates(obj).subscribe(
      (response) => {
        this.getStatesSuccessHandeler(response, value.isNational);
      },
      (err) => {
        console.log('Error in fetching states');
      },
    );
  }
  getStatesSuccessHandeler(response: any, isNational: any) {
    this.state = '';
    if (response && response.data) {
      console.log(response, 'Provider States');
      this.states = response.data;
      // this.services_array = [];
      if (isNational) {
        this.state = '';
        this.getActiveRoles(this.states[0].providerServiceMapID);
      }
    }
  }
  getActiveRoles(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.wrapupTimeConfigurationService
      .getActiveRoles(providerServiceMapID)
      .subscribe((response: any) => {
        if (response && response.data) {
          response.data.map((obj: any) => {
            if (obj.isWrapUpTime === true && obj.WrapUpTime !== null) {
              obj.enableEdit = true;
              obj.disableInputField = true;
            } else {
              obj.enableEdit = false;
              obj.disableInputField = false;
            }
          });
          this.activeRoles = response.data;
          this.showRoles = true;
          this.createFormArray(response.data);
        }
      });
    (err: any) => {
      this.dialogService.alert(err.errorMessage, 'error');
    };
  }

  createFormArray(activeRoles: any) {
    const temp: any = this.wrapupTimeForm.controls['timings'] as FormArray;
    temp.reset();
    const tempLength = temp.length;
    if (tempLength > 0) {
      for (let i = 0; i <= tempLength; i++) {
        temp.removeAt(0);
      }
    }
    for (let i = 0; i < activeRoles.length; i++) {
      temp.push(this.createObject(activeRoles[i]));
    }
    const data: any = this.wrapupTimeForm.controls['timings'] as FormArray;
    this.getWrapUpTime();
  }

  createObject(obj: any): FormGroup {
    return this.fb.group({
      isWrapUpTime: obj.isWrapUpTime,
      wrapUpTime: obj.WrapUpTime,
      roleID: obj.roleID,
      roleName: obj.roleName,
      providerServiceMapID: obj.providerServiceMapID,
      modifiedBy: obj.createdBy,
      enableEdit: obj.enableEdit,
      uncheck: null,
      disableInputField: obj.disableInputField,
    });
  }

  givePrivilegeForWrapupTime(event: any, role: any) {
    const formArray: any = this.wrapupTimeForm.controls['timings'] as FormArray;
    this.dataSource.data = formArray;
    let index = null;
    for (let i = 0; i < formArray.length; i++) {
      const element = formArray.at(i);
      if (element.value.roleID === role.roleID) {
        index = i;
        break;
      }
    }
    if (event.checked) {
      role.isWrapUpTime = true;
      role.uncheck = false;
      // this.wrapupTimeForm.patchValue({
      //   uncheck: false
      // })
      if (index !== null)
        (<FormGroup>formArray.at(index)).controls['uncheck'].setValue(false);
    } else {
      role.isWrapUpTime = false;
      // this.wrapupTimeForm.patchValue({
      //   uncheck: true
      // })
      if (index !== null)
        (<FormGroup>formArray.at(index)).controls['uncheck'].setValue(true);
      role.uncheck = true;
      role.enableEdit = false;
      role.wrapUpTime = null;
      // this.wrapupTimeForm.patchValue({
      //   wrapUpTime: null
      // })
      if (index !== null)
        (<FormGroup>formArray.at(index)).controls['wrapUpTime'].setValue(null);
    }
  }
  editField(role: any) {
    this.activeRoles.map((obj: any) => {
      if (obj.roleID === role.roleID) {
        obj.disableInputField = false;
      }
    });
    this.createFormArray(this.activeRoles);
  }
  saveWrapupTime(role: any, value: any) {
    if (
      role.isWrapUpTime &&
      (role.wrapUpTime === undefined ||
        role.wrapUpTime === null ||
        (role.wrapUpTime !== undefined &&
          role.wrapUpTime !== null &&
          isNaN(role.wrapUpTime)) ||
        (role.isWrapUpTime !== undefined &&
          role.isWrapUpTime !== null &&
          role.isWrapUpTime === true &&
          role.wrapUpTime !== undefined &&
          role.wrapUpTime !== null &&
          Number(role.wrapUpTime) <= 0) ||
        Number(role.wrapUpTime) > 600)
    ) {
      this.dialogService.alert('Enter value inside range 1 to 600', 'info');
      this.wrapupTimeForm.patchValue({
        wrapUpTime: null,
      });
    } else {
      // if (role.enableEdit === true) {
      //   this.alertMessage = "Updated"
      // } else {
      //   this.alertMessage = "Saved"
      // }
      this.alertMessage = value;
      this.wrapupTimeConfigurationService
        .saveWrapUpTime(role)
        .subscribe((response) => {
          console.log(response, 'response');
          this.dialogService.alert(
            `${this.alertMessage} Successfully`,
            'success',
          );
          const formArray = this.wrapupTimeForm.controls[
            'timings'
          ] as FormArray;
          let index = null;
          for (let i = 0; i < formArray.length; i++) {
            const element = formArray.at(i);
            if (element.value.roleID === role.roleID) {
              index = i;
              break;
            }
          }
          if (index !== null)
            (<FormGroup>formArray.at(index)).controls['uncheck'].setValue(null);
          this.getActiveRoles(this.providerServiceMapID);
        });
    }
  }
  filterComponentList(searchTerm?: string) {
    const temp = this.wrapupTimeForm.controls['timings'] as FormArray;
    temp.reset();
    const tempLength = temp.length;
    if (tempLength > 0) {
      for (let i = 0; i <= tempLength; i++) {
        temp.removeAt(0);
      }
      this.getWrapUpTime();
    }
    if (!searchTerm) {
      for (let i = 0; i < this.activeRoles.length; i++) {
        temp.push(this.createObject(this.activeRoles[i]));
      }
      this.getWrapUpTime();
    } else {
      this.activeRoles.forEach((item: any) => {
        for (const key in item) {
          if (key === 'roleName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              temp.push(this.createObject(item));
              break;
            }
          }
        }
      });
      this.getWrapUpTime();
    }
  }
}
