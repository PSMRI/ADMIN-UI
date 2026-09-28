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

import { VanSpokeMappingComponent } from './van-spoke-mapping.component';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { VanSpokeMappingService } from 'src/app/core/services/ProviderAdminServices/van-spoke-mapping.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeVanSpokeMappingService = {
  getServiceLines: (_userID: any) => of({ data: [{ serviceID: 2 }] }),
  getStates: (_obj: any) => of({ data: [] }),
  getZones: (_obj: any) => of({ data: [] }),
  getParkingPlace: (_obj: any) => of({ data: [] }),
  getServicepoints: (_obj: any) => of({ data: [] }),
  getVanTypes: (_obj: any) => of({ data: [] }),
  getVanSpokeMapping: (_obj: any) =>
    of({ data: { vanSpokeMappedDetails: [] } }),
  getVansOrspoke: (_obj: any) => of({ data: [] }),
  saveMappingData: (_obj: any) => of({}),
  updateMappingStatus: (_obj: any) => of({}),
};

const FakeDataService = {
  uid: '1',
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('VanSpokeMappingComponent', () => {
  let component: VanSpokeMappingComponent;
  let fixture: ComponentFixture<VanSpokeMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [VanSpokeMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: VanSpokeMappingService,
          useValue: FakeVanSpokeMappingService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(VanSpokeMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
