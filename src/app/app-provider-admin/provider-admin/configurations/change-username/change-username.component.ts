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

  userNamesList: any = [];

  /**
   * Only meaningful where the username is the user's mobile number — it also
   * rewrites ContactNo and EmergencyContactNo on m_user.
   */
  updateContactFields = true;

  previewResult: any = null;
  renameResult: any = null;
  submitting = false;

  /**
   * m_user.ContactNo is varchar(12) and the rename writes the username into it,
   * so the contact-field option tightens the limit from the UserName max of 20.
   */
  readonly maxUserNameLength = 20;
  readonly maxContactLength = 12;

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

  /** Clears any previous run so a stale preview can't be confirmed. */
  onSelectionChange() {
    this.previewResult = null;
    this.renameResult = null;
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
    return null;
  }

  get canSubmit(): boolean {
    return this.validationMessage === null && !this.submitting;
  }

  private buildRequest() {
    return {
      oldUserName: this.user.userName,
      newUserName: (this.newUserName || '').trim(),
      updateContactFields: this.updateContactFields,
    };
  }

  preview() {
    if (!this.canSubmit) {
      return;
    }
    this.submitting = true;
    this.renameResult = null;
    this.changeUsernameService.previewRename(this.buildRequest()).subscribe(
      (response: any) => {
        this.submitting = false;
        this.previewResult = response.data;
      },
      (err: any) => {
        this.submitting = false;
        this.previewResult = null;
        this.alertService.alert(err.errorMessage, 'error');
      },
    );
  }

  /** Requires a preview first, so the row counts are always seen before committing. */
  confirmAndRename() {
    if (!this.canSubmit || !this.previewResult) {
      return;
    }
    const request = this.buildRequest();
    this.alertService
      .confirm(
        'Confirm',
        `Rename ${request.oldUserName} to ${request.newUserName}? ` +
          `This will repoint ${this.previewResult.totalRowsAffected} audit rows and cannot be undone.`,
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
        this.previewResult = null;
        this.alertService.alert('Username updated successfully', 'success');
        this.newUserName = '';
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
