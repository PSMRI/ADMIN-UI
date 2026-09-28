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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ComponentMasterComponent } from './component-master.component';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { ComponentMasterServiceService } from 'src/app/core/services/ProviderAdminServices/component-master-service.service';
import { ServicePointMasterService } from '../services/service-point-master-services.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeDataService = {
  uname: 'admin',
  uid: 'U1',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeProviderAdminRoleService = {
  getServices_filtered: (_serviceProviderID?: any, _stateID?: any) => of([]),
};

const FakeComponentMasterServiceService = {
  getCurrentComponents: (_id?: any) => of({ data: [] }),
  postComponentData: (_obj?: any) => of({ data: {} }),
  updateComponentData: (_obj?: any) => of({}),
  toggleComponent: (_obj?: any) => of({}),
  getCurrentComponentForEdit: (_id?: any) => of({ data: {} }),
  getDiagnosticProcedureComponent: () => of({ data: [] }),
};

const FakeServicePointMasterService = {
  getServices: (_userID?: any) => of({ data: [] }),
  getStates: (_userID?: any, _serviceID?: any, _isNationalFlag?: any) =>
    of({ data: [] }),
};

const FakeMatDialog = {
  open: (_component?: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uid: 'U1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

describe('ComponentMasterComponent', () => {
  let component: ComponentMasterComponent;
  let fixture: ComponentFixture<ComponentMasterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule, ReactiveFormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        {
          provide: ProviderAdminRoleService,
          useValue: FakeProviderAdminRoleService,
        },
        {
          provide: ComponentMasterServiceService,
          useValue: FakeComponentMasterServiceService,
        },
        {
          provide: ServicePointMasterService,
          useValue: FakeServicePointMasterService,
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
    fixture = TestBed.createComponent(ComponentMasterComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
