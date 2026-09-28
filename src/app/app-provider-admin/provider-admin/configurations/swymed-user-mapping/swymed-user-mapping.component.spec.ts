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
import { SwymedUserMappingComponent } from './swymed-user-mapping.component';
import { SwymedUserConfigurationService } from '../services/swymed-user-service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

let component: SwymedUserMappingComponent;
let fixture: ComponentFixture<SwymedUserMappingComponent>;

const FakeSwymedUserConfigurationService = {
  getSwymedUserDetails: (_serviceProviderID: any) => of({ data: [] }),
  getAllDesignations: () => of({ data: [] }),
  getUserName: (_designationID: any, _serviceProviderID: any) =>
    of({ data: [] }),
  getVideoConsultationDomain: (_serviceProviderID: any) => of({ data: [] }),
  saveSwymedUserDetails: (_obj: any) => of({ statusCode: 200 }),
  updateUserDetails: (_obj: any) => of({ statusCode: 200 }),
  mappingActivationDeactivation: (
    _userVideoConsultationMapID: any,
    _flag: any,
    _modifiedBy: any,
  ) => of({ statusCode: 200 }),
};

const FakeDataService = {
  uid: 'uid1',
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const sessionValues: Record<string, any> = {
  service_providerID: 'serviceProviderID',
  uname: 'admin',
};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SwymedUserMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: SwymedUserConfigurationService,
          useValue: FakeSwymedUserConfigurationService,
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
    // relies on mat-table/matPaginator directives whose modules aren't
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(SwymedUserMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('SwymedUserMappingComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
