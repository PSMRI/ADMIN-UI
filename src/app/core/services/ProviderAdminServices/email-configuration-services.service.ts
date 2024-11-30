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
// import { InterceptedHttp } from '../../http.interceptor';
import { ConfigService } from '../config/config.service';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class EmailConfigurationService {
  adminBaseUrl: any;
  commonBaseUrl: any;
  getMailConfigUrl: any;
  getServiceLinesUrl: any;
  getStatesUrl: any;
  getDistrictURL: any;
  getInstituteTypesUrl: any;
  getDesignationsUrl: any;
  getTalukUrl: any;
  saveMailConfigUrl: any;
  updateMailConfigUrl: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {
    this.adminBaseUrl = this.basepaths.getAdminBaseUrl();
    this.commonBaseUrl = this.basepaths.getCommonBaseURL();
    this.getMailConfigUrl = this.adminBaseUrl + 'getEmailConfigs';
    this.getServiceLinesUrl = this.adminBaseUrl + 'm/role/serviceNew';
    this.getStatesUrl = this.adminBaseUrl + 'm/role/stateNew';
    this.getDistrictURL = this.commonBaseUrl + 'location/districts/';
    this.getInstituteTypesUrl =
      this.commonBaseUrl + '/institute/getInstituteTypes';
    this.getDesignationsUrl = this.commonBaseUrl + '/institute/getDesignations';
    this.getTalukUrl = this.commonBaseUrl + 'location/taluks/';
    this.saveMailConfigUrl = this.adminBaseUrl + '/saveConfig';
    this.updateMailConfigUrl = this.adminBaseUrl + '/updateEmailConfig';
  }
  getMailConfig(data: any) {
    return this.http.post(this.getMailConfigUrl, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  getServiceLines(userID: any) {
    return this.http.post(this.getServiceLinesUrl, { userID: userID });
    // .map(this.handleState_n_ServiceSuccess)
    // .catch(this.handleError);
  }
  getStates(obj: any) {
    return this.http.post(this.getStatesUrl, obj);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  getDistricts(stateId: number) {
    return this.http.get(this.getDistrictURL + stateId);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  getAllDesignations() {
    return this.http.get(this.getDesignationsUrl, {});
    // .map(this.handleSuccess)
    // .catch(this.handleError)
  }
  getTaluks(districtID: any) {
    return this.http.get(this.getTalukUrl + districtID);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  saveMailConfig(data: any) {
    return this.http.post(this.saveMailConfigUrl, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  updateMailConfig(data: any) {
    return this.http.post(this.updateMailConfigUrl, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  emailActivationDeactivation(data: any) {
    return this.http.post(this.updateMailConfigUrl, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  // handleSuccess(res: Response) {
  //     console.log(res.json().data, 'Email configuration success response');
  //     if (res.json().data) {
  //         return res.json().data;
  //     } else {
  //         return Observable.throw(res.json());
  //     }
  // }
  // handleState_n_ServiceSuccess(response: Response) {

  // 	console.log(response.json().data, 'Email configuration success response');
  // 	let result = [];
  // 	result = response.json().data.filter(function (item) {
  // 		if (item.serviceID === 3 || item.serviceID === 1 || item.serviceID === 6) {
  // 			return item;
  // 		}
  // 	});
  // 	return result;
  // }
  // handleError(error: Response | any) {
  //     return Observable.throw(error.json());
  // }
}
