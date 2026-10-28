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
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ProviderAdminListComponent } from './provider-admin-list.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';

describe('ProviderAdminListComponent', () => {
  let component: ProviderAdminListComponent;
  let fixture: ComponentFixture<ProviderAdminListComponent>;

  const fakeDataService = {
    uname: 'admin',
  };
  const providerAdminForFakeDataService = {
    provide: dataService,
    useValue: fakeDataService,
  };

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };

  const providerAdminForFakeConfirmationDialogService = {
    provide: ConfirmationDialogsService,
    useValue: fakeConfirmationDialogsService,
  };

  const fakeSuperAdminServiceProviderService = {
    getAllProviderAdmin: () =>
      of({ data: [{ userID: '1', userName: 'admin1' }] }),
    getCommonRegistrationData: () =>
      of({ data: { m_Title: [], m_genders: [] } }),
    getAllQualifications: () => of({ data: [] }),
    getAllMaritalStatus: () => of({ data: [] }),
    createProviderAdmin: (_reqObject: any) => of({}),
    delete_toggle_activation: (_obj: any) => of({}),
    checkUserAvailability: (_username: any) => of({ response: 'usernotexist' }),
    validateAadhar: (_aadhar: any) => of({ response: 'false' }),
    validatePan: (_pan: any) => of({ response: 'false' }),
  };
  const providerAdminForFakeSuperAdminService = {
    provide: SuperAdmin_ServiceProvider_Service,
    useValue: fakeSuperAdminServiceProviderService,
  };

  const fakeMatDialog = {
    open: () => ({ afterClosed: () => of(undefined) }),
  };
  const providerAdminForFakeMatDialog = {
    provide: MatDialog,
    useValue: fakeMatDialog,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderAdminListComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        providerAdminForFakeDataService,
        providerAdminForFakeConfirmationDialogService,
        providerAdminForFakeSuperAdminService,
        providerAdminForFakeMatDialog,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic.
    fixture = TestBed.createComponent(ProviderAdminListComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should load all provider admin details on ngOnInit', () => {
    expect(component.searchResult).toEqual([
      { userID: '1', userName: 'admin1' },
    ]);
  });
});
