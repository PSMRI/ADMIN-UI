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
// import { InterceptedHttp } from '../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProcedureMasterServiceService {
  providerAdmin_Base_Url: any;
  common_Base_Url: any;

  _getProcedureListURL: any;
  _postProcedureURL: any;
  _updateProcedureURL: any;
  _toggleProcedureURL: any;
  _iotProcedureURL: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {
    this.providerAdmin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();
    this._postProcedureURL =
      this.providerAdmin_Base_Url + 'labModule/createProcedureMaster';
    this._getProcedureListURL =
      this.providerAdmin_Base_Url + 'labModule/fetchProcedureMaster/';
    this._toggleProcedureURL =
      this.providerAdmin_Base_Url + 'labModule/updateProcedureStatus';
    this._updateProcedureURL =
      this.providerAdmin_Base_Url + 'labModule/updateProcedureMaster';
    this._iotProcedureURL =
      this.providerAdmin_Base_Url + 'diagnostics/getDiagnosticProcedure';
  }

  getCurrentProcedures(providerServiceMapID: any) {
    return this.http.get(
      `${environment._getProcedureListURL}${providerServiceMapID}`,
    );
    // .map(this.handleSuccess)
    //   .catch(this.handleError);
  }

  postProcedureData(reqObject: any) {
    return this.http.post(environment._postProcedureURL, reqObject);
    // .map(this.handleSuccess)
    //   .catch(this.handleError);
  }

  updateProcedureData(reqObject: any) {
    return this.http.post(environment._updateProcedureURL, reqObject);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  toggleProcedure(reqObject: any) {
    return this.http.post(environment._toggleProcedureURL, reqObject);
  }

  getDiagnosticProcedure() {
    return this.http.post(environment._iotProcedureURL, {});
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
}
