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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { WrapupTimeConfigurationComponent } from './wrapup-time-configuration.component';
import { WrapupTimeConfigurationService } from 'src/app/core/services/ProviderAdminServices/wrapup-time-configuration.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

const FakeWrapupTimeConfigurationService = {
  getServiceLinesWrapup: (_userID: any) => of({ data: [{ serviceID: 1 }] }),
  getStates: (_obj: any) => of({ data: [] }),
  getActiveRoles: (_providerServiceMapID: any) => of({ data: [] }),
  saveWrapUpTime: (_role: any) => of({}),
};

const FakeDataService = {
  uid: '1',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

describe('WrapupTimeConfigurationComponent', () => {
  let component: WrapupTimeConfigurationComponent;
  let fixture: ComponentFixture<WrapupTimeConfigurationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WrapupTimeConfigurationComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: WrapupTimeConfigurationService,
          useValue: FakeWrapupTimeConfigurationService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(WrapupTimeConfigurationComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
