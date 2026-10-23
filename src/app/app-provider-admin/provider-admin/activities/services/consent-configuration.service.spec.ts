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
    req.flush({ statusCode: 200, data: { version: 1 } });
  });

  it('updates with the base version', () => {
    service
      .updateConfig({ ...body, baseVersion: 4, modifiedBy: 'padmin1' })
      .subscribe();
    const req = http.expectOne(environment.updateConsentConfig);
    expect(req.request.body.baseVersion).toBe(4);
    req.flush({ statusCode: 200, data: { version: 5 } });
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
});
