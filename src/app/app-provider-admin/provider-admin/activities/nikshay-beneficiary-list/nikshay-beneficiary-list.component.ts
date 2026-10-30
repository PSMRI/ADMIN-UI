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
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import {
  BeneficiaryPhase,
  NikshayBeneficiaryListItem,
  NikshayBeneficiaryListQuery,
  NikshayBeneficiaryListResponse,
  NikshayBeneficiaryListService,
  NikshayPhaseKey,
  PhaseStatus,
} from '../services/nikshay-beneficiary-list.service';

type NikshayDisplayStatus = 'Success' | 'Pending' | 'Failed';

/** A phase as shown in the table: its display status and failure reason. */
interface NikshayStageStatus {
  status: NikshayDisplayStatus;
  reason?: string | null;
}

const NIKSHAY_STATUS_OPTIONS: NikshayDisplayStatus[] = [
  'Success',
  'Pending',
  'Failed',
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

/** Flip to true once the Nikshay beneficiary list API is live on the backend. */
const NIKSHAY_BENEFICIARY_LIST_API_AVAILABLE = false;

/** Builds a dummy phase with the fields the API returns. */
const dummyPhase = (
  status: PhaseStatus,
  errorDetail: string | null = null,
  failureReason: string | null = null,
): BeneficiaryPhase => ({
  status,
  failureReason,
  errorDetail,
  attempts: status === 'FAILED' ? 1 : 0,
  nikshayId: null,
  episodeId: null,
  lastAttemptAt: status === 'FAILED' ? '2026-10-28T18:54:59.000+00:00' : null,
  completedAt: null,
});

/** Index patient whose enrolment failed for want of a mapped NAAT device. */
const dummyIndex = (
  benRegId: number,
  beneficiaryId: number,
  name: string,
  village: number,
): NikshayBeneficiaryListItem => ({
  benRegId,
  beneficiaryId,
  name,
  beneficiaryType: 'INDEX',
  indexBenRegId: null,
  indexName: null,
  nikshayId: null,
  phases: {
    ENROLMENT: dummyPhase(
      'FAILED',
      `V10: No active NAAT device is mapped to Ni-kshay village ${village}`,
      'VILLAGE_MISSING',
    ),
    CONTACTS: dummyPhase('PENDING', "Waits for the index patient's enrolment"),
    XRAY_UPLOAD: dummyPhase('NOT_STARTED'),
    NAAT_UPLOAD: dummyPhase('NOT_STARTED'),
    TRANSFER_OUT: dummyPhase('NOT_STARTED'),
  },
});

/** Contact waiting on its index patient's enrolment. */
const dummyContact = (
  benRegId: number,
  beneficiaryId: number,
  name: string,
  indexBenRegId: number,
  indexName: string,
): NikshayBeneficiaryListItem => ({
  benRegId,
  beneficiaryId,
  name,
  beneficiaryType: 'CONTACT',
  indexBenRegId,
  indexName,
  nikshayId: null,
  phases: {
    ENROLMENT: dummyPhase(
      'PENDING',
      `Waits for index patient ${indexBenRegId} to be enrolled`,
    ),
    CONTACTS: dummyPhase('NOT_STARTED'),
    XRAY_UPLOAD: dummyPhase('NOT_STARTED'),
    NAAT_UPLOAD: dummyPhase('NOT_STARTED'),
    TRANSFER_OUT: dummyPhase('NOT_STARTED'),
  },
});

/** Placeholder rows (from a sample API response) shown until the API is live. */
const DUMMY_NIKSHAY_BENEFICIARY_LIST: NikshayBeneficiaryListItem[] = [
  dummyContact(9050505, 387508157278, 'ABC HSHS', 9050362, 'TESTONEE NONHH'),
  dummyIndex(9050503, 311020979145, 'TEST ONW TEATING', 109854),
  dummyContact(9050494, 638052519837, 'RF TF', 9050481, 'DEV SON'),
  dummyContact(9050493, 826556188623, 'SS F', 9050481, 'DEV SON'),
  dummyContact(9050483, 420382937408, 'DEVICE MALE', 9050481, 'DEV SON'),
  dummyContact(9050482, 886871913450, 'DEV SIS', 9050481, 'DEV SON'),
  dummyIndex(9050481, 508371781660, 'DEV SON', 107874),
  dummyContact(9050480, 505175821731, 'DEVICE PREG', 9050481, 'DEV SON'),
  dummyContact(9050479, 914866426790, 'TEST DEVICE ONE', 9050481, 'DEV SON'),
  dummyIndex(9050475, 293176947651, 'GG WIFE', 107874),
  dummyContact(9050474, 473126715140, 'GG OOH', 9050475, 'GG WIFE'),
  dummyContact(
    9050432,
    280394564428,
    'HUSBAND OF TEST TOO',
    9050421,
    'WIFE HELLO',
  ),
  dummyContact(
    9050431,
    272032743715,
    'TEST HOUSEHOLD FEMALE',
    9050421,
    'WIFE HELLO',
  ),
  dummyContact(
    9050425,
    351767004111,
    'SUBBA RAO SHRUTI HUSBAND',
    9050362,
    'TESTONEE NONHH',
  ),
  dummyIndex(9050421, 854057537889, 'WIFE HELLO', 107874),
  dummyContact(9050408, 732822768112, 'FENALE GSHS', 9050362, 'TESTONEE NONHH'),
  dummyContact(9050407, 776519650574, 'SHE HII', 9050362, 'TESTONEE NONHH'),
  dummyIndex(9050371, 238082195533, 'CHURCH LIVER', 107874),
  dummyIndex(9050362, 588113162954, 'TESTONEE NONHH', 107874),
  dummyContact(9050352, 631551471391, 'TEST EIGHT', 9050362, 'TESTONEE NONHH'),
];

/** Maps a phase status to the status shown in the table. */
const toDisplayStatus = (status?: PhaseStatus): NikshayDisplayStatus =>
  status === 'FAILED' ? 'Failed' : status === 'SUCCESS' ? 'Success' : 'Pending';

@Component({
  selector: 'app-nikshay-beneficiary-list',
  templateUrl: './nikshay-beneficiary-list.component.html',
  styleUrls: ['./nikshay-beneficiary-list.component.css'],
})
export class NikshayBeneficiaryListComponent implements OnInit, OnDestroy {
  isLoadingBeneficiaryList = false;
  /** Server-side paging state; pageIndex is 0-based like the API's page. */
  pageIndex = 0;
  pageSize = 5;
  totalCount = 0;
  private searchInput$ = new Subject<void>();
  beneficiaryListSearchTerm = '';
  stageOptions = NIKSHAY_STAGES;
  statusFilterOptions = NIKSHAY_STATUS_OPTIONS;
  /** Selections in the filter menu, committed only on Apply. */
  readonly anyStage = ANY_STAGE;
  pendingStageFilter: NikshayStageFilter | null = null;
  pendingStatusFilter: NikshayDisplayStatus | null = null;
  appliedStageFilter: NikshayStageFilter | null = null;
  appliedStatusFilter: NikshayDisplayStatus | null = null;
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
    this.searchInput$
      .pipe(debounceTime(300))
      .subscribe(() => this.reloadFromFirstPage());
    this.loadNikshayBeneficiaryList();
  }

  ngOnDestroy() {
    this.searchInput$.complete();
  }

  loadNikshayBeneficiaryList() {
    this.isLoadingBeneficiaryList = true;
    this.fetchBeneficiaryPage(this.buildQuery()).subscribe(
      (response) => {
        this.isLoadingBeneficiaryList = false;
        this.setBeneficiaryPage(response);
      },
      (err: any) => {
        this.isLoadingBeneficiaryList = false;
        this.dialogService.alert(
          err?.errorMessage ||
            'Could not load the Nikshay beneficiary list. Please try again.',
          'error',
        );
      },
    );
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNikshayBeneficiaryList();
  }

  onSearchInputChange() {
    this.searchInput$.next();
  }

  reloadFromFirstPage() {
    this.pageIndex = 0;
    this.loadNikshayBeneficiaryList();
  }

  buildQuery(): NikshayBeneficiaryListQuery {
    const hasStageFilter =
      !!this.appliedStageFilter && !!this.appliedStatusFilter;
    return {
      page: this.pageIndex,
      size: this.pageSize,
      search: this.beneficiaryListSearchTerm.trim() || undefined,
      phase:
        hasStageFilter && this.appliedStageFilter !== ANY_STAGE
          ? (this.appliedStageFilter as NikshayPhaseKey)
          : undefined,
      status: hasStageFilter
        ? (this.appliedStatusFilter!.toUpperCase() as PhaseStatus)
        : undefined,
    };
  }

  fetchBeneficiaryPage(
    query: NikshayBeneficiaryListQuery,
  ): Observable<NikshayBeneficiaryListResponse> {
    return NIKSHAY_BENEFICIARY_LIST_API_AVAILABLE
      ? this.nikshayBeneficiaryListService.getNikshayBeneficiaryList(query)
      : of(this.getDummyBeneficiaryPage(query));
  }

  /** Mimics the API's filtering and paging over the dummy rows. */
  getDummyBeneficiaryPage(
    query: NikshayBeneficiaryListQuery,
  ): NikshayBeneficiaryListResponse {
    const search = (query.search || '').toLowerCase();
    const status = query.status && toDisplayStatus(query.status);
    const matches = DUMMY_NIKSHAY_BENEFICIARY_LIST.filter((row) => {
      const matchesName = !search || row.name.toLowerCase().includes(search);
      const phases = query.phase
        ? [query.phase]
        : NIKSHAY_STAGES.map((stage) => stage.key);
      const matchesStatus =
        !status ||
        phases.some(
          (phase) => toDisplayStatus(row.phases[phase]?.status) === status,
        );
      return matchesName && matchesStatus;
    });
    const start = query.page * query.size;
    return {
      total: matches.length,
      page: query.page,
      size: query.size,
      beneficiaries: matches.slice(start, start + query.size),
    };
  }

  setBeneficiaryPage(response: NikshayBeneficiaryListResponse) {
    const offset = this.pageIndex * this.pageSize;
    this.totalCount = response?.total || 0;
    this.dataSource.data = (response?.beneficiaries || []).map(
      (row, index) => ({
        ...row,
        sno: offset + index + 1,
      }),
    );
  }

  /** Syncs the filter menu with the currently applied filter when it opens. */
  onStageFilterMenuOpened() {
    this.pendingStageFilter = this.appliedStageFilter;
    this.pendingStatusFilter = this.appliedStatusFilter;
  }

  applyStageFilter() {
    this.appliedStageFilter = this.pendingStageFilter;
    this.appliedStatusFilter = this.pendingStatusFilter;
    this.reloadFromFirstPage();
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
      ? `${stageLabel}: ${this.appliedStatusFilter}`
      : '';
  }

  /** Shows only the first and last character of the name, e.g. "A*******i". */
  maskName(name: string): string {
    const value = (name || '').trim();
    if (value.length <= 2) return value;
    return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
  }

  /** FAILED -> Failed, SUCCESS -> Success, anything else -> Pending. */
  getStageStatus(
    row: NikshayBeneficiaryListItem,
    stage: NikshayPhaseKey,
  ): NikshayStageStatus {
    const phase = row.phases?.[stage];
    const status = toDisplayStatus(phase?.status);
    return status === 'Failed'
      ? { status, reason: phase.failureReason || phase.errorDetail }
      : { status };
  }

  onStageRetryClick(_row: NikshayBeneficiaryListItem, _stage: NikshayPhaseKey) {
    this.dialogService.alert(
      'Retry will be available once the Nikshay sync API is ready.',
      'info',
    );
  }
}
