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
import { Observable } from 'rxjs';
import { ConfigService } from '../config/config.service';

@Injectable()
export class UpdateVillageService {
  adminBaseUrl: any;
  commonBaseUrl: any;
  getUserListUrl: any;
  getUserDetailUrl: any;
  getUserRoleMappedUrl: any;
  getStatesUrl: any;
  getDistrictsUrl: any;
  getBlocksUrl: any;
  getVillagesUrl: any;
  getFacilityVillagesUrl: any;
  getFacilitiesByBlockUrl: any;
  updateVillageUrl: any;

  constructor(
    private http: HttpClient,
    private basepaths: ConfigService,
  ) {
    this.adminBaseUrl = this.basepaths.getAdminBaseUrl();
    this.commonBaseUrl = this.basepaths.getCommonBaseURL();

    this.getUserListUrl = this.adminBaseUrl + 'm/SearchEmployee4';
    this.getUserDetailUrl =
      this.adminBaseUrl + 'm/FindEmployeeDetailsByUserName';
    this.getUserRoleMappedUrl = this.adminBaseUrl + 'getUserRoleMapped';
    this.getStatesUrl = this.commonBaseUrl + 'location/states/';
    this.getDistrictsUrl = this.commonBaseUrl + 'location/districts/';
    this.getBlocksUrl = this.commonBaseUrl + 'location/taluks/';
    this.getVillagesUrl = this.commonBaseUrl + 'location/village/';
    this.getFacilitiesByBlockUrl = this.adminBaseUrl + 'getFacilitiesByBlock';
    this.getFacilityVillagesUrl =
      this.adminBaseUrl + 'getVillageMappingsByFacility';
    this.updateVillageUrl = this.adminBaseUrl + 'villageMapping/updateVillage';
  }

  getUserList(serviceProviderID: any): Observable<any> {
    return this.http.post(this.getUserListUrl, {
      serviceProviderID: serviceProviderID,
    });
  }

  getUserDetail(userName: any): Observable<any> {
    return this.http.post(this.getUserDetailUrl, { userName: userName });
  }

  getUserRoleMapped(serviceProviderID: any): Observable<any> {
    return this.http.post(this.getUserRoleMappedUrl, {
      serviceProviderID: serviceProviderID,
    });
  }

  getStates(countryID: any): Observable<any> {
    return this.http.get(this.getStatesUrl + countryID);
  }

  getDistricts(stateID: any): Observable<any> {
    return this.http.get(this.getDistrictsUrl + stateID);
  }

  getBlocks(districtID: any): Observable<any> {
    return this.http.get(this.getBlocksUrl + districtID);
  }

  getVillages(blockID: any): Observable<any> {
    return this.http.get(this.getVillagesUrl + blockID);
  }

  getFacilitiesByBlock(blockID: any): Observable<any> {
    return this.http.post(this.getFacilitiesByBlockUrl, { blockID: blockID });
  }

  getFacilityVillages(facilityID: any): Observable<any> {
    return this.http.post(this.getFacilityVillagesUrl, {
      facilityID: facilityID,
    });
  }

  updateVillage(updateObject: any): Observable<any> {
    return this.http.post(this.updateVillageUrl, updateObject);
  }
}
