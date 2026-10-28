import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';

import { AddFieldsToProjectComponent } from './add-fields-to-project.component';
import { AddFieldsService } from '../services/add-fields-service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeAddFieldsService = {
  fetchFields: (_reqObj?: any) => of({ statusCode: 200, data: { fields: [] } }),
  saveFields: (_reqObj?: any) => of({ statusCode: 200 }),
  updateFields: (_reqObj?: any) => of({ statusCode: 200, data: {} }),
  getFieldTypes: () => of({ statusCode: 200, data: [] }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

describe('AddFieldsToProjectComponent', () => {
  let component: AddFieldsToProjectComponent;
  let fixture: ComponentFixture<AddFieldsToProjectComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AddFieldsToProjectComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: AddFieldsService, useValue: FakeAddFieldsService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MAT_DIALOG_DATA, useValue: { data: {}, projectId: 'P1' } },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(AddFieldsToProjectComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
