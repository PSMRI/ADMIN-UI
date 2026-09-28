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
import { SmsTemplateComponent } from './sms-template.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { CommonServices } from 'src/app/core/services/inventory-services/commonServices';
import { SmsTemplateService } from '../services/sms-template-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: SmsTemplateComponent;
let fixture: ComponentFixture<SmsTemplateComponent>;

const FakeCommonServices = {
  getServiceLines: (_userID: any) => of({ data: [] }),
  getStatesOnServices: (_userID: any, _serviceID: any, _isNational: any) =>
    of({ data: [] }),
};

const FakeSmsTemplateService = {
  getSMStemplates: (_providerServiceMapID: any) => of({ data: [] }),
  getSMStypes: (_serviceID: any) => of({ data: [] }),
  getSMSparameters: (_serviceID: any) => of({ data: [] }),
  updateSMStemplate: (_obj: any) => of({}),
  saveSMStemplate: (_obj: any) => of({}),
  getFullSMSTemplate: (_providerServiceMapID: any, _smsTemplateID: any) =>
    of({
      data: {
        smsParameterMaps: [],
        smsTemplateName: 'name',
        smsType: { smsType: 'type' },
        smsTemplate: 'template',
      },
    }),
};

const FakeDataService = {
  uid: 'uid1',
  uname: 'admin',
  Userdata: { userName: 'admin' },
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

function InitializeAdminTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SmsTemplateComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        { provide: SmsTemplateService, useValue: FakeSmsTemplateService },
        { provide: CommonServices, useValue: FakeCommonServices },
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
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(SmsTemplateComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });
}

describe('SmsTemplateComponent', () => {
  InitializeAdminTestBed();

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
