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

import { ProvideCtiMappingComponent } from './provide-cti-mapping.component';
import { BlockProvider } from 'src/app/core/services/adminServices/AdminServiceProvider/block-provider-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { CallServices } from 'src/app/core/services/callservices/callservice.service';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';

describe('ProvideCtiMappingComponent', () => {
  let component: ProvideCtiMappingComponent;
  let fixture: ComponentFixture<ProvideCtiMappingComponent>;

  const fakeBlockProvider = {
    getAllProviders_CTI: () => of({ data: [] }),
  };

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };

  const fakeDataService = {
    uname: 'admin',
  };

  const fakeCallServices = {
    getAllMappedServicelinesAndStates: (_serviceProviderID?: any) =>
      of({ data: [] }),
    getStates: (_userID?: any, _serviceID?: any, _isNational?: any) =>
      of({ data: [] }),
    getCampaign: (_serviceName?: any) => of({ data: [] }),
    addCampaign: (_campaignObj?: any) => of({ data: {} }),
    editCampaign: (_campaignObj?: any) => of({ data: {} }),
  };

  const fakeSuperAdminServiceProviderService = {};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProvideCtiMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: BlockProvider, useValue: fakeBlockProvider },
        {
          provide: ConfirmationDialogsService,
          useValue: fakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: fakeDataService },
        { provide: CallServices, useValue: fakeCallServices },
        {
          provide: SuperAdmin_ServiceProvider_Service,
          useValue: fakeSuperAdminServiceProviderService,
        },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives and template-driven
    // #form/#mappingCampaign whose modules aren't imported here, and these
    // tests only exercise component logic.
    fixture = TestBed.createComponent(ProvideCtiMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
