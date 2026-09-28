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
import { MatDialog } from '@angular/material/dialog';

import { ItemMasterComponent } from './item-master.component';
import { ItemService } from '../services/item.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeItemService = {
  getAllItems: (_providerServiceMapID: any) => of({ data: [] }),
  setDiscontinue: (_itemID: any, _discontinue: any) => of({ data: [] }),
  confirmItemCodeUnique: (_code: any, _type: any, _providerServiceMapID: any) =>
    of({ statusCode: 200, data: { response: 'false' } }),
  getAllItemsCategory: (_providerServiceMapID: any, _flag: any) =>
    of({ data: [] }),
  getAllDosages: (_providerServiceMapID: any) => of({ data: [] }),
  getAllPharmacologyCategory: (_providerServiceMapID: any) => of({ data: [] }),
  getAllManufacturers: (_providerServiceMapID: any) => of({ data: [] }),
  getAllUoms: (_providerServiceMapID: any) => of({ data: [] }),
  getAllRoutes: (_providerServiceMapID: any) => of({ data: [] }),
  createItem: (_data: any) => of({}),
  updateItem: (_data: any) => of({}),
  itemActivationDeactivation: (_itemID: any, _flag: any) => of({}),
};

const FakeCommonServices = {
  getServiceLines: (_userID: any) => of({ data: [{ serviceID: 4 }] }),
  getStatesOnServices: (_userID: any, _serviceID: any, _isNational: any) =>
    of({ data: [] }),
};

const FakeDataService = {
  uname: 'admin',
  uid: '1',
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

const FakeMatDialog = {
  open: (_component: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

describe('ItemMasterComponent', () => {
  let component: ItemMasterComponent;
  let fixture: ComponentFixture<ItemMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        { provide: ItemService, useValue: FakeItemService },
        { provide: CommonServices, useValue: FakeCommonServices },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialog, useValue: FakeMatDialog },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(ItemMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
