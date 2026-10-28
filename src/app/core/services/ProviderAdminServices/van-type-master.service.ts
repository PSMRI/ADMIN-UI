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
import {
  HttpClient,
  HttpResponse,
  HttpHeaders,
  HttpParamsOptions,
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { ConfigService } from '../config/config.service';
import { HttpInterceptor } from '@angular/common/http';
//  import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class VanTypeMasterService {
  headers = new Headers({ 'Content-Type': 'application/json' });

  providerAdmin_Base_Url: any;
  common_Base_Url: any;

  //CRUD
  saveVanTypesURL: any;
  getVanTypesURL: any;
  updateVanTypeStatusURL: any;

  _getStateListBYServiceIDURL: any;
  _getServiceLineURL: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
    private httpIntercept: HttpInterceptor,
  ) {
    this.providerAdmin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();

    this.saveVanTypesURL =
      this.providerAdmin_Base_Url + 'vanMaster/save/vanTypeDetails';
    this.getVanTypesURL =
      this.providerAdmin_Base_Url + 'vanMaster/get/vanTypes';
    this.updateVanTypeStatusURL =
      this.providerAdmin_Base_Url + 'vanMaster/remove/vanTypeDetails';

    this._getStateListBYServiceIDURL =
      this.providerAdmin_Base_Url + 'm/location/getStatesByServiceID';
    this._getServiceLineURL = this.providerAdmin_Base_Url + 'm/role/service';
  }

  saveVanType(data: any) {
    return this.http.post(this.saveVanTypesURL, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  getVanTypes(data: any) {
    return this.http.post(this.getVanTypesURL, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  updateVanTypeStatus(data: any) {
    return this.http.post(this.updateVanTypeStatusURL, data);
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  getStatesByServiceID(serviceID: any, serviceProviderID: any) {
    return this.http.post(this._getStateListBYServiceIDURL, {
      serviceID: serviceID,
      serviceProviderID: serviceProviderID,
    });
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  getServices(serviceProviderID: any, stateID: any) {
    return this.http.post(this._getServiceLineURL, {
      serviceProviderID: serviceProviderID,
      stateID: stateID,
    });
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }

  handleSuccess(response: Response) {
    // console.log(response.json().data, "--- in zone master SERVICE");
    if (response) {
      return response;
    } else {
      // return Observable.throw(response.json());
      throw new Error(response);
    }
  }

  handleError(error: Response | any) {
    // return Observable.throw(error.json());
    throw new Error(error);
  }
}
