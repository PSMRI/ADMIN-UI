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
// import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../config/config.service';
// import { InterceptedHttp } from './../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class ExpiryAlertConfigurationService {
  admin_Base_Url: any;
  common_Base_Url: any;
  getItemsCategoryUrl: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {
    this.admin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();
  }

  getAllItemsCategory(serviceMapID: string, flag: string) {
    console.log('serviceMapID', serviceMapID, flag);
    this.getItemsCategoryUrl =
      this.admin_Base_Url + 'getItemCategory/' + serviceMapID + '/' + flag;
    return this.http.get(this.getItemsCategoryUrl);
    // .map(this.handleSuccess)
    // .catch(this.handleError)
  }
  // handleError(error: Response | any) {
  //     return Observable.throw(error.json());
  // }
  // handleSuccess(res: Response) {
  //     console.log(res.json().data, 'Expiry Date Alert file success response');
  //     if (res.json().data) {
  //         return res.json().data;
  //     } else {
  //         return Observable.throw(res.json());
  //     }
  // }
}
