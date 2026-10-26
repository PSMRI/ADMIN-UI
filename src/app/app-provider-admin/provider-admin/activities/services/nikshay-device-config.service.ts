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
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable()
export class NikshayDeviceConfigService {
  constructor(private http: HttpClient) {}

  private checkStatus(request: Observable<any>) {
    return request.pipe(
      map((response: any) => {
        if (!response || response.statusCode !== 200) {
          throw { errorMessage: response?.errorMessage || 'Request failed' };
        }
        return response;
      }),
    );
  }

  getStates() {
    return this.checkStatus(this.http.get(environment.nikshay_GetStates_Url));
  }

  getDistricts(stateID: any) {
    return this.checkStatus(
      this.http.get(
        `${environment.nikshay_GetDistricts_Url}?stateID=${stateID}`,
      ),
    );
  }

  getTUs(districtID: any) {
    return this.checkStatus(
      this.http.get(
        `${environment.nikshay_GetTUs_Url}?districtID=${districtID}`,
      ),
    );
  }

  getFacilities(tuIDs: any) {
    return this.checkStatus(
      this.http.get(`${environment.nikshay_GetFacilities_Url}?tuIDs=${tuIDs}`),
    );
  }

  getVillages(facilityIDs: any) {
    return this.checkStatus(
      this.http.get(
        `${environment.nikshay_GetVillages_Url}?facilityIDs=${facilityIDs}`,
      ),
    );
  }

  enrollDevice(requestObj: any) {
    return this.checkStatus(
      this.http.post(environment.nikshay_EnrollDevice_Url, requestObj),
    );
  }

  linkDeviceToVillage(requestObj: any) {
    return this.checkStatus(
      this.http.post(environment.nikshay_LinkDeviceToVillage_Url, requestObj),
    );
  }

  listDevices() {
    return this.checkStatus(this.http.get(environment.nikshay_ListDevices_Url));
  }

  searchDevice(deviceId: any) {
    return this.checkStatus(
      this.http.get(
        `${environment.nikshay_SearchDevice_Url}?deviceId=${deviceId}`,
      ),
    );
  }
}
