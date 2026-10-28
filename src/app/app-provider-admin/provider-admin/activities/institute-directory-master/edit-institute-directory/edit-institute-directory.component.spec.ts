import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { of } from 'rxjs';

import { EditInstituteDirectoryComponent } from './edit-institute-directory.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { InstituteDirectoryMasterService } from '../../services/institute-directory-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

const FakeInstituteDirectoryMasterService = {
  editInstituteDirectory: (_obj?: any) => of({}),
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

const FakeMatDialogRef = {
  close: (_result?: any) => undefined,
};

const dialogData = {
  instituteDirectoryID: 1,
  instituteDirectoryName: 'Directory A',
  instituteDirectoryDesc: 'desc',
};

describe('EditInstituteDirectoryComponent', () => {
  let component: EditInstituteDirectoryComponent;
  let fixture: ComponentFixture<EditInstituteDirectoryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EditInstituteDirectoryComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialog, useValue: FakeMatDialog },
        {
          provide: InstituteDirectoryMasterService,
          useValue: FakeInstituteDirectoryMasterService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialogRef, useValue: FakeMatDialogRef },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditInstituteDirectoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
