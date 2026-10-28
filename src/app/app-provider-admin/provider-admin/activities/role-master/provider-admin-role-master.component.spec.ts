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
import { RoleMasterComponent } from './provider-admin-role-master.component';
import { ProviderAdminRoleService } from '../services/state-serviceline-role.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

let component: RoleMasterComponent;
let fixture: ComponentFixture<RoleMasterComponent>;

const FakeProviderAdminRoleService = {
  getServiceLinesNew: (_userID: any) =>
    of({ data: [{ serviceID: 1, serviceName: 'MMU' }] }),
  getStatesNew: (_obj: any) => of({ data: [] }),
  getFeature: (_serviceID: any) => of({ data: [] }),
  getRole: (_obj: any) => of({ data: [] }),
  createRoles: (_roles: any) => of({ data: [] }),
  deleteRole: (_obj: any) => of({}),
  editRole: (_obj: any) => of({}),
  updateFeatureToRole: (_arr: any) => of([]),
};

const FakeDataService = {
  uid: 'U1',
  uname: 'admin',
  provider_serviceMapID: null,
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'SP1',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [RoleMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: ProviderAdminRoleService,
          useValue: FakeProviderAdminRoleService,
        },
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: SessionStorageService, useValue: FakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on matSort/matPaginator/mat-table directives whose modules
    // aren't imported here, and these tests only exercise component logic.
    fixture = TestBed.createComponent(RoleMasterComponent);
    component = fixture.componentInstance;
  });
}

describe('RoleMasterComponent', () => {
  initTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should read serviceProviderID from session storage on construction', () => {
    expect(component.serviceProviderID).toBe('SP1');
  });

  it('should set userID from commonDataService and load service lines on ngOnInit', () => {
    component.ngOnInit();
    expect(component.userID).toBe('U1');
    expect(component.services).toEqual([{ serviceID: 1, serviceName: 'MMU' }]);
  });
});
