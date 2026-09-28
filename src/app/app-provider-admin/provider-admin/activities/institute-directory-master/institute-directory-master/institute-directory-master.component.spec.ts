import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { InstituteDirectoryMasterComponent } from './institute-directory-master.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { InstituteDirectoryMasterService } from '../../services/institute-directory-master-service.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeInstituteDirectoryMasterService = {
  getServiceLinesNew: (_userID?: any) => of({ data: [{ serviceID: 1 }] }),
  getStatesNew: (_obj?: any) => of({ data: [] }),
  getInstituteDirectory: (_id?: any) => of({ data: [] }),
  saveInstituteDirectory: (_data?: any) => of({}),
  toggle_activate_InstituteDirectory: (_obj?: any) => of({}),
};

const FakeDataService = {
  uid: 'U1',
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

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('InstituteDirectoryMasterComponent', () => {
  let component: InstituteDirectoryMasterComponent;
  let fixture: ComponentFixture<InstituteDirectoryMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InstituteDirectoryMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: InstituteDirectoryMasterService,
          useValue: FakeInstituteDirectoryMasterService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: MatDialog, useValue: FakeMatDialog },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(InstituteDirectoryMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
