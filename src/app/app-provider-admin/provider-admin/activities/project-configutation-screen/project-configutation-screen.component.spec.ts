import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { of } from 'rxjs';

import { ProjectConfigutationScreenComponent } from './project-configutation-screen.component';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ProjectConfigurationService } from '../services/project-configuration-service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeProjectMasterService = {
  getProjectMasters: (_serviceProviderId?: any) =>
    of({ statusCode: 200, data: [] }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeProjectConfigurationService = {
  getSectionMasters: () => of({ statusCode: 200, data: [] }),
  fetchMappedSectionsForProject: (_reqObj?: any) =>
    of({ statusCode: 200, data: [] }),
  mapSectionsToProject: (_reqObj?: any) =>
    of({ statusCode: 200, data: { response: 'ok' } }),
};

const FakeMatDialog = {
  open: (_component?: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ProjectConfigutationScreenComponent', () => {
  let component: ProjectConfigutationScreenComponent;
  let fixture: ComponentFixture<ProjectConfigutationScreenComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectConfigutationScreenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, MatAutocompleteModule],
      providers: [
        { provide: ProjectMasterService, useValue: FakeProjectMasterService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        {
          provide: ProjectConfigurationService,
          useValue: FakeProjectConfigurationService,
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
    fixture = TestBed.createComponent(ProjectConfigutationScreenComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
