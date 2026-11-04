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
import { Component } from '@angular/core';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { NikshayBeneficiaryListService } from '../services/nikshay-beneficiary-list.service';

@Component({
  selector: 'app-nikshay-job-config',
  templateUrl: './nikshay-job-config.component.html',
  styleUrls: ['./nikshay-job-config.component.css'],
})
export class NikshayJobConfigComponent {
  isRunningJob = false;

  constructor(
    private nikshayBeneficiaryListService: NikshayBeneficiaryListService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  triggerNikshayJob() {
    this.dialogService
      .confirm('Confirm', 'Trigger the Nikshay job now?')
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.isRunningJob = true;
        this.nikshayBeneficiaryListService.runNikshayJob().subscribe(
          (data: any) => {
            this.isRunningJob = false;
            this.dialogService.alert(
              (typeof data === 'string' && data) ||
                data?.message ||
                'Nikshay job triggered successfully',
              'success',
            );
          },
          (err: any) => {
            this.isRunningJob = false;
            this.dialogService.alert(
              err?.errorMessage ||
                'Could not trigger the Nikshay job. Please try again.',
              'error',
            );
          },
        );
      });
  }
}
