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
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigService } from '../config/config.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class FacilityHierarchyService {
  private facilityList: any[] = [];

  constructor(
    private http: HttpClient,
    private basepaths: ConfigService,
  ) {}

  getFacilities(): any[] {
    // TODO: Replace with API call when ready
    // return this.http.post(environment.getFacilityHierarchyUrl, {});
    return this.facilityList;
  }

  addFacility(facility: any): void {
    // TODO: Replace with API call when ready
    // return this.http.post(environment.saveFacilityHierarchyUrl, facility);
    this.facilityList.push(facility);
  }

  updateFacility(index: number, facility: any): void {
    // TODO: Replace with API call when ready
    // return this.http.post(environment.updateFacilityHierarchyUrl, facility);
    if (index >= 0 && index < this.facilityList.length) {
      this.facilityList[index] = facility;
    }
  }

  deleteFacility(index: number): void {
    // TODO: Replace with API call when ready
    // return this.http.post(environment.deleteFacilityHierarchyUrl, {});
    if (index >= 0 && index < this.facilityList.length) {
      this.facilityList.splice(index, 1);
    }
  }
}
