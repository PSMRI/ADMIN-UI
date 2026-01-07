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
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';
// import { InterceptedHttp } from '../../http.interceptor';
// import { SecurityInterceptedHttp } from '../../http.securityinterceptor';
import { ConfigService } from '../../../../core/services/config/config.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class EmployeeMasterNewServices {
  // Base Urls
  providerAdmin_base_url: any;
  common_base_url: any;

  // Urls - Fetching dropdown related data
  // getAllTitlesUrl: any;
  // getAllGendersUrl: any;
  getAllUsersUrl: any;
  getAllDesignationsUrl: any;
  getAllMaritalStatusesUrl: any;
  getAllQualificationsUrl: any;
  getRegistrationDataUrl: any;
  getAllCommunitiesUrl: any;
  getAllReligionsUrl: any;
  getAllStatesUrl: any;
  getAllDistrictsUrl: any;
  checkUserAvailabilityUrl: any;
  checkID: any;
  createNewUserUrl: any;
  editUserDetailsUrl: any;
  userActivationDeactivationUrl: any;
  checkEmpIdAvailabilityUrl: any;

  constructor(
    private http: HttpClient,
    public basePaths: ConfigService,
  ) {
    this.providerAdmin_base_url = this.basePaths.getAdminBaseUrl();
    this.common_base_url = this.basePaths.getCommonBaseURL();

    // APIs - For Employee Master New
    this.getRegistrationDataUrl =
      this.common_base_url + 'beneficiary/getRegistrationData';
    this.checkUserAvailabilityUrl =
      this.providerAdmin_base_url + 'm/FindEmployeeByName';
    this.getAllUsersUrl = this.providerAdmin_base_url + 'm/SearchEmployee4';
    this.getAllDesignationsUrl =
      this.providerAdmin_base_url + 'm/getDesignation';
    this.getAllMaritalStatusesUrl =
      this.common_base_url + 'beneficiary/getRegistrationDataV1';
    this.getAllQualificationsUrl =
      this.providerAdmin_base_url + 'm/Qualification';
    this.getAllCommunitiesUrl = this.providerAdmin_base_url + 'getCommunity';
    this.getAllReligionsUrl = this.providerAdmin_base_url + 'getReligion';
    this.getAllStatesUrl = this.common_base_url + 'location/states/';
    this.getAllDistrictsUrl = this.common_base_url + 'location/districts/';
    this.checkID = this.providerAdmin_base_url + 'm/FindEmployeeDetails';
    this.createNewUserUrl = this.providerAdmin_base_url + 'createNewUser';
    this.editUserDetailsUrl = this.providerAdmin_base_url + 'editUserDetails';
    this.userActivationDeactivationUrl =
      this.providerAdmin_base_url + 'deletedUserDetails';
    this.checkEmpIdAvailabilityUrl =
      this.providerAdmin_base_url + 'm/FindEmployeeDetails';
  }
  // User Details related methods for fetching all dropdown data
  getCommonRegistrationData(): Observable<any> {
    return this.http.post(environment.getRegistrationDataUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError);
  }
  getAllUsers(serviceProviderID: any): Observable<any> {
    return this.http.post(environment.getAllUsersUrl, {
      serviceProviderID: serviceProviderID,
    });
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  checkUserAvailability(name: any): Observable<any> {
    return this.http.post(environment.checkUserAvailabilityUrl, {
      userName: name,
    });
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  checkEmpIdAvailability(empID: any): Observable<any> {
    return this.http.post(environment.checkEmpIdAvailabilityUrl, {
      employeeID: empID,
    });
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllDesignations(): Observable<any> {
    return this.http.post(environment.getAllDesignationsUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllMaritalStatuses(): Observable<any> {
    return this.http.post(environment.getAllMaritalStatusesUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllQualifications(): Observable<any> {
    return this.http.post(environment.getAllQualificationsUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllCommunities(): Observable<any> {
    return this.http.post(environment.getAllCommunitiesUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllReligions(): Observable<any> {
    return this.http.post(environment.getAllReligionsUrl, {});
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllStates(countryId: any): Observable<any> {
    console.log('COuntryID:', countryId);
    return this.http.get(environment.getAllStatesUrl + countryId);
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  getAllDistricts(stateID: any): Observable<any> {
    console.log('stateID', stateID);

    return this.http.get(environment.getAllDistrictsUrl + stateID);
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  validateAadhar(idNumber: any): Observable<any> {
    return this.http.post(environment.checkID, { aadhaarNo: idNumber });
    // .map(this.extractCustomData)
    // .catch(this.handleError);
  }
  validatePan(idNumber: any): Observable<any> {
    return this.http.post(environment.checkID, { pAN: idNumber });
    // .map(this.extractCustomData)
    // .catch(this.handleError);
  }
  validateHealthProfessionalID(idNumber: any): Observable<any> {
    return this.http.post(environment.checkID, {
      healthProfessionalID: idNumber,
    });
    // .map(this.extractCustomData)
    // .catch(this.handleError);
  }
  createNewUser(reqObject: any): Observable<any> {
    console.log('service', reqObject);

    return this.http.post(environment.createNewUserUrl, reqObject);
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  editUserDetails(updateObj: any): Observable<any> {
    return this.http.post(environment.editUserDetailsUrl, updateObj);
    // .map(this.extractData)
    // .catch(this.handleError)
  }
  userActivationDeactivation(toggle_obj: any): Observable<any> {
    console.log('toggle_obj', toggle_obj);
    return this.http.post(
      environment.userActivationDeactivationUrl,
      toggle_obj,
    );
    // .map(this.extractData)
    // .catch(this.handleError)
  }

  getUserLockStatus(userId: number): Observable<any> {
    return this.http.post(environment.getUserLockStatusUrl, {
      userId: userId,
    });
  }

  unlockUserAccount(userId: number): Observable<any> {
    return this.http.post(environment.unlockUserAccountUrl, {
      userId: userId,
    });
  }
}
