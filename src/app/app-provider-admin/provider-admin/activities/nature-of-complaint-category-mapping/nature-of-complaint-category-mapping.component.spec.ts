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

import { NatureOfComplaintCategoryMappingComponent } from './nature-of-complaint-category-mapping.component';
import { NatureOfCompaintCategoryMappingService } from '../services/nature-of-complaint-category-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeNatureOfCompaintCategoryMappingService = {
  getServiceLines: (_userID?: any) => of({ data: [{ serviceID: 1 }] }),
  getStates: (_obj?: any) => of({ data: [] }),
  getFeedbackTypes: (_id?: any) => of({ data: [] }),
  getFeedbackNatureTypes: (_obj?: any) => of({ data: [] }),
  getMapping: (_obj?: any) => of({ data: [] }),
  getAllCategory: (_id?: any) => of({ data: [] }),
  filterMappedCategory: (_id?: any) => of({ data: [] }),
  saveComplaintToCategoryMapping: (_obj?: any) => of({}),
  updateComplaintCategoryMapping: (_obj?: any) => of({ data: {} }),
  unmapCategory: (_obj?: any) => of({}),
};

const FakeDataService = {
  uname: 'admin',
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

const sessionValues: Record<string, any> = {
  uid: 'U1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('NatureOfComplaintCategoryMappingComponent', () => {
  let component: NatureOfComplaintCategoryMappingComponent;
  let fixture: ComponentFixture<NatureOfComplaintCategoryMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NatureOfComplaintCategoryMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: NatureOfCompaintCategoryMappingService,
          useValue: FakeNatureOfCompaintCategoryMappingService,
        },
        { provide: dataService, useValue: FakeDataService },
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
    fixture = TestBed.createComponent(
      NatureOfComplaintCategoryMappingComponent,
    );
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
