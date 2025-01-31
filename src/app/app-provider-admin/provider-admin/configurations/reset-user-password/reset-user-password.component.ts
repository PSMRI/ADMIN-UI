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
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import * as CryptoJS from 'crypto-js';
import { ResetUserPasswordService } from 'src/app/core/services/ProviderAdminServices/reset-user-password.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-reset-user-password',
  templateUrl: './reset-user-password.component.html',
  styleUrls: ['./reset-user-password.component.css'],
})
export class ResetUserPasswordComponent implements OnInit {
  /*NgModel*/
  serviceProviderID: any;
  user: any;
  password: any;

  /*Arrays*/
  userNamesList: any = [];
  userDetails: any = [];
  // dataSource :any = [];

  tableMode = false;

  SALT = 'RandomInitVector';
  Key_IV = 'Piramal12Piramal';
  encPassword!: string;
  _keySize: any;
  _ivSize: any;
  _iterationCount: any;
  encryptPassword: any;
  displayedColumns = ['userName', 'dOJ', 'contactNo', 'emailID'];
  dataSource = new MatTableDataSource<any>();

  /*Patter*/
  passwordPattern =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;

  constructor(
    private alertService: ConfirmationDialogsService,
    private data_service: dataService,
    private resetUserPasswordService: ResetUserPasswordService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this._keySize = 256;
    this._ivSize = 128;
    this._iterationCount = 1989;
  }

  ngOnInit() {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getAllUserName(this.serviceProviderID);
  }

  /*Fetch all user name*/
  getAllUserName(serviceProviderID: any) {
    this.resetUserPasswordService.getUserList(serviceProviderID).subscribe(
      (response: any) => {
        console.log(
          'All user name under this provider Success Handeler',
          response,
        );
        this.userNamesList = response.data;
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }

  /*Fetch particular user detail*/
  getUserDetail(userName: any) {
    console.log('getUserDetail', userName);
    this.resetUserPasswordService.getUserDetail(userName).subscribe(
      (response: any) => {
        this.userDetails = response.data;
        this.dataSource.data = [response.data];
        this.tableMode = true;
      },
      (err) => {
        console.log('Error', err);
      },
    );
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

  /*Reset Password*/
  resetPassword(userName: any, password: any) {
    const resetObj = {
      userName: userName,
      password: this.encrypt(this.Key_IV, password),
      // "password": password,
      // this.encryptPassword = this.encrypt(this.Key_IV, password)
      //"statusID": 1
    };
    console.log('resetObj', resetObj);
    this.resetUserPasswordService.resetUserPassword(resetObj).subscribe(
      (response: any) => {
        this.alertService.alert(response.data.response);
        this.tableMode = false;
        this.user = null;
        this.password = null;
        this.userDetails = null;
        this.dataSource.data = [];
      },
      (err) => {
        console.log('Error', err);
      },
    );
  }
}
