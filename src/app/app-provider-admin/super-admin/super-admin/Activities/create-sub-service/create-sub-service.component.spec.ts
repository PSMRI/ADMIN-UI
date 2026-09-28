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
import { of } from 'rxjs';

import { CreateSubServiceComponent } from './create-sub-service.component';
import { BlockProvider } from 'src/app/core/services/adminServices/AdminServiceProvider/block-provider-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

describe('CreateSubServiceComponent', () => {
  let component: CreateSubServiceComponent;
  let fixture: ComponentFixture<CreateSubServiceComponent>;

  const fakeBlockProvider = {
    getAllProviders: () => of({ data: [] }),
    getStatesInServices: (_data?: any) => of({ data: [] }),
    getStates: (_serviceProviderID?: any) => of({ data: [] }),
    getServicesOfProvider: (_serviceProviderID?: any) => of({ data: [] }),
    getAllSubService: (_serviceID?: any) => of({ data: [] }),
    save_SubService: (_subServiceObj?: any) => of({ data: {} }),
    getSubServiceDetails: (_providerServiceMapID?: any) => of({ data: {} }),
    deleteSubService: (_obj?: any) => of({ data: {} }),
  };
  const providerForFakeBlockProvider = {
    provide: BlockProvider,
    useValue: fakeBlockProvider,
  };

  const fakeDataService = {
    uname: 'admin',
  };
  const providerForFakeDataService = {
    provide: dataService,
    useValue: fakeDataService,
  };

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };
  const providerForFakeConfirmationDialogsService = {
    provide: ConfirmationDialogsService,
    useValue: fakeConfirmationDialogsService,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreateSubServiceComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        providerForFakeBlockProvider,
        providerForFakeDataService,
        providerForFakeConfirmationDialogsService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    // Deliberately not calling fixture.detectChanges(): the real template
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic.
    fixture = TestBed.createComponent(CreateSubServiceComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
