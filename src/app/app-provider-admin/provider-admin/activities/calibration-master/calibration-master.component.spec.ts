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
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CalibrationMasterComponent } from './calibration-master.component';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CallibrationMasterServiceService } from '../../inventory/services/callibration-master-service.service';

const FakeProviderAdminRoleService = {
  getServiceLinesCalibrationNew: (_userID?: any) =>
    of({ data: [{ serviceID: 4 }] }),
  getStatesNew: (_obj?: any) => of({ data: [] }),
};

const FakeDataService = {
  uname: 'admin',
  uid: 'U1',
  provider_serviceMapID: null,
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeCallibrationMasterServiceService = {
  fetCalibrationMasters: (_obj?: any) =>
    of({ statusCode: 200, data: { calibrationData: [] } }),
  createCalibrationStrip: (_obj?: any) => of({ statusCode: 200 }),
  updateCalibrationStrip: (_obj?: any) => of({ statusCode: 200 }),
  deleteCalibrationStrip: (_obj?: any) => of({ statusCode: 200 }),
};

describe('CalibrationMasterComponent', () => {
  let component: CalibrationMasterComponent;
  let fixture: ComponentFixture<CalibrationMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CalibrationMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        DatePipe,
        {
          provide: ProviderAdminRoleService,
          useValue: FakeProviderAdminRoleService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        {
          provide: CallibrationMasterServiceService,
          useValue: FakeCallibrationMasterServiceService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(CalibrationMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
