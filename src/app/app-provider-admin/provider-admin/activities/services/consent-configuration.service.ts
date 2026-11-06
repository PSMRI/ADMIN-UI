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
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

// Shapes of the consent configuration contract (Common-UI specs/002-consent-configuration/data-model.md).

export type ConsentMode =
  | 'SELF_READ'
  | 'READ_ALOUD'
  | 'VOICE_CLIP'
  | 'WITNESSED'
  | 'SIGNATURE_PHOTO'
  | 'OTP';

/** DPDP: voice recording is part of Read aloud, so it is never offered. */
export const RETIRED_CONSENT_MODES: ConsentMode[] = ['VOICE_CLIP'];

export interface ModeSettings {
  voiceMinSeconds?: number;
  otpTarget?: 'PATIENT' | 'GUARDIAN';
  witnessRelationshipRequired?: boolean;
  photos?: 'BOTH' | 'SIGNED_FORM_ONLY';
}

export interface ModeConfig {
  mode: ConsentMode;
  rank: number;
  settings: ModeSettings;
}

export interface PurposeConfig {
  purposeCode: string;
  shown: boolean;
  rank: number;
  isMandatory: boolean;
}

export interface ContextConfig {
  enabled: boolean;
  mandatory: boolean;
  modes: ModeConfig[];
  defaultMode: ConsentMode | null;
  purposes: PurposeConfig[];
  languages: string[];
  guardian: { enabled: boolean; ageThreshold: number };
}

export interface ProjectConsentConfig {
  projectId: number;
  projectName: string;
  serviceProviderId: number;
  version: number;
  savedBy: string | null;
  savedAt: string | null;
  registration: ContextConfig;
  revisit: ContextConfig | null;
}

export interface ConsentConfigMasters {
  modes: { mode: ConsentMode; name: string }[];
  purposes: { purposeCode: string; name: string; isMandatory: boolean }[];
  languages: {
    languageCode: string;
    languageName: string;
    hasNotice: boolean;
  }[];
  projects: { projectId: number; version: number }[];
}

export interface SaveConsentConfigRequest {
  projectId: number;
  projectName: string;
  serviceProviderId: number;
  registration: ContextConfig;
  revisit: ContextConfig | null;
  createdBy?: string;
  modifiedBy?: string;
  baseVersion?: number;
}

export type ConsentContext = 'REGISTRATION' | 'REVISIT';

/** Who patients contact for questions or complaints (DPDP, spec 003-dpdp-consent-changes). */
export interface ConsentGrievance {
  officerName: string;
  phone: string;
  email: string;
  address: string;
  officeHours: string;
}

/** The text of a consent message: what field staff show the patient (feature 003). */
export interface ConsentNoticeContent {
  body: string;
  dataItems: string;
  retention: string;
  recipients: string;
  withdrawalInfo: string;
  /** Kept for older field apps; built from `grievance` on save. */
  grievanceInfo: string;
  /** DPDP: what the patient agrees to; required to publish. */
  declaration: string;
  /** DPDP: wording when a guardian / representative consents; optional. */
  representativeDeclaration: string;
  grievance: ConsentGrievance;
}

export interface ConsentNoticeDraft extends ConsentNoticeContent {
  savedBy: string | null;
  savedAt: string | null;
}

export interface ConsentNoticePublished extends ConsentNoticeContent {
  noticeVersionId: number;
  /** 1 for the first publish of this project, context and language. */
  version: number;
  publishedBy: string | null;
  publishedAt: string | null;
  /** Translated by the server from the English message (only English is written by admins). */
  machineTranslated?: boolean;
  /** Version of the English message this translation was made from. */
  sourceVersion?: number | null;
}

/** One project, context and language; null parts are not written yet. */
export interface ConsentNoticeEntry {
  projectId: number;
  context: ConsentContext;
  languageCode: string;
  draft: ConsentNoticeDraft | null;
  published: ConsentNoticePublished | null;
}

export interface SaveNoticeDraftRequest extends ConsentNoticeContent {
  projectId: number;
  serviceProviderId: number;
  context: ConsentContext;
  languageCode: string;
  savedBy: string;
}

export interface PublishNoticeRequest {
  projectId: number;
  serviceProviderId: number;
  context: ConsentContext;
  languageCode: string;
  /** Patients who already consented are asked again on their next visit. */
  requireReconsent: boolean;
  publishedBy: string;
  /** Languages the server translates the published English message into. */
  translateTo: string[];
}

/** One row of a legacy consent file, as read from the sheet (DPDP legacy upload). */
export interface LegacyConsentRow {
  rowNo: number;
  beneficiaryId: string;
  consentDate: string;
  purposesGranted: string;
  languageCode: string;
  mode: string;
  representativeName: string;
  representativeRelationship: string;
  remarks: string;
}

export type LegacyRowStatus = 'VALID' | 'ERROR' | 'IMPORTED' | 'SKIPPED';

export interface LegacyRowResult {
  rowNo: number;
  beneficiaryId: string;
  status: LegacyRowStatus;
  reasons: string[];
}

export interface LegacyBatch {
  batchId: string;
  fileName: string;
  uploadedBy: string | null;
  uploadedAt: string | null;
  total: number;
  valid: number;
  imported: number;
  skipped: number;
  failed: number;
  rows: LegacyRowResult[];
}

export interface ValidateLegacyRequest {
  serviceProviderId: number;
  fileName: string;
  uploadedBy: string;
  rows: LegacyConsentRow[];
}

/**
 * A new UUID v4 for the Idempotency-Key header. crypto.randomUUID needs a secure context (HTTPS or
 * localhost), so plain-HTTP servers build it from crypto.getRandomValues.
 */
export function newIdempotencyKey(): string {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const b = crypto.getRandomValues(new Uint8Array(16));
  b[6] = (b[6] & 0x0f) | 0x40;
  b[8] = (b[8] & 0x3f) | 0x80;
  const hex = Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

function keyHeader(idempotencyKey: string): HttpHeaders {
  return new HttpHeaders({ 'Idempotency-Key': idempotencyKey });
}

@Injectable({
  providedIn: 'root',
})
export class ConsentConfigurationService {
  constructor(private http: HttpClient) {}

  getMasters(serviceProviderId: number): Observable<any> {
    return this.http.get(
      `${environment.getConsentConfigMasters}?serviceProviderId=${serviceProviderId}`,
    );
  }

  fetchAllConfigs(serviceProviderId: number): Observable<any> {
    return this.http.post(environment.fetchAllConsentConfigs, {
      serviceProviderId,
    });
  }

  fetchConfig(projectId: number, serviceProviderId: number): Observable<any> {
    return this.http.post(environment.fetchConsentConfigByProject, {
      projectId,
      serviceProviderId,
    });
  }

  /** Each call (one click of Save) sends a new Idempotency-Key, so a retry is safe. */
  saveConfig(
    reqObj: SaveConsentConfigRequest,
    idempotencyKey: string = newIdempotencyKey(),
  ): Observable<any> {
    return this.http.post(environment.saveConsentConfig, reqObj, {
      headers: keyHeader(idempotencyKey),
    });
  }

  updateConfig(
    reqObj: SaveConsentConfigRequest,
    idempotencyKey: string = newIdempotencyKey(),
  ): Observable<any> {
    return this.http.post(environment.updateConsentConfig, reqObj, {
      headers: keyHeader(idempotencyKey),
    });
  }

  fetchNotices(projectId: number, serviceProviderId: number): Observable<any> {
    return this.http.post(environment.fetchConsentNotices, {
      projectId,
      serviceProviderId,
    });
  }

  /** Each call (one click of Save draft) sends a new Idempotency-Key. */
  saveNoticeDraft(
    reqObj: SaveNoticeDraftRequest,
    idempotencyKey: string = newIdempotencyKey(),
  ): Observable<any> {
    return this.http.post(environment.saveConsentNoticeDraft, reqObj, {
      headers: keyHeader(idempotencyKey),
    });
  }

  /** Each call (one click of Publish) sends a new Idempotency-Key. */
  publishNotice(
    reqObj: PublishNoticeRequest,
    idempotencyKey: string = newIdempotencyKey(),
  ): Observable<any> {
    return this.http.post(environment.publishConsentNotice, reqObj, {
      headers: keyHeader(idempotencyKey),
    });
  }

  validateLegacyConsents(reqObj: ValidateLegacyRequest): Observable<any> {
    return this.http.post(environment.validateLegacyConsents, reqObj);
  }

  importLegacyConsents(batchId: string, importedBy: string): Observable<any> {
    return this.http.post(environment.importLegacyConsents, {
      batchId,
      importedBy,
    });
  }
}
