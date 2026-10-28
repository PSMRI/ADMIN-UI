import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { WorkLocationMappingComponent } from './work-location-mapping.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { WorkLocationMapping } from '../services/work-location-mapping.service';
import { VillageMasterService } from 'src/app/core/services/adminServices/AdminVillage/village-master-service.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';
import { FacilityMasterService } from 'src/app/core/services/inventory-services/facilitytypemaster.service';

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeWorkLocationMapping = {
  getStates: (_userID?: any, _serviceID?: any, _isNational?: any) =>
    of({ data: [] }),
  getServices: (_userID?: any) => of({ data: [] }),
  getMappedWorkLocationList: (_serviceProviderID?: any) => of({ data: [] }),
  getUserName: (_serviceProviderID?: any) => of({ data: [] }),
};

const FakeVillageMasterService = {};

const FakeFacilityMasterService = {};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uid: 'U1',
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('WorkLocationMappingComponent', () => {
  let component: WorkLocationMappingComponent;
  let fixture: ComponentFixture<WorkLocationMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [WorkLocationMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatCheckboxModule,
        MatRadioModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: WorkLocationMapping, useValue: FakeWorkLocationMapping },
        { provide: VillageMasterService, useValue: FakeVillageMasterService },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
        { provide: FacilityMasterService, useValue: FakeFacilityMasterService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(WorkLocationMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
