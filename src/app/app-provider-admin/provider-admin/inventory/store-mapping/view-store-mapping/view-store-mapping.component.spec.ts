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
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ViewStoreMappingComponent } from './view-store-mapping.component';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { StoreMappingService } from 'src/app/core/services/inventory-services/store-mapping.service';

const FakeDataService = {
  service_providerID: 'serviceProviderID',
  uname: 'admin',
  uid: '1',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeCommonServices = {
  getServiceLines: (_userId: any) => of({ data: [] }),
  getStatesOnServices: (_userId: any, _serviceId: any, _flag: any) =>
    of({ data: [] }),
};

const FakeStoreMappingService = {
  getAllStore: (_id: any) => of({ data: [] }),
  deleteMapping: (_data: any) => of({}),
};

describe('ViewStoreMappingComponent', () => {
  let component: ViewStoreMappingComponent;
  let fixture: ComponentFixture<ViewStoreMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ViewStoreMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        { provide: StoreMappingService, useValue: FakeStoreMappingService },
        { provide: CommonServices, useValue: FakeCommonServices },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/mat-paginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(ViewStoreMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
