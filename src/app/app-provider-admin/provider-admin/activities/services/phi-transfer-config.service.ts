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
export class PhiTransferConfigService {
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

  getAllDesignatedPhi() {
    return this.checkStatus(
      this.http.get(environment.phi_GetAllDesignatedPhi_Url),
    );
  }

  createDesignatedPhi(requestObj: any) {
    return this.checkStatus(
      this.http.post(environment.phi_CreateDesignatedPhi_Url, requestObj),
    );
  }

  updateDesignatedPhi(requestObj: any) {
    return this.checkStatus(
      this.http.post(environment.phi_UpdateDesignatedPhi_Url, requestObj),
    );
  }

  getDesignatedPhi(filters: {
    villageId?: any;
    tbuId?: any;
    designatedPhiId?: any;
  }) {
    const query: string[] = [];
    if (filters.villageId) query.push(`villageId=${filters.villageId}`);
    if (filters.tbuId) query.push(`tbuId=${filters.tbuId}`);
    if (filters.designatedPhiId)
      query.push(`designatedPhiId=${filters.designatedPhiId}`);
    const queryString = query.length ? `?${query.join('&')}` : '';
    return this.checkStatus(
      this.http.get(`${environment.phi_GetDesignatedPhi_Url}${queryString}`),
    );
  }
}
