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

import { ManufacturerMasterComponent } from './manufacturer-master.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ManufacturemasterService } from 'src/app/core/services/inventory-services/manufacturemaster.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuppliermasterService } from 'src/app/core/services/inventory-services/suppliermaster.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeDataService = {
  uname: 'admin',
  uid: '1',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeCommonServices = {
  getServiceLines: (_uid: any) => of({ data: [] }),
};

const FakeManufacturemasterService = {
  getAllManufacture: (_id: any) => of({ data: [] }),
  getAllDistricts: (_stateId: any) => of({ data: [] }),
  getAllStates: (_countryId: any) => of({ data: [] }),
  getAllCountry: () => of({ data: [] }),
  updateManufacture: (_data: any) => of({}),
  deleteManufacture: (_data: any) => of({}),
  saveManufacture: (_data: any) => of({}),
  checkForUniqueManufacturerCode: (_code: any, _id: any) =>
    of({ response: 'false' }),
};

const FakeSuppliermasterService = {
  getStates: (_uid: any, _serviceId: any, _flag: any) => of({ data: [] }),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ManufacturerMasterComponent', () => {
  let component: ManufacturerMasterComponent;
  let fixture: ComponentFixture<ManufacturerMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ManufacturerMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: CommonServices, useValue: FakeCommonServices },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ManufacturemasterService,
          useValue: FakeManufacturemasterService,
        },
        { provide: SuppliermasterService, useValue: FakeSuppliermasterService },
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
    // relies on mat-table/mat-paginator/mat-select directives whose modules
    // aren't imported here, and these tests only exercise component logic,
    // not the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(ManufacturerMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
