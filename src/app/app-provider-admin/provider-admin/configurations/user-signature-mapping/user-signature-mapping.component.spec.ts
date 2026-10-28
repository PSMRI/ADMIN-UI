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
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UserSignatureMappingComponent } from './user-signature-mapping.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { EmployeeParkingPlaceMappingService } from '../../activities/services/employee-parking-place-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeEmployeeParkingPlaceMappingService = {
  getDesignations: () =>
    of({ data: [{ designationID: '1', designationName: 'Doctor' }] }),
  getUserNameBasedOnDesig: (_reqObj: any) => of({ data: [] }),
  checkUsersignatureExist: (_userID: any) =>
    of({ data: { response: 'false' } }),
  uploadSignature: (_signObj: any) => of({}),
  downloadSign: (_userID: any) =>
    of({ headers: { get: (_h: any) => null }, body: null }),
  activateOrDeActivateSignature: (_req: any) => of({}),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uname: 'admin',
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

const FakeMatDialog = {
  open: (_component: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

describe('UserSignatureMappingComponent', () => {
  let component: UserSignatureMappingComponent;
  let fixture: ComponentFixture<UserSignatureMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserSignatureMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: EmployeeParkingPlaceMappingService,
          useValue: FakeEmployeeParkingPlaceMappingService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: FakeDataService },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
        { provide: MatDialog, useValue: FakeMatDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator/matSort directives whose modules
    // aren't imported here, and these tests only exercise component logic,
    // not the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(UserSignatureMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
