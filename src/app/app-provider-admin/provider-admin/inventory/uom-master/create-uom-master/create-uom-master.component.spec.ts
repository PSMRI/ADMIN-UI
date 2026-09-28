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
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { CreateUomMasterComponent } from './create-uom-master.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { UomMasterService } from 'src/app/core/services/inventory-services/uom-master.service';

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeUomMasterService = {
  checkForUniqueUOMCode: (_code: any, _id: any) => of({ response: 'false' }),
  postUOMMaster: (_data: any) => of({ data: [] }),
};

describe('CreateUomMasterComponent', () => {
  let component: CreateUomMasterComponent;
  let fixture: ComponentFixture<CreateUomMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateUomMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: UomMasterService, useValue: FakeUomMasterService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/mat-paginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(CreateUomMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
