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
import { MatPaginator } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { PhiTransferConfigService } from '../../services/phi-transfer-config.service';

@Component({
  selector: 'app-phi-master',
  templateUrl: './phi-master.component.html',
  styleUrls: ['./phi-master.component.css'],
})
export class PhiMasterComponent implements OnInit {
  phiList = new MatTableDataSource<any>();
  @ViewChild('tablePaginator') tablePaginator: MatPaginator | null = null;

  displayedColumns: string[] = [
    'sno',
    'villageId',
    'villageName',
    'tbuId',
    'designatedPhiId',
    'designationHierarchyId',
    'createdBy',
  ];

  filterVillageId: any;
  filterTbuId: any;
  filterDesignatedPhiId: any;
  showTableFlag = false;
  showFilters = false;

  constructor(
    private phiService: PhiTransferConfigService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.search();
  }

  search() {
    const hasFilter =
      this.filterVillageId || this.filterTbuId || this.filterDesignatedPhiId;
    const request = hasFilter
      ? this.phiService.getDesignatedPhi({
          villageId: this.filterVillageId,
          tbuId: this.filterTbuId,
          designatedPhiId: this.filterDesignatedPhiId,
        })
      : this.phiService.getAllDesignatedPhi();

    request.subscribe(
      (response: any) => {
        const result = (response && response.data) || [];
        this.phiList.data = Array.isArray(result) ? result : [result];
        this.phiList.paginator = this.tablePaginator;
        this.showTableFlag = true;
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load designated PHI mappings',
          'error',
        );
      },
    );
  }

  clearFilters() {
    this.filterVillageId = undefined;
    this.filterTbuId = undefined;
    this.filterDesignatedPhiId = undefined;
    this.phiList.data = [];
    this.showTableFlag = false;
  }
}
