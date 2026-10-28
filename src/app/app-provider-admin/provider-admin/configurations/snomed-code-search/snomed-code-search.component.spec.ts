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
import { SnomedCodeSearchComponent } from './snomed-code-search.component';
import { SnomedMasterService } from '../services/snomed-master.service';

let component: SnomedCodeSearchComponent;
let fixture: ComponentFixture<SnomedCodeSearchComponent>;

const FakeSnomedMasterService = {
  searchSnomedRecord: (_term: any, _pageNo: any) =>
    of({ statusCode: 200, data: { sctMaster: [] } }),
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

// searchTerm is deliberately kept at length <= 2: the component's search()
// only calls the service when term.length > 2, so ngOnInit stays a no-op
// beyond that guard for this "should be created" smoke test.
const FakeDialogData = {
  searchTerm: 'ab',
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SnomedCodeSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: FakeDialogData },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        { provide: SnomedMasterService, useValue: FakeSnomedMasterService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(SnomedCodeSearchComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('SnomedCodeSearchComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
