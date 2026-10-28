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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { ViewVersionDetailsComponent } from './view-version-details.component';
import { ConfirmationDialogsService } from '../../services/dialog/confirmation.service';

class MatDialogRefStub {
  close(_result?: any): void {}
}

describe('ViewVersionDetailsComponent', () => {
  let component: ViewVersionDetailsComponent;
  let fixture: ComponentFixture<ViewVersionDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewVersionDetailsComponent],
      providers: [
        { provide: MatDialogRef, useClass: MatDialogRefStub },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            api_versionDetails: { Version: '1.0.0', Commit: 'abc123' },
            uiversionDetails: { Version: '1.0.0', Commit: 'abc123' },
          },
        },
        { provide: ConfirmationDialogsService, useValue: {} },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewVersionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
