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
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PlatformLocation } from '@angular/common';
// import { JsonpModule } from '@angular/http';
import { MatDialog } from '@angular/material/dialog';
import { ViewVersionDetailsComponent } from '../core/components/view-version-details/view-version-details.component';
import { ConfigService } from '../core/services/config/config.service';
import { HttpServices } from '../core/services/http-services/http_services.service';
import { loginService } from '../user-login/loginService/login.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

declare let jQuery: any;

@Component({
  selector: 'app-multi-role-screen',
  templateUrl: './multi-role-screen.component.html',
  styleUrls: ['./multi-role-screen.component.css'],
})
export class MultiRoleScreenComponent implements OnInit {
  id: any;
  role: any;
  api_versionDetails: any;
  version: any;
  uiVersionDetails: any;

  constructor(
    public router: Router,
    location: PlatformLocation,
    public HttpServices: HttpServices,
    public _loginService: loginService,
    public configService: ConfigService,
    private dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {
    location.onPopState((e: any) => {
      window.history.forward();
    });
    this.role = this.sessionstorage.getItem('role');
    this.id = this.sessionstorage.getItem('uid');
    console.log(this.role, 'ROLE NAME AS OF NOW');
  }

  data: any;
  languageFilePath: any = 'assets/english.json';
  selectedlanguage: any = '';
  currentlanguageSet: any = {};
  language_change: any;
  license: any;
  commitDetailsPath: any = 'assets/git-version.json';
  commitDetails: any;

  ngOnInit() {
    this.language_change = 'english';
    console.log('userdata', this.sessionstorage.getItem('Userdata'));
    this.data = this.sessionstorage.getItem('Userdata');
    this.data = JSON.parse(this.data);
    // this.router.navigate(['/MultiRoleScreenComponent']);
    this.getLanguageObject(this.language_change);
    this.getLicense();
    this.getCommitDetails();
  }
  getCommitDetails() {
    const Data = this.commitDetailsPath;
    this.HttpServices.getCommitDetails(this.commitDetailsPath).subscribe(
      (res) => this.successhandeler1(res),
      (err) => this.successhandeler1(err),
    );
  }
  // langauge POC stuff

  getLanguageObject(language: any) {
    this.selectedlanguage = language;
    console.log('language asked for is:', language);
    this.HttpServices.getData(this.languageFilePath).subscribe(
      (response) => this.successhandeler(response, language),
      (err) => this.successhandeler(err, language),
    );
  }

  successhandeler1(response: any) {
    this.commitDetails = response;
    this.uiVersionDetails = {
      Version: this.commitDetails['version'],
      Commit: this.commitDetails['commit'],
    };
  }

  successhandeler(response: any, language: any) {
    console.log(response, 'language response');
    this.currentlanguageSet = response[language];

    // var languageEvent = jQuery.Event("changed_language", response[language]);
    // jQuery(window).trigger(languageEvent);
  }

  logOut() {
    this._loginService.removeTokenFromRedis().subscribe(
      (response) => {
        if (response) {
          console.log(
            'successfully logged out from CRM and session ended both sides',
          );
          sessionStorage.removeItem('authToken');
          this.sessionstorage.removeItem('Userdata');
          this.sessionstorage.removeItem('role');
          sessionStorage.removeItem('uname');
          sessionStorage.removeItem('uid');
          this.sessionstorage.removeItem('userPriveliges');
          this.sessionstorage.removeItem('providerServiceMapID_104');
          this.sessionstorage.removeItem('service_providerID');
          this.router.navigate(['']);
        }
      },
      (err) => {
        console.log(err, 'error while ending session both sides');
      },
    );
  }
  logOutKeyUp() {
    // if (event.key === 'Enter' || event.key === '') {
    console.log('button entered via key board');
    // }
  }
  getLicense() {
    const getPath = this.configService.getCommonBaseURL();
    this.license = getPath + 'license.html';
  }

  viewVersionDetails() {
    this._loginService.getApiVersionDetails().subscribe((apiResponse) => {
      console.log('apiResponse', apiResponse);
      if (apiResponse) {
        const api_versionDetails = {
          Version: apiResponse,
          // data['git.build.version'],
          Commit: apiResponse,
          // data['git.commit.id'],
        };
        if (api_versionDetails) {
          this.openVersionDialogComponent(api_versionDetails);
        }
      }
    }),
      (err: any) => {
        console.log(err, 'error');
      };
  }
  openVersionDialogComponent(api_versionDetails: any) {
    this.dialog.open(ViewVersionDetailsComponent, {
      width: '80%',
      data: {
        uiversionDetails: this.uiVersionDetails,
        api_versionDetails: api_versionDetails,
      },
    });
  }
}
