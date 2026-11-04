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

  deviceSerialNumber: any;
  deviceName: any;
  phiUserId: any;
  password: any;
  createdBy: any;

  selectedFile: File | null = null;
  maxFileSizeInMB = 5;
  validFileExtensions = ['xls', 'xlsx'];
  // Excel column header -> form field
  headerKeyMap: { [header: string]: string } = {
    'Device Serial Number': 'deviceSerialNumber',
    'Device Name': 'deviceName',
    'PHI User Id': 'phiUserId',
    Password: 'password',
  };
  expectedHeaders = Object.keys(this.headerKeyMap);
  validDeviceNames = ['NAAT', 'XRAY'];
  /** Downloaded when a bulk upload has failed rows. */
  readonly failedRowsFileName = 'enroll-device-errors.xlsx';

  constructor(
    private nikshayDeviceService: NikshayDeviceConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.createdBy = this.commonDataService.uname;
  }

  enrollDevice() {
    this.submitDevices(
      [
        this.toDevicePayload({
          deviceSerialNumber: this.deviceSerialNumber,
          deviceName: this.deviceName,
          phiUserId: this.phiUserId,
          password: this.password,
        }),
      ],
      (result) => this.handleSingleEnrollResult(result),
    );
  }

  /** One entry of the enroll request's devices array. */
  toDevicePayload(device: {
    deviceSerialNumber: string;
    deviceName: string;
    phiUserId: string;
    password: string;
  }) {
    return {
      deviceSerialNumber: device.deviceSerialNumber,
      deviceName: device.deviceName,
      phiUserId: device.phiUserId,
      password: device.password,
    };
  }

  /**
   * The same enroll API takes one device (form) or many (Excel upload) and
   * reports per row: { total, successCount, failedCount, created, failed }.
   */
  submitDevices(devices: any[], onResult: (result: any) => void) {
    const requestObj = { createdBy: this.createdBy, devices };
    this.nikshayDeviceService.enrollDevice(requestObj).subscribe(
      (response: any) => onResult(response?.data || {}),
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to enroll device',
          'error',
        );
      },
    );
  }

  handleSingleEnrollResult(result: any) {
    if (this.getFailedCount(result) > 0) {
      this.dialogService.alert(
        this.getFailureMessage(result.failed?.[0]) || 'Failed to enroll device',
        'error',
      );
      return;
    }
    this.dialogService.alert('Device enrolled successfully', 'success');
    this.resetForm();
  }

  handleBulkEnrollResult(result: any) {
    const failedCount = this.getFailedCount(result);
    const successCount = result.successCount ?? (result.created || []).length;
    this.resetFileInput();
    if (failedCount === 0) {
      this.dialogService.alert(
        `${successCount} device(s) enrolled successfully`,
        'success',
      );
      return;
    }
    this.downloadFailedRows(result.failed || []);
    this.dialogService.alert(
      `${successCount} device(s) enrolled, ${failedCount} failed. ` +
        `The failed rows have been downloaded as ${this.failedRowsFileName}.`,
      successCount > 0 ? 'warn' : 'error',
    );
  }

  getFailedCount(result: any): number {
    return result.failedCount ?? (result.failed || []).length;
  }

  /** The row's field errors, or its reason code when it has none. */
  getFailureMessage(failed: any): string {
    const messages = (failed?.errors || [])
      .map((e: any) => e?.message)
      .filter(Boolean);
    return messages.length ? messages.join('\n') : failed?.reason || '';
  }

  /** One sheet row per failed device; rowIndex is the 0-based data row, so +2 skips the header. */
  buildFailedRows(failed: any[]) {
    return failed.map((f: any) => ({
      'Excel Row': typeof f.rowIndex === 'number' ? f.rowIndex + 2 : '',
      'Device Serial Number': f.deviceSerialNumber ?? '',
      'Device Name': f.deviceName ?? '',
      'PHI User Id': f.phiUserId ?? '',
      Reason: f.reason ?? '',
      Errors: this.getFailureMessage(f).replace(/\n/g, '; '),
    }));
  }

  downloadFailedRows(failed: any[]) {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.json_to_sheet(this.buildFailedRows(failed)),
      'Failed Devices',
    );
    XLSX.writeFile(wb, this.failedRowsFileName);
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
        const device: any = {};
        headers.forEach((header: string, i: number) => {
          device[this.headerKeyMap[header]] = String(row[i]).trim();
        });
        return this.toDevicePayload(device);
      });

      this.submitDevices(devices, (result) =>
        this.handleBulkEnrollResult(result),
      );
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
    const duplicates = headers.filter(
      (h: string, i: number) => headers.indexOf(h) !== i,
    );
    if (duplicates.length) {
      return `Invalid file format. Duplicate columns: ${[...new Set(duplicates)].join(', ')}`;
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
