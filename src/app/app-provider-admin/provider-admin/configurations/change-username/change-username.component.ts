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
import { Component, OnInit } from '@angular/core';
import { ChangeUsernameService } from 'src/app/core/services/ProviderAdminServices/change-username.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-change-username',
  templateUrl: './change-username.component.html',
  styleUrls: ['./change-username.component.css'],
})
export class ChangeUsernameComponent implements OnInit {
  serviceProviderID: any;
  user: any;
  newUserName = '';

  currentEmployeeId = '';
  newEmployeeId = '';

  userNamesList: any = [];

  updateContactFields = true;

  renameResult: any = null;
  submitting = false;

  userNameTaken = false;
  employeeIdTaken = false;

  readonly maxUserNameLength = 20;
  readonly maxContactLength = 12;
  readonly maxEmployeeIdLength = 20;

  constructor(
    private changeUsernameService: ChangeUsernameService,
    private alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getUserList();
  }

  getUserList() {
    this.changeUsernameService.getUserList(this.serviceProviderID).subscribe(
      (response: any) => {
        this.userNamesList = response.data;
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  onSelectionChange() {
    this.renameResult = null;
  }

  onUserChange() {
    this.onSelectionChange();
    this.currentEmployeeId = '';
    this.newUserName = '';
    this.newEmployeeId = '';
    this.userNameTaken = false;
    this.employeeIdTaken = false;
    if (!this.user) {
      return;
    }
    this.changeUsernameService.getUserDetail(this.user.userName).subscribe(
      (response: any) => {
        this.currentEmployeeId = response.data?.employeeID || '';
      },
      (err: any) => this.alertService.alert(err.errorMessage, 'error'),
    );
  }

  checkUserNameAvailability() {
    this.onSelectionChange();
    this.userNameTaken = false;
    const newUserName = (this.newUserName || '').trim();
    if (!this.user || !newUserName || newUserName === this.user.userName) {
      return;
    }
    this.changeUsernameService.checkUserAvailability(newUserName).subscribe(
      (response: any) => {
        this.userNameTaken = response.data?.response === 'userexist';
      },
      (err: any) => console.log('error', err),
    );
  }

  checkEmployeeIdAvailability() {
    this.onSelectionChange();
    this.employeeIdTaken = false;
    const newEmployeeId = (this.newEmployeeId || '').trim();
    if (!newEmployeeId || newEmployeeId === this.currentEmployeeId) {
      return;
    }
    this.changeUsernameService.checkEmpIdAvailability(newEmployeeId).subscribe(
      (response: any) => {
        this.employeeIdTaken = response.data?.response === 'true';
      },
      (err: any) => console.log('error', err),
    );
  }

  get effectiveMaxLength(): number {
    return this.updateContactFields
      ? this.maxContactLength
      : this.maxUserNameLength;
  }

  get validationMessage(): string | null {
    if (!this.user) {
      return 'Select a user';
    }
    const newUserName = (this.newUserName || '').trim();
    const newEmployeeId = (this.newEmployeeId || '').trim();

    const userNameChanged = !!newUserName && newUserName !== this.user.userName;
    const employeeIdChanged =
      !!newEmployeeId && newEmployeeId !== this.currentEmployeeId;

    if (!userNameChanged && !employeeIdChanged) {
      return 'Enter a new username or a new employee ID';
    }
    if (userNameChanged) {
      if (newUserName.length > this.effectiveMaxLength) {
        return this.updateContactFields
          ? `Maximum ${this.maxContactLength} characters while contact numbers are being updated`
          : `Maximum ${this.maxUserNameLength} characters`;
      }
      if (this.userNameTaken) {
        return `Username ${newUserName} is already in use`;
      }
    }
    if (employeeIdChanged) {
      if (newEmployeeId.length > this.maxEmployeeIdLength) {
        return `Employee ID: maximum ${this.maxEmployeeIdLength} characters`;
      }
      if (this.employeeIdTaken) {
        return `Employee ID ${newEmployeeId} is already in use`;
      }
    }
    return null;
  }

  get canSubmit(): boolean {
    return this.validationMessage === null && !this.submitting;
  }

  private buildRequest() {
    const newUserName = (this.newUserName || '').trim();
    const newEmployeeId = (this.newEmployeeId || '').trim();
    return {
      userID: this.user.userID,
      oldUserName: this.user.userName,
      newUserName: newUserName || null,
      newEmployeeId: newEmployeeId || null,
      updateContactFields: this.updateContactFields,
    };
  }

  confirmAndRename() {
    if (!this.canSubmit) {
      return;
    }
    const request = this.buildRequest();
    this.alertService
      .confirm('Confirm', this.confirmMessage(request))
      .subscribe((accept: any) => {
        if (accept) {
          this.rename(request);
        }
      });
  }

  private confirmMessage(request: any): string {
    const changes: string[] = [];
    if (request.newUserName) {
      changes.push(
        `username from ${request.oldUserName} to ${request.newUserName}`,
      );
    }
    if (request.newEmployeeId) {
      changes.push(
        `employee ID from ${this.currentEmployeeId || 'not set'} to ${request.newEmployeeId}`,
      );
    }
    const audit = request.newUserName
      ? ' This also repoints the Created By and Modified By records they own.'
      : '';
    return `Change ${changes.join(' and ')}?${audit} This cannot be undone.`;
  }

  private rename(request: any) {
    this.submitting = true;
    this.changeUsernameService.renameUsername(request).subscribe(
      (response: any) => {
        this.submitting = false;
        this.renameResult = response.data;
        this.alertService.alert('Username updated successfully', 'success');
        this.newUserName = '';
        this.newEmployeeId = '';
        this.currentEmployeeId = '';
        this.userNameTaken = false;
        this.employeeIdTaken = false;
        this.user = null;
        this.getUserList();
      },
      (err: any) => {
        this.submitting = false;
        this.alertService.alert(err.errorMessage, 'error');
      },
    );
  }
}
