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
import { Observable, of } from 'rxjs';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  NikshayBeneficiaryListService,
  NikshayPhaseKey,
  PhaseJobConfig,
  PhaseRunMode,
} from '../services/nikshay-beneficiary-list.service';

/** Sync phases that can be run, in run order. */
const NIKSHAY_PHASES: { key: NikshayPhaseKey; label: string }[] = [
  { key: 'ENROLMENT', label: 'Enrolment' },
  { key: 'NAAT_UPLOAD', label: 'TruNaat Upload' },
  { key: 'XRAY_UPLOAD', label: 'X-ray Upload' },
  { key: 'CONTACTS', label: 'Contacts' },
  { key: 'TRANSFER_OUT', label: 'Transfer Out' },
];

const JOB_MODE_OPTIONS: { value: PhaseRunMode; label: string }[] = [
  { value: 'MANUAL', label: 'Manual' },
  { value: 'AUTOMATIC', label: 'Auto' },
];

/** Flip to true once the phase run mode list API is live. */
const PHASE_JOB_CONFIG_LIST_API_AVAILABLE = false;

/** Placeholder job config shown until the API is live. */
const DUMMY_PHASE_JOB_CONFIGS: PhaseJobConfig[] = [
  { phase: 'ENROLMENT', runMode: 'AUTOMATIC' },
  { phase: 'NAAT_UPLOAD', runMode: 'AUTOMATIC' },
  { phase: 'XRAY_UPLOAD', runMode: 'MANUAL' },
  { phase: 'CONTACTS', runMode: 'AUTOMATIC' },
  { phase: 'TRANSFER_OUT', runMode: 'MANUAL' },
];

/** A phase row: its run state and job mode together. */
interface PhaseConfigRow {
  key: NikshayPhaseKey;
  label: string;
  mode: PhaseRunMode | null;
}

@Component({
  selector: 'app-nikshay-phase-config',
  templateUrl: './nikshay-phase-config.component.html',
  styleUrls: ['./nikshay-phase-config.component.css'],
})
export class NikshayPhaseConfigComponent implements OnInit {
  displayedColumns = ['sno', 'phase', 'mode', 'run'];
  jobModeOptions = JOB_MODE_OPTIONS;
  rows: PhaseConfigRow[] = NIKSHAY_PHASES.map((phase) => ({
    ...phase,
    mode: null,
  }));
  isLoadingJobConfigs = false;
  /** Phases whose run call is in flight. */
  runningPhases = new Set<NikshayPhaseKey>();
  /** Phases whose job mode update is in flight. */
  savingPhases = new Set<NikshayPhaseKey>();

  constructor(
    private nikshayBeneficiaryListService: NikshayBeneficiaryListService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.loadJobConfigs();
  }

  runPhase(row: PhaseConfigRow) {
    this.dialogService
      .confirm('Confirm', `Run the ${row.label} phase now?`)
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.runningPhases.add(row.key);
        this.nikshayBeneficiaryListService.runPhase(row.key).subscribe(
          () => {
            this.runningPhases.delete(row.key);
            this.dialogService.alert(
              `${row.label} phase started successfully`,
              'success',
            );
          },
          (err: any) => {
            this.runningPhases.delete(row.key);
            this.dialogService.alert(
              err?.errorMessage ||
                `Could not run the ${row.label} phase. Please try again.`,
              'error',
            );
          },
        );
      });
  }

  loadJobConfigs() {
    this.isLoadingJobConfigs = true;
    const request$: Observable<PhaseJobConfig[]> =
      PHASE_JOB_CONFIG_LIST_API_AVAILABLE
        ? this.nikshayBeneficiaryListService.getPhaseJobConfigs()
        : of(DUMMY_PHASE_JOB_CONFIGS);
    request$.subscribe(
      (configs) => {
        this.isLoadingJobConfigs = false;
        this.rows = NIKSHAY_PHASES.map((phase) => ({
          ...phase,
          mode: configs.find((c) => c.phase === phase.key)?.runMode || null,
        }));
      },
      (err: any) => {
        this.isLoadingJobConfigs = false;
        this.dialogService.alert(
          err?.errorMessage ||
            'Could not load the job configuration. Please try again.',
          'error',
        );
      },
    );
  }

  getJobModeLabel(mode: PhaseRunMode): string {
    return JOB_MODE_OPTIONS.find((m) => m.value === mode)?.label || mode;
  }

  /** Saves the new mode straight away; reverts the select if the save fails. */
  onJobModeChange(row: PhaseConfigRow, mode: PhaseRunMode) {
    const previousMode = row.mode;
    row.mode = mode;
    this.savingPhases.add(row.key);
    this.nikshayBeneficiaryListService
      .updatePhaseRunMode(row.key, mode)
      .subscribe(
        () => {
          this.savingPhases.delete(row.key);
          this.dialogService.alert(
            `${row.label} job set to ${this.getJobModeLabel(mode)}`,
            'success',
          );
        },
        (err: any) => {
          this.savingPhases.delete(row.key);
          row.mode = previousMode;
          this.dialogService.alert(
            err?.errorMessage ||
              'Could not update the job mode. Please try again.',
            'error',
          );
        },
      );
  }
}
