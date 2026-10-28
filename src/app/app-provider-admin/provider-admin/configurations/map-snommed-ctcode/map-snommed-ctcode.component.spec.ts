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
import { MapSnommedCTCodeComponent } from './map-snommed-ctcode.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { ItemService } from '../../inventory/services/item.service';
import { SnomedMasterService } from '../services/snomed-master.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

let component: MapSnommedCTCodeComponent;
let fixture: ComponentFixture<MapSnommedCTCodeComponent>;

const FakeItemService = {};

const FakeCommonServices = {
  getServiceLines: (_userID: any) => of({ data: [] }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeMatDialog = {};

const FakeSnomedMasterService = {
  getMasterList: (_type: any) => of({ data: [] }),
  saveSctMapping: (_obj: any) => of({}),
  editSctMapping: (_obj: any) => of({}),
  updateBlock: (_status: any) => of({}),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MapSnommedCTCodeComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: ItemService, useValue: FakeItemService },
        { provide: CommonServices, useValue: FakeCommonServices },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialog, useValue: FakeMatDialog },
        { provide: SnomedMasterService, useValue: FakeSnomedMasterService },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(MapSnommedCTCodeComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('MapSnommedCTCodeComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
