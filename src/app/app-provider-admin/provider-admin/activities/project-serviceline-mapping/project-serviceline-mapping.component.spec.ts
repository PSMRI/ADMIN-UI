import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { ProjectServicelineMappingComponent } from './project-serviceline-mapping.component';
import { ProjectServicelineMappingService } from '../services/project-serviceline-mapping.service';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeProjectServicelineMappingService = {
  getServices: (_reqObj?: any) => of({ statusCode: 200, data: [] }),
  getStates: () => of({ statusCode: 200, data: [] }),
  getDistricts: (_stateId?: any) => of({ statusCode: 200, data: [] }),
  getBlocks: (_blockId?: any) => of({ statusCode: 200, data: [] }),
};

const FakeProjectMasterService = {
  getProjectMasters: (_serviceProviderId?: any) =>
    of({ statusCode: 200, data: [] }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uname: 'admin',
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uid: 'U1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ProjectServicelineMappingComponent', () => {
  let component: ProjectServicelineMappingComponent;
  let fixture: ComponentFixture<ProjectServicelineMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectServicelineMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        NoopAnimationsModule,
      ],
      providers: [
        {
          provide: ProjectServicelineMappingService,
          useValue: FakeProjectServicelineMappingService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: ProjectMasterService, useValue: FakeProjectMasterService },
        { provide: dataService, useValue: FakeDataService },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(ProjectServicelineMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
