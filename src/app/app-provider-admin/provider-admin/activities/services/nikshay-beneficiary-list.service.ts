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
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

/** NOT_STARTED is a filter only; the API never returns it as a stored status. */
export type PhaseStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'DONE'
  | 'FAILED'
  | 'NOT_APPLICABLE'
  | 'NOT_STARTED';

export type BeneficiaryType = 'CONTACT' | 'INDEX';

export type NikshayPhaseKey =
  | 'ENROLMENT'
  | 'CONTACTS'
  | 'XRAY_UPLOAD'
  | 'NAAT_UPLOAD'
  | 'TRANSFER_OUT';

export interface BeneficiaryPhase {
  status: PhaseStatus;
  failureReason: string | null;
  errorDetail: string | null;
  attempts: number;
  nikshayId: string | null;
  episodeId: string | null;
  lastAttemptAt: string | null;
  completedAt: string | null;
}

/** A phase is missing when it has no row yet (NOT_STARTED). */
export type NikshayBeneficiaryPhases = Partial<
  Record<NikshayPhaseKey, BeneficiaryPhase>
>;

export interface NikshayBeneficiaryListItem {
  benRegId: number;
  beneficiaryId: number;
  beneficiaryType: BeneficiaryType;
  indexBenRegId: number | null;
  indexName: string | null;
  name: string;
  nikshayId: string | null;
  phases: NikshayBeneficiaryPhases;
}

export interface NikshayBeneficiaryListResponse {
  total: number;
  page: number;
  size: number;
  beneficiaries: NikshayBeneficiaryListItem[];
}

/** Page and filters sent with the list request; page is 0-based. */
export interface NikshayBeneficiaryListQuery {
  page: number;
  size: number;
  phase?: NikshayPhaseKey;
  status?: PhaseStatus;
}

/** Counts the job reports for a whole run and for each phase pass. */
export interface NikshayJobCounts {
  picked: number;
  succeeded: number;
  failed: number;
  notApplicable: number;
  waiting: number;
}

/** One pass of one phase within a run; XRAY_UPLOAD and NAAT_UPLOAD run twice. */
export interface NikshayJobPhaseResult extends NikshayJobCounts {
  phase: NikshayPhaseKey;
  pass: number;
  result: string;
}

export interface NikshayJobRunSummary extends NikshayJobCounts {
  phases: NikshayJobPhaseResult[];
}

/** One run of the Nikshay job, scheduled or triggered manually. */
export interface NikshayJobRun {
  jobRunId: string;
  triggerType: string;
  triggeredBy: string | null;
  status: string;
  startedAt: string | null;
  finishedAt: string | null;
  summary: NikshayJobRunSummary | null;
  message: string | null;
}

/** total (the API's totalElements) is null when the API does not report it. */
export interface NikshayJobRunHistoryResponse {
  total: number | null;
  page: number;
  size: number;
  runs: NikshayJobRun[];
}

/** JOB runs come from the schedule; MANUAL ones were triggered by a user. */
export type NikshayJobTriggerType = 'JOB' | 'MANUAL';

/** Page (0-based), an optional inclusive date range as yyyy-MM-dd, and trigger type. */
export interface NikshayJobTriggerHistoryQuery {
  page: number;
  size: number;
  fromDate?: string;
  toDate?: string;
  triggerType?: NikshayJobTriggerType;
}

@Injectable()
export class NikshayBeneficiaryListService {
  constructor(private http: HttpClient) {}

  getNikshayBeneficiaryList(
    query: NikshayBeneficiaryListQuery,
  ): Observable<NikshayBeneficiaryListResponse> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('size', String(query.size));
    if (query.phase) params = params.set('phase', query.phase);
    if (query.status) params = params.set('status', query.status);

    return this.http
      .get(environment.nikshay_GetBeneficiaryList_Url, { params })
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }

          const data = response?.data ?? response;
          return {
            total: data?.total || 0,
            page: data?.page || 0,
            size: data?.size || query.size,
            beneficiaries: data?.beneficiaries || [],
          };
        }),
      );
  }

  /** Re-runs a phase for the given beneficiaries straight away. */
  reprocessPhase(phase: NikshayPhaseKey, benRegIds: number[]): Observable<any> {
    const params = new HttpParams().set('runNow', 'true');
    return this.http
      .post(`${environment.nikshay_Phase_Url}${phase}/reprocess`, benRegIds, {
        params,
      })
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }
          return response?.data ?? response;
        }),
      );
  }

  /** Runs the scheduled Nikshay sync job straight away. */
  runNikshayJob(): Observable<any> {
    return this.http.post(environment.nikshay_RunJob_Url, null).pipe(
      map((response: any) => {
        if (response?.statusCode && response.statusCode !== 200) {
          throw { errorMessage: response?.errorMessage || 'Request failed' };
        }
        return response?.data ?? response;
      }),
    );
  }

  getNikshayJobTriggerHistory(
    query: NikshayJobTriggerHistoryQuery,
  ): Observable<NikshayJobRunHistoryResponse> {
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('size', String(query.size));
    if (query.fromDate) params = params.set('fromDate', query.fromDate);
    if (query.toDate) params = params.set('toDate', query.toDate);
    if (query.triggerType)
      params = params.set('triggerType', query.triggerType);

    return this.http
      .get(environment.nikshay_JobTriggerHistory_Url, { params })
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }
          const data = response?.data ?? response;
          return {
            total:
              typeof data?.totalElements === 'number'
                ? data.totalElements
                : typeof data?.total === 'number'
                  ? data.total
                  : null,
            page: data?.page || 0,
            size: data?.size || query.size,
            runs: data?.runs || [],
          };
        }),
      );
  }
}
