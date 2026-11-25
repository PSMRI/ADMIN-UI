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
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { HttpInterceptorService } from 'src/app/core/services/httpInterceptor/http-interceptor.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProviderAdminRoleService {
  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {}

  getStates(serviceProviderID: any) {
    return this.http.post(environment.getStates_new_url, {
      serviceProviderID: serviceProviderID,
    });
  }

  getStatesNew(obj: any) {
    return this.http.post(environment.getStates_new_url, obj);
  }
  getServices(serviceProviderID: any, stateID: any) {
    return this.http.post(environment.get_Service_Url, {
      serviceProviderID: serviceProviderID,
      stateID: stateID,
    });
  }
  getServices_filtered(serviceProviderID: any, stateID: any) {
    return this.http.post(environment.get_Service_Url, {
      serviceProviderID: serviceProviderID,
      stateID: stateID,
    });
  }
  getServiceLinesNew(userID: any) {
    return this.http.post(environment.getServiceLines_new_url, {
      userID: userID,
    });
  }

  getServiceLinesCalibrationNew(userID: any) {
    return this.http.post(environment.getServiceLines_new_url, {
      userID: userID,
    });
  }

  getFeature(serviceID: any) {
    return this.http.post(environment.getFeaturesUrl, { serviceID: serviceID });
  }

  getRoles(obj: any) {
    return this.http.post(environment.find_Roles_By_State_Service_Url, obj);
  }
  getRole(obj: any) {
    return this.http.post(environment.find_Roles_By_State_Service_Url, obj);
  }

  createRoles(roles_array: any) {
    return this.http.post(environment.create_Roles_Url, roles_array);
  }

  deleteRole(obj: any) {
    console.log('service obj', obj);
    return this.http.post(environment.delete_Role_Url, obj);
  }

  editRole(modified_Role_Object: any) {
    return this.http.post(environment.edit_Role_Url, modified_Role_Object);
  }

  updateFeatureToRole(requestArray: any) {
    return this.http.post(environment.updateFeatureToRole_Url, requestArray);
  }

  handleSuccess(res: any) {
    console.log(res.data, 'role service file success response');
    if (res.data) {
      return res.data;
    } else {
      return throwError(() => new Error(res));
    }
  }

  handleState_n_ServiceSuccess(response: any) {
    console.log(response.data, 'role service file success response');
    let result = [];
    result = response.data.filter(function (item: any) {
      if (item.statusID !== 4) {
        return item;
      }
    });
    return result;
  }

  handleState_n_ServiceSuccessCalibration(response: any) {
    console.log(response.data, 'service point file success response');
    let result = [];
    result = response.data.filter(function (item: any) {
      if (
        item.serviceID === 2 ||
        item.serviceID === 4 ||
        item.serviceID === 9 ||
        item.serviceID === 12
      ) {
        return item;
      }
    });
    return result;
  }

  handleState_n_ServiceSuccess_role(response: any) {
    console.log(response.data, 'role service file success response');
    let result = [];
    result = response.data.filter(function (item: any) {
      if (item.deleted !== true) {
        return item;
      }
    });
    return result;
  }
  handleService_n_ServiceSuccess(response: any) {
    console.log(response.data, 'role service file success response');
    let result = [];
    result = response.data.filter(function (item: any) {
      if (item.serviceName === 'MMU') {
        return item;
      }
    });
    return result;
  }

  handleError(error: any) {
    return throwError(() => new Error(error));
  }
}
