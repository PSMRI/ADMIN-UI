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

/** Filters sent with the list request; the API does not page yet. */
export interface NikshayBeneficiaryListQuery {
  phase?: NikshayPhaseKey;
  status?: PhaseStatus;
}

@Injectable()
export class NikshayBeneficiaryListService {
  constructor(private http: HttpClient) {}

  getNikshayBeneficiaryList(
    query: NikshayBeneficiaryListQuery,
  ): Observable<NikshayBeneficiaryListItem[]> {
    let params = new HttpParams();
    if (query.phase) params = params.set('phase', query.phase);
    if (query.status) params = params.set('status', query.status);

    return this.http
      .get(environment.nikshay_GetBeneficiaryList_Url, { params })
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }
          // Accept the payload bare or wrapped in { data: ... }, as a list
          // or as { beneficiaries: [...] }
          const data = response?.data ?? response;
          return Array.isArray(data) ? data : data?.beneficiaries || [];
        }),
      );
  }

  /** Re-runs a phase for the given beneficiaries straight away. */
  reprocessPhase(phase: NikshayPhaseKey, benRegIds: number[]): Observable<any> {
    const params = new HttpParams().set('runNow', 'true');
    return this.http
      .post(
        `${environment.nikshay_ReprocessPhase_Url}${phase}/reprocess`,
        benRegIds,
        {
          params,
        },
      )
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }
          return response?.data ?? response;
        }),
      );
  }
}
