import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { of } from 'rxjs';

import { ProjectMasterComponent } from './project-master.component';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeProjectMasterService = {
  getProjectMasters: (_serviceProviderId?: any) =>
    of({ statusCode: 200, data: [] }),
  addProject: (_reqObj?: any) => of({ statusCode: 200 }),
  updateProject: (_reqObj?: any) => of({ statusCode: 200 }),
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
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ProjectMasterComponent', () => {
  let component: ProjectMasterComponent;
  let fixture: ComponentFixture<ProjectMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProjectMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, MatFormFieldModule, MatInputModule],
      providers: [
        { provide: ProjectMasterService, useValue: FakeProjectMasterService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
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
    fixture = TestBed.createComponent(ProjectMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
