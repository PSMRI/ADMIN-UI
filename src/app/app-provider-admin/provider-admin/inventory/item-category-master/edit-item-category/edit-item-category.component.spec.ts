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
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';

import { EditItemCategoryComponent } from './edit-item-category.component';
import { ItemCategoryService } from 'src/app/core/services/inventory-services/item-category.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeItemCategoryService = {
  editItemCategory: (_reqObj: any) => of({ statusCode: 200 }),
};

const FakeMatDialog = {
  open: (_component: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

const sessionValues: Record<string, any> = {
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

const FakeDialogData = {
  item: {
    itemCategoryCode: 'IC1',
    itemCategoryName: 'Category 1',
    itemCategoryDesc: 'Description',
    itemCategoryID: '1',
  },
  providerServiceMapID: 'providerServiceMapID',
};

describe('EditItemCategoryComponent', () => {
  let component: EditItemCategoryComponent;
  let fixture: ComponentFixture<EditItemCategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditItemCategoryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: FakeDialogData },
        { provide: MatDialog, useValue: FakeMatDialog },
        { provide: ItemCategoryService, useValue: FakeItemCategoryService },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): these tests only
    // exercise component logic, not the rendered DOM. ngOnInit is run
    // explicitly instead.
    fixture = TestBed.createComponent(EditItemCategoryComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
