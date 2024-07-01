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
//import { Observable } from 'rxjs/Observable';
import { ConfigService } from '../config/config.service';
import { environment } from 'src/environments/environment';
//import { InterceptedHttp } from './../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

/**
 * Author: Diamond Khanna ( 352929 )
 * Date: 11-10-2017
 * Objective: # A service which would handle the AGENT LIST services.
 */

@Injectable()
export class FacilityMasterService {
  admin_Base_Url: any;
  common_Base_Url: any;

  get_State_Url: any;
  get_Service_Url: any;
  get_facilities_Url: any;
  save_facilities_Url: any;
  update_facilities_Url: any;
  delete_facilities_Url: any;

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {
    this.admin_Base_Url = this.basepaths.getAdminBaseUrl();
    this.common_Base_Url = this.basepaths.getCommonBaseURL();

    this.get_State_Url = this.admin_Base_Url + 'm/role/stateNew';
    this.get_Service_Url = this.admin_Base_Url + 'm/role/serviceNew';
    this.get_facilities_Url = this.admin_Base_Url + 'getFacility';
    this.save_facilities_Url = this.admin_Base_Url + 'addFacility';
    this.update_facilities_Url = this.admin_Base_Url + 'editFacility';
    this.delete_facilities_Url = this.admin_Base_Url + 'deleteFacility';
  }
  getfacilities(providerServiceMapID: any) {
    return this.http.post(environment.get_facilities_Url, {
      providerServiceMapID: providerServiceMapID,
    });
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
  deleteFacility(deleteObj: any) {
    return this.http.post(environment.delete_facilities_Url, deleteObj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  savefacilities(obj: any) {
    return this.http.post(environment.save_facilities_Url, obj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }
  updateFacility(editobj: any) {
    return this.http.post(environment.update_facilities_Url, editobj);
    // .map(this.handleSuccess)
    //     .catch(this.handleError);
  }

  getServices(userID: any) {
    return this.http.post(environment.get_Service_new_Url, {
      userID: userID,
    });
    // .map(this.handleState_n_ServiceSuccess)
    // .catch(this.handleError);
  }
  getStates(userID: any, serviceID: any, isNational: any) {
    return this.http.post(environment.get_State_new_Url, {
      userID: userID,
      serviceID: serviceID,
      isNational: isNational,
    });
    // .map(this.handleSuccess)
    // .catch(this.handleError);
  }
}
