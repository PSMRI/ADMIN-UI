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
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { UpdateServiceProviderComponent } from './update-service-provider.component';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

describe('UpdateServiceProviderComponent', () => {
  let component: UpdateServiceProviderComponent;
  let fixture: ComponentFixture<UpdateServiceProviderComponent>;

  const fakeSuperAdminServiceProviderService = {
    getAllProvider: () =>
      of({ data: [{ serviceProviderID: '1', serviceProviderName: 'RO' }] }),
    getAllStates: (_countryID?: any) => of({ data: [] }),
    getAllServiceLines: () => of({ data: [] }),
  };

  const fakeMatDialog = {
    open: () => ({ afterClosed: () => of(undefined) }),
  };

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };

  const fakeDataService = {
    uname: 'admin',
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UpdateServiceProviderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: SuperAdmin_ServiceProvider_Service,
          useValue: fakeSuperAdminServiceProviderService,
        },
        { provide: MatDialog, useValue: fakeMatDialog },
        {
          provide: ConfirmationDialogsService,
          useValue: fakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: fakeDataService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic.
    fixture = TestBed.createComponent(UpdateServiceProviderComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
