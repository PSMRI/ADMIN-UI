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

import { SupplierMasterComponent } from './supplier-master.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { SuppliermasterService } from 'src/app/core/services/inventory-services/suppliermaster.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeCommonServices = {
  getServiceLines: (_uid: any) => of({ data: [] }),
};

const FakeSuppliermasterService = {
  getStates: (_uid: any, _serviceId: any, _flag: any) => of({ data: [] }),
  getAllDistricts: (_stateId: any) => of({ data: [] }),
  getAllStates: () => of({ data: [] }),
  getAllCountry: () => of({ data: [] }),
  getAllSuppliers: (_id: any) => of({ data: [] }),
  deleteSupplier: (_data: any) => of({}),
  saveSupplier: (_data: any) => of({}),
  updateSupplier: (_data: any) => of({}),
  checkForUniqueSupplierCode: (_code: any, _id: any) =>
    of({ response: 'false' }),
};

const sessionValues: Record<string, any> = {
  uname: 'admin',
  service_providerID: 'serviceProviderID',
  uid: '1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('SupplierMasterComponent', () => {
  let component: SupplierMasterComponent;
  let fixture: ComponentFixture<SupplierMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SupplierMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: CommonServices, useValue: FakeCommonServices },
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
    // relies on mat-table/mat-paginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(SupplierMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
