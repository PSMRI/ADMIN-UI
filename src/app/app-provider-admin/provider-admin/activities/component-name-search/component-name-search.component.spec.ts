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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ComponentNameSearchComponent } from './component-name-search.component';
import { ComponentMasterServiceService } from 'src/app/core/services/ProviderAdminServices/component-master-service.service';

const FakeComponentMasterServiceService = {
  searchComponent: (_term?: any, _pageNo?: any) =>
    of({ statusCode: 200, data: { lonicMaster: [] } }),
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

describe('ComponentNameSearchComponent', () => {
  let component: ComponentNameSearchComponent;
  let fixture: ComponentFixture<ComponentNameSearchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentNameSearchComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { searchTerm: '' } },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        {
          provide: ComponentMasterServiceService,
          useValue: FakeComponentMasterServiceService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComponentNameSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
