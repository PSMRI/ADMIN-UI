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

import { CallDispositionTypeMasterComponent } from './call-disposition-type-master.component';
import { CallTypeSubtypeService } from 'src/app/app-provider-admin/provider-admin/activities/services/calltype-subtype-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

const FakeCallTypeSubtypeService = {
  getServiceLinesNew: (_userID?: any) => of({ data: [{ serviceID: 1 }] }),
  getStatesNew: (_obj?: any) => of({ data: [] }),
  getCallTypeSubType: (_providerServiceMapID?: any) => of({ data: [] }),
  saveCallTypeSubtype: (_data?: any) => of({ data: {} }),
  deleteSubCallType: (_obj?: any) => of({}),
  modificallType: (_obj?: any) => of({}),
};

const FakeDataService = {
  uname: 'admin',
  uid: 'U1',
  providerServiceMapID_104: 'PSM104',
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

describe('CallDispositionTypeMasterComponent', () => {
  let component: CallDispositionTypeMasterComponent;
  let fixture: ComponentFixture<CallDispositionTypeMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CallDispositionTypeMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: CallTypeSubtypeService,
          useValue: FakeCallTypeSubtypeService,
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
    fixture = TestBed.createComponent(CallDispositionTypeMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
