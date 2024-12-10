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
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

// import { Http, Response } from '@angular/http';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/operator/map';

@Injectable()
export class dataService {
  constructor(readonly sessionstorage: SessionStorageService) {}
  userNameForReset: any;
  Userdata: any = this.sessionstorage.getItem('Userdata') || '[]';
  userPriveliges: any = this.sessionstorage.getItem('userPriveliges') || '[]';

  uid: any = this.sessionstorage.getItem('uid');
  uname: any = this.sessionstorage.getItem('uname');
  benData: any = this.sessionstorage.getItem('benData');
  role: any = this.sessionstorage.getItem('role');
  beneficiaryData: any = this.sessionstorage.getItem('beneficiaryData');
  callData: any = this.sessionstorage.getItem('callData');
  service_providerID: any = this.sessionstorage.getItem('service_providerID');
  provider_serviceMapID: any = this.sessionstorage.getItem(
    'provider_serviceMapID',
  );
  serviceID104: any = 3;
  serviceIDMMU: any = 2;
  currentLanguage: any;
  current_serviceID: any = 3;
  providerServiceMapID_104: any;
}
