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
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { PhiTransferConfigService } from '../../services/phi-transfer-config.service';

@Component({
  selector: 'app-update-phi-transfer',
  templateUrl: './update-phi-transfer.component.html',
  styleUrls: ['./update-phi-transfer.component.css'],
})
export class UpdatePhiTransferComponent implements OnInit {
  searchResults: any[] = [];
  showResultsFlag = false;

  editMode = false;
  selectedRecord: any;
  edit_designatedPhiId: any;
  edit_designationHierarchyId: any;
  updatedBy: any;

  constructor(
    private phiService: PhiTransferConfigService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
  ) {
    this.updatedBy = this.commonDataService.uname;
  }

  ngOnInit() {
    this.getAllDesignatedPhi();
  }

  getAllDesignatedPhi() {
    this.phiService.getAllDesignatedPhi().subscribe(
      (response: any) => {
        const result = (response && response.data) || [];
        this.searchResults = Array.isArray(result) ? result : [result];
        this.showResultsFlag = true;
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to load designated PHI mappings',
          'error',
        );
      },
    );
  }

  editRecord(item: any) {
    this.selectedRecord = item;
    this.edit_designatedPhiId = item.designatedPhiId;
    this.edit_designationHierarchyId = item.designationHierarchyId;
    this.editMode = true;
  }

  cancelEdit() {
    this.editMode = false;
    this.selectedRecord = undefined;
  }

  updatePhiTransfer() {
    const requestObj = {
      id: this.selectedRecord.id,
      villageId: this.selectedRecord.villageId,
      tbuId: this.selectedRecord.tbuId,
      designatedPhiId: this.edit_designatedPhiId,
      designationHierarchyId: this.edit_designationHierarchyId || null,
      createdBy: this.selectedRecord.createdBy,
      updatedBy: this.updatedBy,
    };

    this.phiService.updateDesignatedPhi(requestObj).subscribe(
      () => {
        this.dialogService.alert(
          'Designated PHI transfer updated successfully',
          'success',
        );
        this.editMode = false;
        this.getAllDesignatedPhi();
      },
      (err: any) => {
        this.dialogService.alert(
          err?.errorMessage || 'Failed to update designated PHI transfer',
          'error',
        );
      },
    );
  }
}
