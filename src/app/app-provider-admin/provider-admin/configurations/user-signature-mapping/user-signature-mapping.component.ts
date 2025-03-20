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
import {
  FormBuilder,
  FormGroup,
  FormControl,
  FormArray,
  NgForm,
  Validators,
} from '@angular/forms';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { EmployeeParkingPlaceMappingService } from '../../activities/services/employee-parking-place-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-user-signature-mapping',
  templateUrl: './user-signature-mapping.component.html',
  styleUrls: ['./user-signature-mapping.component.css'],
})
export class UserSignatureMappingComponent implements OnInit {
  signUploadForm!: FormGroup;
  designations: any = [];
  userNames: any = [];
  signExist: any;
  fileList!: FileList;
  file: any;
  createdBy: any;
  serviceProviderID: any;
  public imagePath: any;
  imgURL: any;
  enableDownloadButton = false;

  constructor(
    private fb: FormBuilder,
    public employeeParkingPlaceMappingService: EmployeeParkingPlaceMappingService,
    private alertMessage: ConfirmationDialogsService,
    private dataService: dataService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.signUploadForm = this.createSignUploadForm();
    this.createdBy = this.dataService.uname;
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
    this.getDesignations();
  }
  createSignUploadForm() {
    return this.fb.group({
      designation: [null, Validators.required],
      username: [null, Validators.required],
    });
  }
  get designation() {
    return this.signUploadForm.controls['designation'].value;
  }
  get username() {
    return this.signUploadForm.controls['username'].value;
  }
  getDesignations() {
    this.employeeParkingPlaceMappingService.getDesignations().subscribe(
      (response: any) => {
        if (response && response.data) this.designations = response.data;
      },
      (err) => {
        console.log('designation not fetched');
      },
    );
  }
  getUserNames() {
    const reqObj = {
      designationID: this.designation.designationID,
      serviceProviderID: this.serviceProviderID,
    };
    this.employeeParkingPlaceMappingService
      .getUserNameBasedOnDesig(reqObj)
      .subscribe(
        (response: any) => {
          if (response && response.data) this.userNames = response.data;
        },
        (err) => {
          console.log('usernames not fetched');
        },
      );
  }
  checkUsersignExist() {
    this.imgURL = null;
    this.employeeParkingPlaceMappingService
      .checkUsersignatureExist(this.username.userID)
      .subscribe(
        (response: any) => {
          this.signExist = response.data.response;
          if (this.signExist === 'true') {
            this.enableDownloadButton = true;
          } else {
            this.enableDownloadButton = false;
          }
        },
        (err) => {
          console.log('Error while fetching response');
        },
      );
  }
  public message: any;
  preview(files: any) {
    if (files.length === 0) return;

    const imgType = files[0].type;
    if (imgType.match(/image\/*/) === null) {
      this.alertMessage.alert('Only images are supported');
      return;
    }

    const reader = new FileReader();
    this.imagePath = files[0];
    reader.readAsDataURL(files[0]);
    reader.onload = (_event) => {
      this.checkImageSize(reader);
    };
  }
  checkImageSize(reader: any) {
    if (this.imagePath.size > 20000) {
      this.alertMessage.alert('Image size should be less than 20kb');
    } else {
      this.imgURL = reader.result;
    }
    this.checkDimensions(reader);
  }
  checkDimensions(reader: any) {
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth >= 280 && img.naturalHeight >= 70) {
        this.alertMessage.alert(
          'Preferred pixels should be less than 280*70 pixels',
        );
        this.imgURL = null;
      } else {
        this.imgURL = reader.result;
      }
    };
    img.src = this.imgURL;
  }
  uploadSign() {
    const signObj = {
      createdBy: this.createdBy,
      fileName: this.imagePath.name,
      fileType: this.imagePath.type,
      userID: this.username.userID,
      fileContent: this.imgURL !== undefined ? this.imgURL.split(',')[1] : '',
    };
    this.employeeParkingPlaceMappingService.uploadSignature(signObj).subscribe(
      (response) => {
        this.alertMessage.alert('Saved successfully', 'success');
        this.signUploadForm.reset();
        this.imgURL = null;
        this.signExist = null;
        this.enableDownloadButton = false;
      },
      (err) => {
        console.log('err');
        this.alertMessage.alert(err.errorMessage, 'error');
      },
    );
  }
  downloadSign() {
    this.employeeParkingPlaceMappingService
      .downloadSign(this.username.userID)
      .subscribe(
        (response: any) => {
          const filename = response.headers.get('filename');
          // let blobResponse = <Blob>response.body.blob();
          const blob = new Blob([response], { type: response.type });
          console.log(blob, 'blob');
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
        },
        (err) => {
          this.alertMessage.alert(err.errorMessage, 'error');
        },
      );
  }
}
