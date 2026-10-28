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
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';

@Component({
  selector: 'app-nikshay-device-master',
  templateUrl: './nikshay-device-master.component.html',
  styleUrls: ['./nikshay-device-master.component.css'],
})
export class NikshayDeviceMasterComponent implements OnInit, OnDestroy {
  deviceList = new MatTableDataSource<any>();
  @ViewChild('tablePaginator') tablePaginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'sno',
    'deviceSerialId',
    'deviceId',
    'deviceName',
    'phiUserId',
    'createdBy',
    'expand',
  ];

  allDevices: any[] = [];
  searchDeviceId = '';
  showTableFlag = false;
  expandedDevice: any = null;
  // TODO: set to true once the unlink API is available
  isUnlinkApiAvailable = false;

  private searchInput$ = new Subject<string>();

  constructor(
    private nikshayDeviceService: NikshayDeviceConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.loadDevices();
    this.searchInput$
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => this.search());
  }

  ngOnDestroy() {
    this.searchInput$.complete();
  }

  toggleExpand(item: any) {
    this.expandedDevice = this.expandedDevice === item ? null : item;
  }

  unlinkVillage(device: any, village: any) {
    this.dialogService
      .confirm(
        'confirm',
        `Are you sure you want to unlink ${village.villageName} from ${device.deviceId}?`,
      )
      .subscribe((res: boolean) => {
        if (!res) return;

        if (!this.isUnlinkApiAvailable) {
          this.removeVillageFromDevice(device, village);
          return;
        }

        const requestObj = {
          mappingId: village.mappingId,
          deviceDetailId: device.id,
          villageId: village.villageId,
          updatedBy: this.commonDataService.uname,
        };
        this.nikshayDeviceService.unlinkDeviceVillage(requestObj).subscribe(
          () => this.removeVillageFromDevice(device, village),
          (err: any) => {
            this.dialogService.alert(
              err?.errorMessage || 'Failed to unlink village',
              'error',
            );
          },
        );
      });
  }

  removeVillageFromDevice(device: any, village: any) {
    device.villages = (device.villages || []).filter(
      (v: any) => v.mappingId !== village.mappingId,
    );
    this.dialogService.alert('Village unlinked successfully', 'success');
  }

  onSearchInputChange(value: string) {
    this.searchDeviceId = value;
    this.searchInput$.next(value);
  }

  loadDevices() {
    this.nikshayDeviceService.listDevices().subscribe(
      (response: any) => {
        this.allDevices = (response && response.data) || [];
        this.deviceList.data = this.allDevices;
        this.deviceList.paginator = this.tablePaginator;
        this.showTableFlag = true;
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load devices',
          'error',
        );
      },
    );
  }

  search() {
    if (!this.searchDeviceId) {
      this.deviceList.data = this.allDevices;
      this.deviceList.paginator = this.tablePaginator;
      return;
    }
    this.nikshayDeviceService.searchDevice(this.searchDeviceId).subscribe(
      (response: any) => {
        const result = response && response.data;
        this.deviceList.data = Array.isArray(result)
          ? result
          : result
            ? [result]
            : [];
        this.deviceList.paginator = this.tablePaginator;
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to search device',
          'error',
        );
      },
    );
  }
}
