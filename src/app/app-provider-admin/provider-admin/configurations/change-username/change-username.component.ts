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

  /** Employee ID is left untouched unless the admin opts in. */
  updateEmployeeId = false;
  currentEmployeeId = '';
  newEmployeeId = '';

  userNamesList: any = [];

  /**
   * Only meaningful where the username is the user's mobile number — it also
   * rewrites ContactNo and EmergencyContactNo on m_user.
   */
  updateContactFields = true;

  renameResult: any = null;
  submitting = false;

  /**
   * m_user.ContactNo is varchar(12) and the rename writes the username into it,
   * so the contact-field option tightens the limit from the UserName max of 20.
   */
  readonly maxUserNameLength = 20;
  readonly maxContactLength = 12;
  readonly maxEmployeeIdLength = 20;

  displayedColumns = ['table', 'rows'];

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

  /** Clears the previous result so it can't be mistaken for the new selection. */
  onSelectionChange() {
    this.renameResult = null;
  }

  onUserChange() {
    this.onSelectionChange();
    this.currentEmployeeId = '';
    this.newEmployeeId = '';
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

  get effectiveMaxLength(): number {
    return this.updateContactFields
      ? this.maxContactLength
      : this.maxUserNameLength;
  }

  get validationMessage(): string | null {
    const trimmed = (this.newUserName || '').trim();
    if (!this.user) {
      return 'Select a user';
    }
    if (!trimmed) {
      return 'Enter the new username';
    }
    if (trimmed === this.user.userName) {
      return 'New username is the same as the current username';
    }
    if (trimmed.length > this.effectiveMaxLength) {
      return this.updateContactFields
        ? `Maximum ${this.maxContactLength} characters while contact numbers are being updated`
        : `Maximum ${this.maxUserNameLength} characters`;
    }
    if (this.updateEmployeeId) {
      const employeeId = (this.newEmployeeId || '').trim();
      if (!employeeId) {
        return 'Enter the new employee ID';
      }
      if (employeeId.length > this.maxEmployeeIdLength) {
        return `Employee ID: maximum ${this.maxEmployeeIdLength} characters`;
      }
    }
    return null;
  }

  get canSubmit(): boolean {
    return this.validationMessage === null && !this.submitting;
  }

  private buildRequest() {
    return {
      oldUserName: this.user.userName,
      newUserName: (this.newUserName || '').trim(),
      updateEmployeeId: this.updateEmployeeId,
      newEmployeeId: this.updateEmployeeId
        ? (this.newEmployeeId || '').trim()
        : null,
      updateContactFields: this.updateContactFields,
    };
  }

  confirmAndRename() {
    if (!this.canSubmit) {
      return;
    }
    const request = this.buildRequest();
    this.alertService
      .confirm(
        'Confirm',
        `Rename ${request.oldUserName} to ${request.newUserName}? ` +
          `This also repoints the Created By and Modified By records they own, ` +
          `and cannot be undone.`,
      )
      .subscribe((accept: any) => {
        if (accept) {
          this.rename(request);
        }
      });
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
        this.updateEmployeeId = false;
        this.user = null;
        this.getUserList();
      },
      (err: any) => {
        this.submitting = false;
        this.alertService.alert(err.errorMessage, 'error');
      },
    );
  }

  /** Turns the rowsPerTable map into rows the table can render. */
  asRows(result: any): any[] {
    if (!result || !result.rowsPerTable) {
      return [];
    }
    return Object.keys(result.rowsPerTable).map((table) => ({
      table: table,
      rows: result.rowsPerTable[table],
    }));
  }
}
