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
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { MultiRoleScreenComponent } from './multi-role-screen.component';
import { ConfigService } from '../core/services/config/config.service';
import { HttpServices } from '../core/services/http-services/http_services.service';
import { loginService } from '../user-login/loginService/login.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

describe('MultiRoleScreenComponent', () => {
  let component: MultiRoleScreenComponent;
  let fixture: ComponentFixture<MultiRoleScreenComponent>;

  const fakeRouter = {
    navigate: (_path?: any) => Promise.resolve(true),
  };

  const fakePlatformLocation = {
    onPopState: (_fn?: any) => undefined,
  };

  const fakeHttpServices = {
    getCommitDetails: (_url: string) => of({ version: '1.0.0', commit: 'abc' }),
    getData: (_path: string) => of({ english: {} }),
  };

  const fakeLoginService = {
    removeTokenFromRedis: () => of(true),
    getApiVersionDetails: () => of({}),
  };

  const fakeConfigService = {
    getCommonBaseURL: () => 'http://localhost/',
  };

  const fakeMatDialog = {
    open: () => ({ afterClosed: () => of(undefined) }),
  };

  const fakeSessionStorageService = {
    getItem: (_key: string) => JSON.stringify({}),
    removeItem: (_key: string) => undefined,
    setItem: (_key: string, _value?: any) => undefined,
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [MultiRoleScreenComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: Router, useValue: fakeRouter },
        { provide: PlatformLocation, useValue: fakePlatformLocation },
        { provide: HttpServices, useValue: fakeHttpServices },
        { provide: loginService, useValue: fakeLoginService },
        { provide: ConfigService, useValue: fakeConfigService },
        { provide: MatDialog, useValue: fakeMatDialog },
        { provide: SessionStorageService, useValue: fakeSessionStorageService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiRoleScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
