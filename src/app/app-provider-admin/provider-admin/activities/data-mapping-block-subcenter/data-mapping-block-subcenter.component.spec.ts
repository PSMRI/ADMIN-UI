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

import { DataMappingBlockSubcenterComponent } from './data-mapping-block-subcenter.component';
import { BlockSubcenterMappingService } from '../services/block-subcenter-mapping-service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

const FakeBlockSubcenterMappingService = {
  uploadData: (_reqObj?: any) => of({ statusCode: 200 }),
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = {
  uid: 'U1',
  uname: 'admin',
  userPriveliges: [],
  providerServiceMapID_104: 'PSM104',
};

describe('DataMappingBlockSubcenterComponent', () => {
  let component: DataMappingBlockSubcenterComponent;
  let fixture: ComponentFixture<DataMappingBlockSubcenterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [DataMappingBlockSubcenterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: BlockSubcenterMappingService,
          useValue: FakeBlockSubcenterMappingService,
        },
        {
          provide: ConfirmationDialogsService,
          useValue: FakeConfirmationDialogsService,
        },
        { provide: dataService, useValue: FakeDataService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataMappingBlockSubcenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
