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
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import {
  ConsentConfigurationService,
  SaveConsentConfigRequest,
  newIdempotencyKey,
} from './consent-configuration.service';

describe('ConsentConfigurationService', () => {
  let service: ConsentConfigurationService;
  let http: HttpTestingController;

  const body: SaveConsentConfigRequest = {
    projectId: 12,
    projectName: 'Test Project A',
    serviceProviderId: 1,
    registration: {
      enabled: true,
      mandatory: true,
      modes: [{ mode: 'OTP', rank: 1, settings: {} }],
      defaultMode: 'OTP',
      purposes: [],
      languages: [],
      guardian: { enabled: true, ageThreshold: 18 },
    },
    revisit: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(ConsentConfigurationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('gets the masters for the provider', () => {
    let result: any;
    service.getMasters(1).subscribe((r) => (result = r));
    const req = http.expectOne(
      `${environment.getConsentConfigMasters}?serviceProviderId=1`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ statusCode: 200, data: { projects: [] } });
    expect(result.data.projects).toEqual([]);
  });

  it('fetches all mapped project configurations for the provider', () => {
    service.fetchAllConfigs(1).subscribe();
    const req = http.expectOne(environment.fetchAllConsentConfigs);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ serviceProviderId: 1 });
    req.flush({ statusCode: 200, data: [] });
  });

  it('fetches one project configuration', () => {
    service.fetchConfig(12, 1).subscribe();
    const req = http.expectOne(environment.fetchConsentConfigByProject);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ projectId: 12, serviceProviderId: 1 });
    req.flush({ statusCode: 200, data: null });
  });

  it('saves the first version', () => {
    service.saveConfig({ ...body, createdBy: 'padmin1' }).subscribe();
    const req = http.expectOne(environment.saveConsentConfig);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.createdBy).toBe('padmin1');
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    req.flush({ statusCode: 200, data: { version: 1 } });
    service.saveConfig(body, 'k-save').subscribe();
    const keyed = http.expectOne(environment.saveConsentConfig);
    expect(keyed.request.headers.get('Idempotency-Key')).toBe('k-save');
    keyed.flush({ statusCode: 200, data: { version: 1 } });
  });

  it('updates with the base version', () => {
    service
      .updateConfig({ ...body, baseVersion: 4, modifiedBy: 'padmin1' })
      .subscribe();
    const req = http.expectOne(environment.updateConsentConfig);
    expect(req.request.body.baseVersion).toBe(4);
    expect(req.request.headers.get('Idempotency-Key')).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );
    req.flush({ statusCode: 200, data: { version: 5 } });
    service.updateConfig(body, 'k-update').subscribe();
    const keyed = http.expectOne(environment.updateConsentConfig);
    expect(keyed.request.headers.get('Idempotency-Key')).toBe('k-update');
    keyed.flush({ statusCode: 200, data: { version: 5 } });
  });

  it('passes errors through unchanged', () => {
    let status = 0;
    service.updateConfig(body).subscribe({ error: (e) => (status = e.status) });
    http
      .expectOne(environment.updateConsentConfig)
      .flush(
        { data: { reason: 'STALE_VERSION' } },
        { status: 409, statusText: 'Conflict' },
      );
    expect(status).toBe(409);
  });

  describe('legacy consent upload (DPDP)', () => {
    it('sends the rows to be checked', () => {
      const body = {
        serviceProviderId: 1,
        fileName: 'old.xlsx',
        uploadedBy: 'padmin1',
        rows: [],
      };
      service.validateLegacyConsents(body).subscribe();
      const req = http.expectOne(environment.validateLegacyConsents);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(body);
      req.flush({ statusCode: 200, data: {} });
    });

    it('imports a checked batch', () => {
      service.importLegacyConsents('lb-1', 'padmin1').subscribe();
      const req = http.expectOne(environment.importLegacyConsents);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({
        batchId: 'lb-1',
        importedBy: 'padmin1',
      });
      req.flush({ statusCode: 200, data: {} });
    });
  });

  describe('newIdempotencyKey', () => {
    const v4 =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

    it('makes a new UUID v4 each time', () => {
      const a = newIdempotencyKey();
      expect(a).toMatch(v4);
      expect(newIdempotencyKey()).not.toBe(a);
    });

    it('works without crypto.randomUUID (plain-HTTP servers)', () => {
      (crypto as any).randomUUID = undefined;
      try {
        expect(newIdempotencyKey()).toMatch(v4);
      } finally {
        delete (crypto as any).randomUUID;
      }
    });
  });

  describe('consent messages (feature 003)', () => {
    it("fetches a project's messages", () => {
      service.fetchNotices(12, 1).subscribe();
      const req = http.expectOne(environment.fetchConsentNotices);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ projectId: 12, serviceProviderId: 1 });
      req.flush({ statusCode: 200, data: [] });
    });

    it('saves a draft and publishes it', () => {
      const draft = {
        projectId: 12,
        serviceProviderId: 1,
        context: 'REGISTRATION' as const,
        languageCode: 'en',
        body: 'We ask for your consent',
        dataItems: '',
        retention: '',
        recipients: '',
        withdrawalInfo: '',
        grievanceInfo: '',
        declaration: 'I agree',
        representativeDeclaration: '',
        grievance: {
          officerName: '',
          phone: '1800',
          email: '',
          address: '',
          officeHours: '',
        },
        savedBy: 'padmin1',
      };
      service.saveNoticeDraft(draft).subscribe();
      const save = http.expectOne(environment.saveConsentNoticeDraft);
      expect(save.request.body).toBe(draft);
      const key = save.request.headers.get('Idempotency-Key');
      expect(key).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      save.flush({ statusCode: 200, data: {} });
      service.saveNoticeDraft(draft).subscribe();
      const again = http.expectOne(environment.saveConsentNoticeDraft);
      expect(again.request.headers.get('Idempotency-Key')).not.toBe(key);
      again.flush({ statusCode: 200, data: {} });
      service.saveNoticeDraft(draft, 'fixed-key').subscribe();
      const fixed = http.expectOne(environment.saveConsentNoticeDraft);
      expect(fixed.request.headers.get('Idempotency-Key')).toBe('fixed-key');
      fixed.flush({ statusCode: 200, data: {} });
      const publish = {
        projectId: 12,
        serviceProviderId: 1,
        context: 'REGISTRATION' as const,
        languageCode: 'en',
        requireReconsent: true,
        publishedBy: 'padmin1',
        translateTo: ['hi', 'as'],
      };
      service.publishNotice(publish).subscribe();
      const pub = http.expectOne(environment.publishConsentNotice);
      expect(pub.request.method).toBe('POST');
      expect(pub.request.body).toBe(publish);
      expect(pub.request.headers.get('Idempotency-Key')).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
      );
      pub.flush({ statusCode: 200, data: {} });
    });
  });
});
