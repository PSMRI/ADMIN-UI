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
 *'
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
// import { InterceptedHttp } from "app/http.interceptor";
// import { SecurityInterceptedHttp } from "app/http.securityinterceptor";
import { Observable, map, throwError } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { environment } from 'src/environments/environment';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Injectable()
export class BlockSubcenterMappingService {
  admin_Base_Url: any;
  common_Base_Url: any;
  getBlockSubcentreDataUploadUrl: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
    private sessionStorage: SessionStorageService,
  ) {
    this.admin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();

    this.getBlockSubcentreDataUploadUrl =
      this.admin_Base_Url + 'uptsu/saveFacility';
  }

  uploadData(formData: any) {
    return this.http.post(environment.getBlockSubcentreDataUploadUrl, formData);
  }

  memberBulkUploadXML(formData: any) {
    const userName =
      this.sessionStorage.getItem('uname') ||
      this.sessionStorage.getItem('userName') ||
      '';

      const serviceProviderID =
            this.sessionStorage.getItem('providerServiceID') ||
            this.sessionStorage.getItem('providerServiceID') ||
            '';

            const serviceProviderMapID =
                        this.sessionStorage.getItem('providerServiceID') ||
                        this.sessionStorage.getItem('providerServiceID') ||
                        '';
    const params = new HttpParams()
        .set('userName', userName)
        .set('serviceProviderID', serviceProviderID)
        .set('serviceProviderMapID', serviceProviderMapID);
    return this.http.post(environment.getXMLDataUploadUrl, formData, {
      params,
    });
  }

  downloadErrorExcel(): Observable<Blob> {
    return this.http.get(environment.getDataUploadErrorExcel, {
      responseType: 'blob', // Important to specify that the response is a Blob
    });
  }

  handleError(error: Response | any) {
    return throwError(error);
  }

  onSuccess(response: any) {
    if (response) {
      return response;
    }
  }
}
