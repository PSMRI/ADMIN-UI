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
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MappedVansComponent } from './mapped-vans.component';
import { EmployeeParkingPlaceMappingService } from '../../activities/services/employee-parking-place-mapping.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

let component: MappedVansComponent;
let fixture: ComponentFixture<MappedVansComponent>;

const FakeEmployeeParkingPlaceMappingService = {
  getMappedVansList: (_userParkingPlaceMapID: any) =>
    of({ statusCode: 200, data: [] }),
  removeMappedVan: (_obj: any) => of({ statusCode: 200 }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

const FakeDialogData = {
  vanListDetails: { userParkingPlaceMapID: 'vp1' },
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MappedVansComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: FakeDialogData },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        {
          provide: EmployeeParkingPlaceMappingService,
          useValue: FakeEmployeeParkingPlaceMappingService,
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
    fixture = TestBed.createComponent(MappedVansComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('MappedVansComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
