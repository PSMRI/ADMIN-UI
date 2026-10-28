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
// import { InterceptedHttp } from './../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class PhysicalstockService {
  admin_Base_Url: any;
  common_Base_Url: any;
  getStore_Url: any;
  getSubStore_Url: any;
  getItem_Url: any;
  saveStock_Url: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {
    this.admin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();
    this.getStore_Url = this.admin_Base_Url + 'getMainFacility';
    this.getSubStore_Url = this.admin_Base_Url + 'getsubFacility';
    this.getItem_Url = this.admin_Base_Url + 'getSubStoreitem';
    this.saveStock_Url = this.admin_Base_Url + 'physicalStockEntry';
  }

  getMainStore(obj: any) {
    return this.http.post(this.getStore_Url, obj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  getSubStore(obj: any) {
    return this.http.post(this.getSubStore_Url, obj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  getItem(obj: any) {
    return this.http.post(this.getItem_Url, obj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  savePhysicalStock(obj: any) {
    return this.http.post(this.saveStock_Url, obj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  // handleError(error: Response | any) {
  //     return Observable.throw(error.json());
  // }
  // handleSuccess(res: Response) {
  //     console.log(res.json().data, 'Physical stock entry success response');
  //     if (res.json().data) {
  //         return res.json().data;
  //     } else {
  //         return Observable.throw(res.json());
  //     }
  // }
}
