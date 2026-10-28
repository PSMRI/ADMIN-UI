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
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { EditCategorySubcategoryComponent } from './edit-category-subcategory.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CategorySubcategoryService } from 'src/app/app-provider-admin/provider-admin/activities/services/category-subcategory-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeCategorySubcategoryService = {
  editCategory: (_obj?: any) => of({}),
  editSubCategory: (_obj?: any) => of({}),
};

const FakeDataService = {
  uname: 'admin',
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

const dialogData = {
  categoryObj: {
    categoryID: 1,
    categoryName: 'Category A',
    subService: 'SubService A',
    categoryDesc: 'desc',
    providerServiceMapId: 'PSM1',
    subCategoryID: 1,
    subCategoryName: 'SubCategory A',
    subCategoryDesc: 'sub desc',
  },
  categories: [],
  subcategories: [],
};

describe('EditCategorySubcategoryComponent', () => {
  let component: EditCategorySubcategoryComponent;
  let fixture: ComponentFixture<EditCategorySubcategoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditCategorySubcategoryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        {
          provide: CategorySubcategoryService,
          useValue: FakeCategorySubcategoryService,
        },
        { provide: dataService, useValue: FakeDataService },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCategorySubcategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
