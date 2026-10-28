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
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { UserRoleAgentIDMappingComponent } from './user-role-agent-id-mapping.component';
import { UserRoleAgentID_MappingService } from '../services/user-role-agentID-mapping-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

const FakeUserRoleAgentID_MappingService = {
  getStates: (_userID: any, _serviceID: any, _isNational: any) =>
    of({ data: [{ providerServiceMapID: '1' }] }),
  getServices: (_userID: any) => of({ data: [{ serviceID: 1 }] }),
  getRoles: (_providerServiceMapID: any) => of({ data: [{ deleted: false }] }),
  getEmployees: (_request_obj: any) => of({ data: [] }),
  getAvailableCampaigns: (_providerServiceMapID: any) => of({ data: [] }),
  getAgentIDs: (_providerServiceMapID: any, _campaign_name: any) =>
    of({ data: [] }),
  mapAgentID: (_req_array: any) => of({}),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uid: '1',
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

const FakeMatDialog = {
  open: (_component: any, _config?: any) => ({
    afterClosed: () => of(undefined),
  }),
};

describe('UserRoleAgentIDMappingComponent', () => {
  let component: UserRoleAgentIDMappingComponent;
  let fixture: ComponentFixture<UserRoleAgentIDMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [UserRoleAgentIDMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: UserRoleAgentID_MappingService,
          useValue: FakeUserRoleAgentID_MappingService,
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
    fixture = TestBed.createComponent(UserRoleAgentIDMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
