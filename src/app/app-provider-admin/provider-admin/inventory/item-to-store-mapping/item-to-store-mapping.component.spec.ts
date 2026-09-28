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

import { ItemToStoreMappingComponent } from './item-to-store-mapping.component';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemFacilityMappingService } from 'src/app/core/services/inventory-services/item-facility-mapping.service';
import { Mainstroreandsubstore } from 'src/app/core/services/inventory-services/mainstoreandsubstore.service';
import { ItemService } from '../services/item.service';
import { MatDialog } from '@angular/material/dialog';
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
  getServiceLines: (_userId: any) => of({ data: [] }),
  getStatesOnServices: (_userId: any, _serviceId: any, _flag: any) =>
    of({ data: [] }),
};

const FakeItemFacilityMappingService = {
  getAllFacilityItemMapping: (_id: any) => of({ data: [] }),
  getItemsOnCategory: (_id: any, _categoryId: any) => of({ data: [] }),
  getItemsForSubStore: (_id: any, _facilityId: any) => of({ data: [] }),
  setFacilityItemMapping: (_data: any) => of({}),
  deleteFacilityItemMapping: (_id: any, _bool: any) => of({}),
};

const FakeMainstroreandsubstore = {
  getAllStores: (_id: any) => of({ data: [] }),
};

const FakeItemService = {
  getAllItemsCategory: (_id: any, _flag: any) => of({ data: [] }),
};

const FakeMatDialog = {
  open: (..._args: any[]) => ({
    afterClosed: () => of(undefined),
  }),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ItemToStoreMappingComponent', () => {
  let component: ItemToStoreMappingComponent;
  let fixture: ComponentFixture<ItemToStoreMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ItemToStoreMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: CommonServices, useValue: FakeCommonServices },
        { provide: Mainstroreandsubstore, useValue: FakeMainstroreandsubstore },
        { provide: ItemService, useValue: FakeItemService },
        { provide: MatDialog, useValue: FakeMatDialog },
        {
          provide: ItemFacilityMappingService,
          useValue: FakeItemFacilityMappingService,
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
    fixture = TestBed.createComponent(ItemToStoreMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
