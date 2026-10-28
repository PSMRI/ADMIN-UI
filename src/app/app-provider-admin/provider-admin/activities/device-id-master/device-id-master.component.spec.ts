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

import { DeviceIdMasterComponent } from './device-id-master.component';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { FetosenseDeviceIdMasterService } from '../services/fetosense-device-id-master-service.service';

const FakeFetosenseDeviceIdMasterService = {
  getServiceLines: (_userID?: any) =>
    of({ statusCode: 200, data: [{ serviceID: 4 }] }),
  getStates: (_userID?: any, _serviceID?: any, _isNational?: any) =>
    of({ statusCode: 200, data: [] }),
  getFetosenseDeviceMaster: (_id?: any) =>
    of({ statusCode: 200, data: { fetosenseDeviceIDs: [] } }),
  toggle_activate_DeviceMaster: (_obj?: any) =>
    of({ statusCode: 200, data: {} }),
  saveFetosenseDeviceMaster: (_data?: any) => of({ statusCode: 200, data: {} }),
  editFetosenseDeviceMaster: (_data?: any) => of({ statusCode: 200, data: {} }),
};

const FakeDataService = {
  service_providerID: 'serviceProviderID',
  uid: 'U1',
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeMatDialog = {
  open: (_component?: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

describe('DeviceIdMasterComponent', () => {
  let component: DeviceIdMasterComponent;
  let fixture: ComponentFixture<DeviceIdMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DeviceIdMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: FetosenseDeviceIdMasterService,
          useValue: FakeFetosenseDeviceIdMasterService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialog, useValue: FakeMatDialog },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(DeviceIdMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
