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
import * as XLSX from 'xlsx';
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

  selectedFile: File | null = null;
  maxFileSizeInMB = 5;
  validFileExtensions = ['xls', 'xlsx'];
  // Excel column header -> request key
  headerKeyMap: { [header: string]: string } = {
    'Device Serial Id': 'deviceSerialId',
    'Device Name': 'deviceName',
    'PHI User Id': 'phiUserId',
    Password: 'password',
  };
  expectedHeaders = Object.keys(this.headerKeyMap);
  validDeviceNames = ['NAAT', 'XRAY'];

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

  onFileSelected(event: any) {
    this.selectedFile = null;
    const files: FileList = event.target.files;
    if (!files || files.length !== 1) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !this.validFileExtensions.includes(extension)) {
      this.dialogService.alert(
        'Invalid file format. Please upload a .xls or .xlsx file',
        'error',
      );
      this.resetFileInput();
      return;
    }
    if (file.size / 1024 / 1024 > this.maxFileSizeInMB) {
      this.dialogService.alert(
        `File size exceeds the maximum allowed size of ${this.maxFileSizeInMB} MB`,
        'error',
      );
      this.resetFileInput();
      return;
    }
    this.selectedFile = file;
  }

  uploadFile() {
    if (!this.selectedFile) return;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      let rows: any[][];
      try {
        const wb = XLSX.read(new Uint8Array(e.target.result), {
          type: 'array',
        });
        const ws = wb.Sheets[wb.SheetNames[0]];
        rows = XLSX.utils.sheet_to_json(ws, {
          header: 1,
          defval: '',
          raw: false,
          blankrows: false,
        });
      } catch {
        this.dialogService.alert('Unable to read the Excel file', 'error');
        return;
      }

      const error = this.validateRows(rows);
      if (error) {
        this.dialogService.alert(error, 'error');
        return;
      }

      const headers = rows[0].map((h: any) => String(h).trim());
      const devices = rows.slice(1).map((row) => {
        const device: any = { createdBy: this.createdBy };
        headers.forEach((header: string, i: number) => {
          device[this.headerKeyMap[header]] = String(row[i]).trim();
        });
        return device;
      });

      // TODO: replace with the bulk upload API call
      console.info('Bulk enroll devices:', devices);
      this.dialogService.alert(
        `${devices.length} device(s) extracted from the file`,
        'success',
      );
      this.resetFileInput();
    };
    reader.readAsArrayBuffer(this.selectedFile);
  }

  validateRows(rows: any[][]): string | null {
    if (!rows || rows.length === 0) return 'The uploaded file is empty';

    const headers = rows[0].map((h: any) => String(h).trim());
    const missing = this.expectedHeaders.filter((h) => !headers.includes(h));
    const extra = headers.filter((h: string) => !this.headerKeyMap[h]);
    if (missing.length || extra.length) {
      return `Invalid file format. Expected columns: ${this.expectedHeaders.join(', ')}`;
    }
    if (rows.length < 2) return 'The uploaded file has no data rows';

    const deviceNameIndex = headers.indexOf('Device Name');
    const errors: string[] = [];
    rows.slice(1).forEach((row, i) => {
      const rowNo = i + 2;
      const emptyCols = headers.filter(
        (_: string, c: number) => !String(row[c] ?? '').trim(),
      );
      if (emptyCols.length) {
        errors.push(`Row ${rowNo}: ${emptyCols.join(', ')} required`);
      }
      const deviceName = String(row[deviceNameIndex] ?? '').trim();
      if (deviceName && !this.validDeviceNames.includes(deviceName)) {
        errors.push(
          `Row ${rowNo}: Device Name must be ${this.validDeviceNames.join(' or ')}`,
        );
      }
    });
    return errors.length ? errors.slice(0, 10).join('\n') : null;
  }

  resetFileInput() {
    this.selectedFile = null;
    const fileInput = document.getElementById(
      'enroll-device-upload-file',
    ) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}
