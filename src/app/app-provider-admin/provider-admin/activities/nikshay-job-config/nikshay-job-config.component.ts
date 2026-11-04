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
import { PageEvent } from '@angular/material/paginator';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  NikshayBeneficiaryListService,
  NikshayJobRun,
  NikshayJobRunHistoryResponse,
  NikshayJobTriggerHistoryQuery,
  NikshayJobTriggerType,
  NikshayPhaseKey,
} from '../services/nikshay-beneficiary-list.service';

const PHASE_LABELS: Record<NikshayPhaseKey, string> = {
  ENROLMENT: 'Enrolment',
  NAAT_UPLOAD: 'TruNaat Upload',
  XRAY_UPLOAD: 'X-ray Upload',
  CONTACTS: 'Contacts',
  TRANSFER_OUT: 'Transfer Out',
};

const TRIGGER_TYPE_OPTIONS: { value: NikshayJobTriggerType; label: string }[] =
  [
    { value: 'JOB', label: 'Job' },
    { value: 'MANUAL', label: 'Manual' },
  ];

/** yyyy-MM-dd in local time, as sent to the API. */
const toDateParam = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');

@Component({
  selector: 'app-nikshay-job-config',
  templateUrl: './nikshay-job-config.component.html',
  styleUrls: ['./nikshay-job-config.component.css'],
})
export class NikshayJobConfigComponent implements OnInit {
  isRunningJob = false;

  historyColumns = [
    'sno',
    'startedAt',
    'duration',
    'triggeredBy',
    'status',
    'picked',
    'succeeded',
    'failed',
    'notApplicable',
    'waiting',
    'expand',
  ];
  phaseColumns = [
    'phase',
    'pass',
    'result',
    'picked',
    'succeeded',
    'failed',
    'notApplicable',
    'waiting',
  ];
  runs: NikshayJobRun[] = [];
  expandedRunId: string | null = null;
  isLoadingHistory = false;
  /** Server-side paging state; pageIndex is 0-based like the API's page. */
  pageIndex = 0;
  pageSize = 10;
  /** Paginator length; estimated when the API sends no total. */
  totalCount = 0;
  /** Filter values as picked; they reach the list only on Apply. */
  fromDate: Date | null = null;
  toDate: Date | null = null;
  appliedFromDate: Date | null = null;
  appliedToDate: Date | null = null;
  readonly today = new Date();
  readonly triggerTypeOptions = TRIGGER_TYPE_OPTIONS;
  /** null means all trigger types. */
  triggerTypeFilter: NikshayJobTriggerType | null = null;
  appliedTriggerType: NikshayJobTriggerType | null = null;
  /** Bumped per history request so only the latest response is applied. */
  private historyRequestId = 0;

  constructor(
    private nikshayBeneficiaryListService: NikshayBeneficiaryListService,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  triggerNikshayJob() {
    this.dialogService
      .confirm('Confirm', 'Trigger the Nikshay job now?')
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.isRunningJob = true;
        this.nikshayBeneficiaryListService.runNikshayJob().subscribe(
          () => {
            this.isRunningJob = false;
            this.dialogService.alert(
              'Nikshay job completed successfully',
              'success',
            );
            this.reloadHistoryFromFirstPage();
          },
          (err: any) => {
            this.isRunningJob = false;
            this.dialogService.alert(
              err?.errorMessage ||
                'Could not trigger the Nikshay job. Please try again.',
              'error',
            );
            this.reloadHistoryFromFirstPage();
          },
        );
      });
  }

  loadHistory() {
    const requestId = ++this.historyRequestId;
    this.isLoadingHistory = true;
    this.nikshayBeneficiaryListService
      .getNikshayJobTriggerHistory(this.buildHistoryQuery())
      .subscribe(
        (response) => {
          if (requestId !== this.historyRequestId) return;
          this.isLoadingHistory = false;
          this.runs = response.runs;
          this.totalCount = this.getPaginatorLength(response);
          this.expandedRunId = null;
        },
        (err: any) => {
          if (requestId !== this.historyRequestId) return;
          this.isLoadingHistory = false;
          this.totalCount = 0;
          this.runs = [];
          this.dialogService.alert(
            err?.errorMessage ||
              'Could not load the job run history. Please try again.',
            'error',
          );
        },
      );
  }

  /** Without a total, a full page means there may be more, so allow one more page. */
  getPaginatorLength(response: NikshayJobRunHistoryResponse): number {
    if (response.total !== null) return response.total;
    const seen = this.pageIndex * this.pageSize + response.runs.length;
    return response.runs.length === this.pageSize ? seen + 1 : seen;
  }

  reloadHistoryFromFirstPage() {
    this.pageIndex = 0;
    this.loadHistory();
  }

  onHistoryPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadHistory();
  }

  toggleRun(run: NikshayJobRun) {
    this.expandedRunId =
      this.expandedRunId === run.jobRunId ? null : run.jobRunId;
  }

  isExpanded(run: NikshayJobRun): boolean {
    return this.expandedRunId === run.jobRunId;
  }

  getPhaseLabel(phase: NikshayPhaseKey): string {
    return PHASE_LABELS[phase] || phase;
  }

  getStatusLabel(status: string): string {
    if (status === 'SUCCESS') return 'Success';
    if (status === 'FAILED' || status === 'FAILURE') return 'Failure';
    return status
      ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, ' ')
      : '-';
  }

  getStatusClass(status: string): string {
    if (status === 'SUCCESS') return 'status-success';
    if (status === 'FAILED' || status === 'FAILURE') return 'status-failed';
    return 'status-other';
  }

  /** "21.9 s" or "2 min 5 s"; "-" while the run has no finish time. */
  getDuration(run: NikshayJobRun): string {
    if (!run.startedAt || !run.finishedAt) return '-';
    const ms =
      new Date(run.finishedAt).getTime() - new Date(run.startedAt).getTime();
    if (!(ms >= 0)) return '-';
    if (ms < 60_000) return `${(ms / 1000).toFixed(1)} s`;
    const totalSeconds = Math.round(ms / 1000);
    return `${Math.floor(totalSeconds / 60)} min ${totalSeconds % 60} s`;
  }

  getTriggerLabel(run: NikshayJobRun): string {
    return (
      TRIGGER_TYPE_OPTIONS.find((o) => o.value === run.triggerType)?.label ||
      run.triggerType ||
      '-'
    );
  }

  /** A range with only one end picked can't be applied. */
  get isDateRangeIncomplete(): boolean {
    return !!this.fromDate !== !!this.toDate;
  }

  get hasPendingFilterChanges(): boolean {
    const sameDay = (a: Date | null, b: Date | null) =>
      (a ? toDateParam(a) : null) === (b ? toDateParam(b) : null);
    return (
      !sameDay(this.fromDate, this.appliedFromDate) ||
      !sameDay(this.toDate, this.appliedToDate) ||
      this.triggerTypeFilter !== this.appliedTriggerType
    );
  }

  get canApplyFilters(): boolean {
    return !this.isDateRangeIncomplete && this.hasPendingFilterChanges;
  }

  get hasAppliedFilters(): boolean {
    return (
      (!!this.appliedFromDate && !!this.appliedToDate) ||
      !!this.appliedTriggerType
    );
  }

  /** Something to clear: a picked value or an applied filter. */
  get canClearFilters(): boolean {
    return (
      !!this.fromDate ||
      !!this.toDate ||
      !!this.triggerTypeFilter ||
      this.hasAppliedFilters
    );
  }

  applyFilters() {
    if (!this.canApplyFilters) return;
    this.appliedFromDate = this.fromDate;
    this.appliedToDate = this.toDate;
    this.appliedTriggerType = this.triggerTypeFilter;
    this.reloadHistoryFromFirstPage();
  }

  clearFilters() {
    this.fromDate = null;
    this.toDate = null;
    this.triggerTypeFilter = null;
    this.appliedFromDate = null;
    this.appliedToDate = null;
    this.appliedTriggerType = null;
    this.reloadHistoryFromFirstPage();
  }

  buildHistoryQuery(): NikshayJobTriggerHistoryQuery {
    const query: NikshayJobTriggerHistoryQuery = {
      page: this.pageIndex,
      size: this.pageSize,
    };
    if (this.appliedFromDate && this.appliedToDate) {
      query.fromDate = toDateParam(this.appliedFromDate);
      query.toDate = toDateParam(this.appliedToDate);
    }
    if (this.appliedTriggerType) query.triggerType = this.appliedTriggerType;
    return query;
  }
}
