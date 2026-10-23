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
import { HttpClient } from '@angular/common/http';
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

  fetchConfig(projectId: number, serviceProviderId: number): Observable<any> {
    return this.http.post(environment.fetchConsentConfigByProject, {
      projectId,
      serviceProviderId,
    });
  }

  saveConfig(reqObj: SaveConsentConfigRequest): Observable<any> {
    return this.http.post(environment.saveConsentConfig, reqObj);
  }

  updateConfig(reqObj: SaveConsentConfigRequest): Observable<any> {
    return this.http.post(environment.updateConsentConfig, reqObj);
  }
}
