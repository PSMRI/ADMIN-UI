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
import { MatMenuModule } from '@angular/material/menu';
import { of } from 'rxjs';

import { ProviderAdminComponent } from './provider-admin.component';
import { ConfirmationDialogsService } from '../../core/services/dialog/confirmation.service';
import { HttpServices } from '../../core/services/http-services/http_services.service';

describe('ProviderAdminComponent', () => {
  let component: ProviderAdminComponent;
  let fixture: ComponentFixture<ProviderAdminComponent>;

  const fakeConfirmationDialogsService = {
    alert: (_msg?: any, _type?: any) => undefined,
    confirm: (_title?: any, _msg?: any) => of(true),
  };

  const fakeHttpServices = {
    getCommitDetails: (_url: string) => of({ version: '1.0.0' }),
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProviderAdminComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [MatMenuModule],
      providers: [
        {
          provide: ConfirmationDialogsService,
          useValue: fakeConfirmationDialogsService,
        },
        { provide: HttpServices, useValue: fakeHttpServices },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
