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
import { of } from 'rxjs';

import { FacilityTypeMasterComponent } from './facility-type-master.component';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeCommonServices = {
  getServiceLines: (_uid: any) => of({ data: [{ serviceID: 4 }] }),
};

const FakeFacilityMasterService = {
  getStates: (_uid: any, _serviceID: any, _isNational: any) => of({ data: [] }),
  getfacilities: (_providerServiceMapID: any) => of({ data: [] }),
  deleteFacility: (_object: any) => of({}),
  savefacilities: (_data: any) => of({}),
  updateFacility: (_object: any) => of({}),
};

const FakeDataService = {
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uid: '1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('FacilityTypeMasterComponent', () => {
  let component: FacilityTypeMasterComponent;
  let fixture: ComponentFixture<FacilityTypeMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FacilityTypeMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: CommonServices, useValue: FakeCommonServices },
        { provide: FacilityMasterService, useValue: FakeFacilityMasterService },
        { provide: dataService, useValue: FakeDataService },
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
    fixture = TestBed.createComponent(FacilityTypeMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
