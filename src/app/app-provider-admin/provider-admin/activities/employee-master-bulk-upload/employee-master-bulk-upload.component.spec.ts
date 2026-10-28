import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { EmployeeMasterBulkUploadComponent } from './employee-master-bulk-upload.component';
import { BlockSubcenterMappingService } from '../services/block-subcenter-mapping-service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

const FakeBlockSubcenterMappingService = {
  uploadData: (_reqObj?: any) => of({ statusCode: 200 }),
  memberBulkUploadXML: (_xmlData?: any) => of({}),
  downloadErrorExcel: () => of(new Blob()),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uid: 'U1',
  uname: 'admin',
  userPriveliges: [],
};

const FakeMatDialog = {
  open: (_component?: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

const FakeLocation = {
  back: () => undefined,
};

describe('EmployeeMasterBulkUploadComponent', () => {
  let component: EmployeeMasterBulkUploadComponent;
  let fixture: ComponentFixture<EmployeeMasterBulkUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EmployeeMasterBulkUploadComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: BlockSubcenterMappingService,
          useValue: FakeBlockSubcenterMappingService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: FakeDataService },
        { provide: MatDialog, useValue: FakeMatDialog },
        { provide: Location, useValue: FakeLocation },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmployeeMasterBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
