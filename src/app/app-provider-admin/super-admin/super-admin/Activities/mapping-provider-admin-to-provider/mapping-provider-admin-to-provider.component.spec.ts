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
import { MappingProviderAdminToProviderComponent } from './mapping-provider-admin-to-provider.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';

let component: MappingProviderAdminToProviderComponent;
let fixture: ComponentFixture<MappingProviderAdminToProviderComponent>;

const FakeDataService = {
  uname: 'admin',
  service_providerID: 'SP1',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeSuperAdmin_ServiceProvider_Service = {
  getAllMappedProviders: () => of({ data: [{ userID: '1', userName: 'RO' }] }),
  getAllProviderAdmins: () => of({ data: [{ userID: '1', userName: 'RO' }] }),
  getAllProvider: () =>
    of({ data: [{ serviceProviderID: '1', serviceProviderName: 'RO' }] }),
  createMappingProviderAdmin: (_data: any) => of({}),
  activateProviderAdmin: (_data: any) => of({}),
  deactivateProviderAdmin: (_data: any) => of({}),
  updateProviderAdminDetails: (_data: any) => of({}),
  getProviderServices: (_serviceProviderID: any) => of({ data: [] }),
  getProviderStatesInService: (_serviceProviderID: any, _serviceID: any) =>
    of({ data: [] }),
};

function Initialize104TestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MappingProviderAdminToProviderComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: SuperAdmin_ServiceProvider_Service,
          useValue: FakeSuperAdmin_ServiceProvider_Service,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic.
    fixture = TestBed.createComponent(MappingProviderAdminToProviderComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}
describe('Mapping-Provider-Admin-To-Provider', () => {
  describe('When the component is getting loaded, then ngOnInit', () => {
    Initialize104TestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });
    it('should be defined', () => {
      expect(component).toBeDefined();
    });
    it('checking the value of Providers list array should not be null and should have some value', () => {
      expect(component.service_provider_array).not.toEqual([]);
    });
    it('checking the value of service_provider_admin_array should not be null and should have some value', () => {
      expect(component.service_provider_admin_array).not.toEqual([]);
    });
    it('checking the value of providerAdminList should not be null and should have some value', () => {
      expect(component.providerAdminList).not.toEqual([]);
    });
  });
});
