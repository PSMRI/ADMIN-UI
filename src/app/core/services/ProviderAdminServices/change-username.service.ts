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

@Injectable()
export class ChangeUsernameService {
  adminBaseUrl: any;
  getUserListUrl: any;
  getUserDetailUrl: any;
  renameUsernameUrl: any;

  constructor(
    private http: HttpClient,
    private basepaths: ConfigService,
  ) {
    this.adminBaseUrl = this.basepaths.getAdminBaseUrl();

    this.getUserListUrl = this.adminBaseUrl + 'm/SearchEmployee4';
    this.getUserDetailUrl =
      this.adminBaseUrl + 'm/FindEmployeeDetailsByUserName';
    this.renameUsernameUrl = this.adminBaseUrl + 'username/renameUsername';
  }

  getUserList(serviceProviderID: any): Observable<any> {
    return this.http.post(this.getUserListUrl, {
      serviceProviderID: serviceProviderID,
    });
  }

  /** SearchEmployee4 omits employeeID, so the current value is fetched per user. */
  getUserDetail(userName: any): Observable<any> {
    return this.http.post(this.getUserDetailUrl, { userName: userName });
  }

  renameUsername(renameObject: any): Observable<any> {
    return this.http.post(this.renameUsernameUrl, renameObject);
  }
}
