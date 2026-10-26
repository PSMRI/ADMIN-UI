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
import { NgForm } from '@angular/forms';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';

@Component({
  selector: 'app-enroll-nikshay-device',
  templateUrl: './enroll-nikshay-device.component.html',
  styleUrls: ['./enroll-nikshay-device.component.css'],
})
export class EnrollNikshayDeviceComponent implements OnInit {
  @ViewChild('enrollDeviceForm') enrollDeviceForm!: NgForm;

  deviceId: any;
  deviceName: any;
  phiUserId: any;
  password: any;
  createdBy: any;

  constructor(
    private nikshayDeviceService: NikshayDeviceConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
  }

  enrollDevice() {
    const requestObj = {
      deviceId: this.deviceId,
      deviceName: this.deviceName,
      phiUserId: this.phiUserId,
      password: this.password,
      createdBy: this.createdBy,
    };

    this.nikshayDeviceService.enrollDevice(requestObj).subscribe(
      () => {
        this.dialogService.alert('Device enrolled successfully', 'success');
        this.resetForm();
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to enroll device',
          'error',
        );
      },
    );
  }

  resetForm() {
    this.enrollDeviceForm.resetForm();
  }
}
