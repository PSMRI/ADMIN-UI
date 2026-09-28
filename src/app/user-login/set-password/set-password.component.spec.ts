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
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';

import { SetPasswordComponent } from './set-password.component';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { loginService } from '../loginService/login.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => undefined,
};

const FakeLoginService = {
  transactionId: 'txn-1',
  removeTokenFromRedis: () => ({ subscribe: (_cb?: any) => undefined }),
};

const FakeDataService = {
  userNameForReset: 'testuser',
};

const fakeRouterService = {
  navigate: jasmine.createSpy('navigate'),
};

describe('SetPasswordComponent', () => {
  let component: SetPasswordComponent;
  let fixture: ComponentFixture<SetPasswordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SetPasswordComponent],
      imports: [HttpClientTestingModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        ConfigService,
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: loginService, useValue: FakeLoginService },
        { provide: dataService, useValue: FakeDataService },
        { provide: Router, useValue: fakeRouterService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
