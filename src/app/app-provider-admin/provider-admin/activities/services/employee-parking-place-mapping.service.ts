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
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { ConfigService } from 'src/app/core/services/config/config.service';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// import { InterceptedHttp } from '../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class EmployeeParkingPlaceMappingService {
  headers = new Headers(
    { 'Content-Type': 'application/json' },
    //  ,{'Access-Control-Allow-Headers': 'X-Requested-With, content-type'}
    //   ,{'Access-Control-Allow-Origin': 'localhost:4200'}
    //  ,{'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS'}
    //  ,{'Access-Control-Allow-Methods': '*'}
  );
  option: any = { headers: this.headers };

  constructor(
    private http: HttpClient,
    public basepaths: ConfigService,
  ) {}
  getServices(userID: any) {
    return this.http.post(environment._getServiceLineURL, { userID: userID });
  }

  getStates(userID: any, serviceID: any, isNationalFlag: any) {
    return this.http.post(environment._getStateListURL, {
      userID: userID,
      serviceID: serviceID,
      isNational: isNationalFlag,
    });
  }
  getZones(data: any) {
    return this.http.post(environment._getZonesURL, data);
  }

  getParkingPlaces(data: any) {
    return this.http.post(environment.getParkingPlacesURL, data);
    // .map(this.CommonSuccessHandler)
    // .catch(this.handleError);
  }

  DeleteEmpParkingMapping(requestObject: any) {
    return this.http.post(environment.deleteEmployeesURL, requestObject);
    // .map(this.handleSuccessForActivationUser)
    // .catch(this.handleError);
  }
  getUsernames(userObj: any) {
    return this.http.post(environment.getUsernamesURL, userObj);
    // .map(this.CommonSuccessHandler)
    // .catch(this.handleError);
  }

  getDesignations() {
    return this.http.post(environment.getDesignationsURL, {});
  }

  getEmployees(requestObject: any) {
    return this.http.post(environment.getEmployeesURL, requestObject);
  }
  getVans(reqObj: any) {
    return this.http.post(environment.getVansURL, reqObj);
  }

  saveEmployeeParkingPlaceMappings(data: any) {
    return this.http.post(environment.saveEmployeeParkingPlaceMappingURL, data);
  }
  getMappedVansList(userParkingPlaceMapID: any) {
    return this.http.post(
      environment.getMappedVansListURL + userParkingPlaceMapID,
      {},
    );
    // .map((res: Response) => res.json());
  }
  removeMappedVan(removeVanObj: any) {
    return this.http.post(environment.removeMappedVanURL, removeVanObj);
    // .map((res: Response) => res.json());
  }
  updateEmployeeParkingPlaceMappings(data: any) {
    return this.http.post(
      environment.updateEmployeeParkingPlaceMappingURL,
      data,
    );
  }

  /* User signature upload services*/
  getUserNameBasedOnDesig(reqObj: any) {
    return this.http.post(environment.getUsernamesBasedDesigUrl, reqObj);
  }
  checkUsersignatureExist(userID: any) {
    return this.http.get(environment.checkUsersignExistUrl + userID);
  }
  uploadSignature(signObj: any) {
    return this.http.post(environment.uploadSignUrl, signObj);
  }
  downloadSign(userID: any): Observable<HttpResponse<Blob>> {
    // let option = new RequestOptions({ responseType: ResponseContentType.Blob});
    return this.http.get(environment.downloadSignUrl + userID, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  activateOrDeActivateSignature(data: any) {
    return this.http.post(environment.signatureStatus, data);
  } 
}
