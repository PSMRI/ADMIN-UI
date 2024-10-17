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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { Subscription } from 'rxjs';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { loginService } from '../loginService/login.service';
import { HttpInterceptor } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { HttpServices } from 'src/app/core/services/http-services/http_services.service';

@Component({
  selector: 'app-login-component',
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class loginContentClassComponent implements OnInit, OnDestroy {
  model: any = {};
  userID: any;
  password: any;
  serviceProviderID: any;
  status: any;
  dynamictype: any = 'password';
  public loginResult: any;
  commitDetailsPath: any = 'assets/git-version.json';
  version: any;
  commitDetails: any;
  key: any;
  iv: any;
  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword: any;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;
  logoutUserFromPreviousSessionSubscription: Subscription = new Subscription();
  encryptPassword: any;

  constructor(
    public loginservice: loginService,
    public router: Router,
    private alertMessage: ConfirmationDialogsService,
    public HttpServices: HttpServices,
    private cookieService: CookieService,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  ngOnInit() {
    this.loginservice.dologoutUsrFromPreSession(false);
    this.logoutUserFromPreviousSessionSubscription =
      this.loginservice.logoutUserFromPreviousSessions$.subscribe(
        (logoutUser) => {
          if (logoutUser) {
            this.loginUser(true);
          }
        },
      );
    if (sessionStorage.getItem('authToken')) {
      this.loginservice.checkAuthorisedUser().subscribe(
        (response) => this.gotLoginRes(response),
        (err) =>
          console.log('Getting login response through auth token failed' + err),
      );
    }
    this.getCommitDetails();
  }
  gotLoginRes(res: any) {
    if (res.userName === 'Super  Admin') {
      sessionStorage.setItem('Userdata', 'Super Admin');
      sessionStorage.setItem('role', 'SUPERADMIN');
      sessionStorage.setItem('uname', 'Super Admin');
      this.router.navigate(['/MultiRoleScreenComponent']);
    } else {
      this.successCallback(res);
    }
  }

  get keySize() {
    return this._keySize;
  }

  set keySize(value) {
    this._keySize = value;
  }

  get iterationCount() {
    return this._iterationCount;
  }

  set iterationCount(value) {
    this._iterationCount = value;
  }

  generateKey(salt: any, passPhrase: any) {
    return CryptoJS.PBKDF2(passPhrase, CryptoJS.enc.Hex.parse(salt), {
      hasher: CryptoJS.algo.SHA512,
      keySize: this.keySize / 32,
      iterations: this._iterationCount,
    });
  }

  encryptWithIvSalt(salt: any, iv: any, passPhrase: any, plainText: any) {
    const key = this.generateKey(salt, passPhrase);
    const encrypted = CryptoJS.AES.encrypt(plainText, key, {
      iv: CryptoJS.enc.Hex.parse(iv),
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  encrypt(passPhrase: any, plainText: any) {
    const iv = CryptoJS.lib.WordArray.random(this._ivSize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const salt = CryptoJS.lib.WordArray.random(this.keySize / 8).toString(
      CryptoJS.enc.Hex,
    );
    const ciphertext = this.encryptWithIvSalt(salt, iv, passPhrase, plainText);
    return salt + iv + ciphertext;
  }

  login(userId: any, password: any, doLogout: any) {
    this.encryptPassword = this.encrypt(this.Key_IV, password);
    if (userId.toLowerCase() === 'SUPERADMIN'.toLowerCase()) {
      // this.loginservice.superAdminAuthenticate(userId, password, doLogout)
      this.loginservice
        .superAdminAuthenticate(userId, this.encryptPassword, doLogout)
        .subscribe(
          (response: any) => {
            // if (response.statusCode === 200) {
            if (response.data) {
              if (response.data.previlegeObj.length === 0) {
                console.log(response.data, 'SUPERADMIN VALIDATED');
                this.cookieService.set('Jwttoken', response.data.Jwttoken);
                delete response.data.Jwttoken;
                sessionStorage.setItem('authToken', response.data.key);
                sessionStorage.setItem('Userdata', 'Super Admin');
                sessionStorage.setItem('role', 'SUPERADMIN');
                sessionStorage.setItem('uname', 'Super Admin');
                sessionStorage.setItem('uid', response.data.userID);
                this.router.navigate(['/MultiRoleScreenComponent']);
              } else {
                this.alertMessage.alert('User is not super admin');
              }
            }
            // }
            else if (response.statusCode === 5002) {
              if (
                response.errorMessage ===
                'You are already logged in,please confirm to logout from other device and login again'
              ) {
                this.alertMessage
                  .confirm('info', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              } else if (
                response.errorMessage.includes(
                  'User login failed due to incorrect username/password',
                )
              ) {
                this.alertMessage
                  .confirm('error', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              } else if (
                response.errorMessage.includes(
                  'Your account is locked or de-activated. Please contact administrator',
                )
              ) {
                this.alertMessage
                  .confirm('info', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              }
            }
          },
          (err) => {
            this.alertMessage.alert(err, 'error');
            console.log(err, 'ERR while superadmin validation');
          },
        );
    } else {
      this.loginservice
        .authenticateUser(userId, this.encryptPassword, doLogout)
        .subscribe(
          (response: any) => {
            if (response && response.data) {
              sessionStorage.setItem('authToken', response.data.key);
              this.successCallback(response);
            } else if (response.statusCode === 5002) {
              if (
                response.errorMessage ===
                'You are already logged in,please confirm to logout from other device and login again'
              ) {
                this.alertMessage
                  .confirm('info', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              } else if (
                response.errorMessage.includes(
                  'User login failed due to incorrect username/password',
                )
              ) {
                this.alertMessage
                  .confirm('error', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              } else if (
                response.errorMessage.includes(
                  'Your account is locked or de-activated. Please contact administrator',
                )
              ) {
                this.alertMessage
                  .confirm('info', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              } else if (
                response.errorMessage.includes(
                  'Contact Administrator as either provider or user or both are inactive',
                )
              ) {
                this.alertMessage
                  .confirm('info', response.errorMessage)
                  .subscribe((confirmResponse) => {
                    if (confirmResponse) {
                      this.loginservice.dologoutUsrFromPreSession(true);
                    }
                  });
              }
            }
          },
          (error: any) => {
            this.errorCallback(error);
            // this.alertMessage.alert(error, 'error');
          },
        );
    }
  }

  loginUser(doLogOut: any) {
    this.loginservice
      .userLogOutFromPreviousSession(this.userID)
      .subscribe((userLogOutRes: any) => {
        if (userLogOutRes && userLogOutRes.data.response) {
          if (this.userID.toLowerCase() === 'SUPERADMIN'.toLowerCase()) {
            this.loginservice
              .superAdminAuthenticate(
                this.userID,
                this.encryptPassword,
                doLogOut,
              )
              .subscribe(
                (response: any) => {
                  if (response.data.isAuthenticated) {
                    if (response.data.previlegeObj.length === 0) {
                      console.log(response, 'SUPERADMIN VALIDATED');
                      sessionStorage.setItem('authToken', response.data.key);
                      sessionStorage.setItem('Userdata', 'Super Admin');
                      sessionStorage.setItem('role', 'SUPERADMIN');
                      sessionStorage.setItem('uname', 'Super Admin');
                      sessionStorage.setItem('uid', response.data.userID);
                      this.router.navigate(['/MultiRoleScreenComponent']);
                    } else {
                      this.alertMessage.alert('User is not super admin');
                    }
                  }
                },
                (err) => {
                  this.alertMessage.alert(err, 'error');
                  console.log(err, 'ERR while superadmin validation');
                },
              );
          } else {
            this.loginservice
              .authenticateUser(this.userID, this.encryptPassword, doLogOut)
              .subscribe(
                (response: any) => {
                  if (response && response.data) {
                    sessionStorage.setItem('authToken', response.data.key);
                    this.successCallback(response);
                  }
                },
                (error: any) => {
                  this.errorCallback(error);
                  // this.alertMessage.alert(error, 'error');
                },
              );
          }
        } else {
          this.alertMessage.alert(userLogOutRes.data.errorMessage, 'error');
        }
      });
  }

  successCallback(response: any) {
    console.log(response);
    sessionStorage.setItem('Userdata', JSON.stringify(response.data));
    sessionStorage.setItem(
      'userPriveliges',
      JSON.stringify(response.data.previlegeObj),
    );
    sessionStorage.setItem('uid', response.data.userID);
    // sessionStorage.setItem('service_providerID', response.prov)ider[0].providerID;
    sessionStorage.setItem('uname', response.data.userName);
    console.log('array', response.data.previlegeObj);

    if (
      response.data.isAuthenticated === true &&
      response.data.Status === 'Active'
    ) {
      sessionStorage.setItem('authToken', response.data.key);
      console.log(
        'response.previlegeObj[0].serviceID',
        response.data.previlegeObj[0].serviceID,
      );
      this.loginservice
        .getServiceProviderID(response.data.previlegeObj[0].serviceID)
        .subscribe(
          (res) => this.getServiceProviderMapIDSuccessHandeler(res),
          (err) => console.log('error in fetching service provider ID', err),
        );
      // this.router.navigate(['/MultiRoleScreenComponent']);
      for (let i = 0; i < response.data.Previlege.length; i++) {
        // for (let j = 0; j < response.Previlege[i].Role.length; j++) {
        if (response.data.Previlege[i].Role === 'ProviderAdmin') {
          // this.router.navigate(['/MultiRoleScreenComponent']);
          sessionStorage.setItem('role', 'PROVIDERADMIN');
          console.log('VALUE SET HOGAYI');
        } else {
          sessionStorage.setItem('role', '');
        }
        // }
      }
      if (
        sessionStorage.getItem('role')?.toLowerCase().toString() ===
        'PROVIDERADMIN'.toLowerCase()
      ) {
        this.router.navigate(['/MultiRoleScreenComponent']);
      } else {
        this.alertMessage.alert('User is not a provider admin');
      }
    }
    if (
      response.data.isAuthenticated === true &&
      response.data.Status === 'New'
    ) {
      this.status = 'new';
      sessionStorage.setItem('authToken', response.data.key);
      this.router.navigate(['/setQuestions']);
    }

    for (let i = 0; i < response.data?.previlegeObj?.length; i++) {
      if (
        response.data.previlegeObj[i].serviceDesc.toLowerCase() ===
        '104 helpline'
      ) {
        sessionStorage.setItem(
          'providerServiceMapID_104',
          response.data.previlegeObj[i].providerServiceMapID,
        );
      }
    }
  }
  errorCallback(error: any) {
    if (error.status) {
      this.loginResult = error.errorMessage;
    } else {
      this.loginResult = 'Internal issue please try after some time';
    }
    // this.loading = false;
    console.log(error);
  }

  // encryptionFlag: boolean = true;

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  getServiceProviderMapIDSuccessHandeler(response: any) {
    console.log('service provider map id', response);
    if (response && response.data) {
      sessionStorage.setItem(
        'service_providerID',
        response.data.serviceProviderID,
      );
      this.serviceProviderID = response.data.serviceProviderID;
    } else {
      this.alertMessage.alert(
        'Service Provider map ID is not fetched',
        'error',
      );
    }
  }

  getCommitDetails() {
    const Data = this.commitDetailsPath;
    this.HttpServices.getCommitDetails(this.commitDetailsPath).subscribe(
      (res: any) => this.successhandeler1(res),
      (err: any) => this.successhandeler1(err),
    );
  }
  successhandeler1(response: any) {
    this.commitDetails = response;
    this.version = this.commitDetails['version'];
  }

  ngOnDestroy() {
    if (this.logoutUserFromPreviousSessionSubscription) {
      this.logoutUserFromPreviousSessionSubscription.unsubscribe();
    }
  }
}
