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
  previewRenameUrl: any;
  renameUsernameUrl: any;

  constructor(
    private http: HttpClient,
    private basepaths: ConfigService,
  ) {
    this.adminBaseUrl = this.basepaths.getAdminBaseUrl();

    this.getUserListUrl = this.adminBaseUrl + 'm/SearchEmployee4';
    this.previewRenameUrl =
      this.adminBaseUrl + 'username/renameUsername/preview';
    this.renameUsernameUrl = this.adminBaseUrl + 'username/renameUsername';
  }

  getUserList(serviceProviderID: any): Observable<any> {
    return this.http.post(this.getUserListUrl, {
      serviceProviderID: serviceProviderID,
    });
  }

  /** Reports what the rename would touch. Commits nothing. */
  previewRename(renameObject: any): Observable<any> {
    return this.http.post(this.previewRenameUrl, renameObject);
  }

  renameUsername(renameObject: any): Observable<any> {
    return this.http.post(this.renameUsernameUrl, renameObject);
  }
}
