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

import { ParkingPlaceSubDistrictMappingComponent } from './parking-place-sub-district-mapping.component';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ParkingPlaceMasterService } from 'src/app/core/services/ProviderAdminServices/parking-place-master-services.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

const FakeParkingPlaceMasterService = {
  getServiceLinesNew: (_userID?: any) => of({ data: [{ serviceID: 2 }] }),
  getStatesNew: (_obj?: any) => of({ data: [] }),
  getZones: (_data?: any) => of({ data: [] }),
  getParkingPlaces: (_data?: any) => of({ data: [] }),
  getAllParkingPlaceSubDistrictMapping: (_obj?: any) => of({ data: [] }),
  getDistricts: (_zoneID?: any) => of({ data: [] }),
  getTaluks: (_districtID?: any) => of({ data: [] }),
  filterMappedTaluks: (_obj?: any) => of({ data: [] }),
  saveParkingPlaceSubDistrictMapping: (_reqObj?: any) => of({}),
  updateTalukMapping: (_obj?: any) => of({}),
  mappingActivationDeactivation: (_obj?: any) => of({}),
};

const FakeDataService = {
  uid: 'U1',
  uname: 'admin',
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

describe('ParkingPlaceSubDistrictMappingComponent', () => {
  let component: ParkingPlaceSubDistrictMappingComponent;
  let fixture: ComponentFixture<ParkingPlaceSubDistrictMappingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ParkingPlaceSubDistrictMappingComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        { provide: dataService, useValue: FakeDataService },
        {
          provide: ParkingPlaceMasterService,
          useValue: FakeParkingPlaceMasterService,
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
    // imported here, and these tests only exercise component logic, not
    // the rendered DOM. ngOnInit is run explicitly instead.
    fixture = TestBed.createComponent(ParkingPlaceSubDistrictMappingComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
