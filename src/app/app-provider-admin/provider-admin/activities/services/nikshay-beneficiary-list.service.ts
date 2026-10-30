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

export type PhaseStatus = 'SUCCESS' | 'PENDING' | 'NOT_STARTED' | 'FAILED';

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

export type NikshayBeneficiaryPhases = Record<
  NikshayPhaseKey,
  BeneficiaryPhase
>;

export interface NikshayBeneficiaryListItem {
  sno?: number;
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

/** Page and filters sent with each list request; page is 0-based. */
export interface NikshayBeneficiaryListQuery {
  page: number;
  size: number;
  search?: string;
  phase?: NikshayPhaseKey;
  status?: PhaseStatus;
}

@Injectable()
export class NikshayBeneficiaryListService {
  constructor(private http: HttpClient) {}

  getNikshayBeneficiaryList(
    query: NikshayBeneficiaryListQuery,
  ): Observable<NikshayBeneficiaryListResponse> {
    // TODO: confirm the search/phase/status param names with the backend
    let params = new HttpParams()
      .set('page', String(query.page))
      .set('size', String(query.size));
    if (query.search) params = params.set('search', query.search);
    if (query.phase) params = params.set('phase', query.phase);
    if (query.status) params = params.set('status', query.status);

    return this.http
      .get(environment.nikshay_GetBeneficiaryList_Url, { params })
      .pipe(
        map((response: any) => {
          if (response?.statusCode && response.statusCode !== 200) {
            throw { errorMessage: response?.errorMessage || 'Request failed' };
          }
          // Accept both the bare payload and one wrapped in { data: ... }
          return response?.data ?? response;
        }),
      );
  }
}
