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
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { of } from 'rxjs';

import { EditProviderDetailsComponent } from './edit-provider-details.component';
import { BlockProvider } from 'src/app/core/services/adminServices/AdminServiceProvider/block-provider-service.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

describe('EditProviderDetailsComponent', () => {
  let component: EditProviderDetailsComponent;
  let fixture: ComponentFixture<EditProviderDetailsComponent>;

  const fakeProviderDetails = [
    {
      serviceProviderId: '1',
      serviceProviderName: 'provider1',
      primaryContactName: 'primary',
      primaryContactEmailID: 'primary@test.com',
      primaryContactNo: '9999999999',
      primaryContactAddress: 'address',
      secondaryContactName: 'secondary',
      secondaryContactEmailID: 'secondary@test.com',
      secondaryContactNo: '8888888888',
      secondaryContactAddress: 'address2',
    },
  ];

  const fakeDialogRef = {
    close: (_result?: any) => undefined,
  };

  const fakeMatDialog = {
    open: () => ({ afterClosed: () => of(undefined) }),
  };

  const fakeSuperAdminServiceProviderService = {
    checkProviderNameAvailability: (_serviceProviderName: any) =>
      of({ data: 'provider_name_not_exists' }),
  };

  const fakeBlockProvider = {
    editProvider: (_providerObj?: any) => of({ data: {} }),
  };

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditProviderDetailsComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: MatDialogRef, useValue: fakeDialogRef },
        { provide: MatDialog, useValue: fakeMatDialog },
        { provide: MAT_DIALOG_DATA, useValue: fakeProviderDetails },
        {
          provide: SuperAdmin_ServiceProvider_Service,
          useValue: fakeSuperAdminServiceProviderService,
        },
        { provide: BlockProvider, useValue: fakeBlockProvider },
        {
          provide: ConfirmationDialogsService,
          useValue: fakeConfirmationDialogsService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditProviderDetailsComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
