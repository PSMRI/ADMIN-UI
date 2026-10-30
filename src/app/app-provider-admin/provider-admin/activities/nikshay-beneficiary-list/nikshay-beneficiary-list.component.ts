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
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  NikshayBeneficiaryListItem,
  NikshayBeneficiaryListQuery,
  NikshayBeneficiaryListService,
  NikshayPhaseKey,
  PhaseStatus,
} from '../services/nikshay-beneficiary-list.service';

/** A phase as shown in the table: its status, label and failure reason. */
interface NikshayStageStatus {
  status: PhaseStatus;
  label: string;
  cssClass: string;
  reason?: string | null;
}

/** Labels for the API's phase statuses, in filter order. */
const NIKSHAY_STATUS_OPTIONS: { value: PhaseStatus; label: string }[] = [
  { value: 'DONE', label: 'Success' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'FAILED', label: 'Failed' },
  { value: 'NOT_APPLICABLE', label: 'Not Applicable' },
  { value: 'NOT_STARTED', label: 'Not Started' },
];

/** Sync phases shown as status columns, in table order. */
const NIKSHAY_STAGES: { key: NikshayPhaseKey; label: string }[] = [
  { key: 'ENROLMENT', label: 'Nikshay Status' },
  { key: 'NAAT_UPLOAD', label: 'TruNaat Status' },
  { key: 'XRAY_UPLOAD', label: 'X-ray Status' },
  { key: 'CONTACTS', label: 'Contact Status' },
  { key: 'TRANSFER_OUT', label: 'Transfer Out Status' },
];

/** Stage filter value matching a beneficiary when any stage has the chosen status. */
const ANY_STAGE = 'any';
type NikshayStageFilter = NikshayPhaseKey | typeof ANY_STAGE;

const getStatusLabel = (status: PhaseStatus | null): string =>
  NIKSHAY_STATUS_OPTIONS.find((option) => option.value === status)?.label || '';

@Component({
  selector: 'app-nikshay-beneficiary-list',
  templateUrl: './nikshay-beneficiary-list.component.html',
  styleUrls: ['./nikshay-beneficiary-list.component.css'],
})
export class NikshayBeneficiaryListComponent implements OnInit {
  isLoadingBeneficiaryList = false;
  /** "<benRegId>-<phase>" of the retry calls in flight. */
  retryingStages = new Set<string>();
  beneficiaryListSearchTerm = '';
  stageOptions = NIKSHAY_STAGES;
  statusFilterOptions = NIKSHAY_STATUS_OPTIONS;
  /** Selections in the filter menu, committed only on Apply. */
  readonly anyStage = ANY_STAGE;
  pendingStageFilter: NikshayStageFilter | null = null;
  pendingStatusFilter: PhaseStatus | null = null;
  appliedStageFilter: NikshayStageFilter | null = null;
  appliedStatusFilter: PhaseStatus | null = null;
  displayedColumns = [
    'sno',
    'name',
    'nikshayId',
    ...NIKSHAY_STAGES.map((stage) => stage.key),
  ];
  dataSource = new MatTableDataSource<NikshayBeneficiaryListItem>();

  constructor(
    private nikshayBeneficiaryListService: NikshayBeneficiaryListService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    // The API has no search param yet, so the name search runs on the loaded rows
    this.dataSource.filterPredicate = (row, term) =>
      (row.name || '').toLowerCase().includes(term);
    this.loadNikshayBeneficiaryList();
  }

  loadNikshayBeneficiaryList() {
    this.isLoadingBeneficiaryList = true;
    this.nikshayBeneficiaryListService
      .getNikshayBeneficiaryList(this.buildQuery())
      .subscribe(
        (beneficiaries) => {
          this.isLoadingBeneficiaryList = false;
          this.dataSource.data = beneficiaries;
        },
        (err: any) => {
          this.isLoadingBeneficiaryList = false;
          this.dataSource.data = [];
          this.dialogService.alert(
            err?.errorMessage ||
              'Could not load the Nikshay beneficiary list. Please try again.',
            'error',
          );
        },
      );
  }

  onSearchInputChange() {
    this.dataSource.filter = this.beneficiaryListSearchTerm
      .trim()
      .toLowerCase();
  }

  buildQuery(): NikshayBeneficiaryListQuery {
    if (!this.appliedStageFilter || !this.appliedStatusFilter) return {};
    // Any Stage sends the status alone
    return this.appliedStageFilter === ANY_STAGE
      ? { status: this.appliedStatusFilter }
      : { phase: this.appliedStageFilter, status: this.appliedStatusFilter };
  }

  /** Syncs the filter menu with the currently applied filter when it opens. */
  onStageFilterMenuOpened() {
    this.pendingStageFilter = this.appliedStageFilter;
    this.pendingStatusFilter = this.appliedStatusFilter;
  }

  applyStageFilter() {
    this.appliedStageFilter = this.pendingStageFilter;
    this.appliedStatusFilter = this.pendingStatusFilter;
    this.loadNikshayBeneficiaryList();
  }

  resetStageFilter() {
    this.pendingStageFilter = null;
    this.pendingStatusFilter = null;
    this.applyStageFilter();
  }

  get appliedStageFilterLabel(): string {
    const stageLabel =
      this.appliedStageFilter === ANY_STAGE
        ? 'Any Stage'
        : NIKSHAY_STAGES.find((s) => s.key === this.appliedStageFilter)?.label;
    return stageLabel && this.appliedStatusFilter
      ? `${stageLabel}: ${getStatusLabel(this.appliedStatusFilter)}`
      : '';
  }

  /** Shows only the first and last character of the name, e.g. "A*******i". */
  maskName(name: string): string {
    const value = (name || '').trim();
    if (value.length <= 2) return value;
    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
  }

  /** A phase with no row yet is NOT_STARTED. */
  getStageStatus(
    row: NikshayBeneficiaryListItem,
    stage: NikshayPhaseKey,
  ): NikshayStageStatus {
    const phase = row.phases?.[stage];
    const status: PhaseStatus = phase?.status || 'NOT_STARTED';
    return {
      status,
      label: getStatusLabel(status) || status,
      cssClass: 'status-' + status.toLowerCase().replace(/_/g, '-'),
      reason:
        status === 'FAILED' ? phase?.failureReason || phase?.errorDetail : null,
    };
  }

  isRetrying(row: NikshayBeneficiaryListItem, stage: NikshayPhaseKey) {
    return this.retryingStages.has(`${row.benRegId}-${stage}`);
  }

  onStageRetryClick(row: NikshayBeneficiaryListItem, stage: NikshayPhaseKey) {
    const stageLabel = NIKSHAY_STAGES.find((s) => s.key === stage)?.label;
    this.dialogService
      .confirm('Confirm', `Retry ${stageLabel} for this beneficiary?`)
      .subscribe((confirmed) => {
        if (!confirmed) return;
        const key = `${row.benRegId}-${stage}`;
        this.retryingStages.add(key);
        this.nikshayBeneficiaryListService
          .reprocessPhase(stage, [row.benRegId])
          .subscribe(
            () => {
              this.retryingStages.delete(key);
              this.dialogService.alert('Retry started successfully', 'success');
              this.loadNikshayBeneficiaryList();
            },
            (err: any) => {
              this.retryingStages.delete(key);
              this.dialogService.alert(
                err?.errorMessage || 'Could not retry. Please try again.',
                'error',
              );
            },
          );
      });
  }
}
