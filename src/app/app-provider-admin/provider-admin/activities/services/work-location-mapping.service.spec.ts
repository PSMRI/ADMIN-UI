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
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { WorkLocationMapping } from './work-location-mapping.service';

// Covers the villages batching fix: a "select all" facility pick can pass
// 1000+ facilityIDs, which used to go out as one oversized GET query string
// and get rejected before reaching the controller. getNikshayVillages now
// splits that into batches — these tests pin down that the split preserves
// every ID, keeps result order, and drops back to zero requests for an
// empty selection.
describe('WorkLocationMapping - getNikshayVillages batching', () => {
  let service: WorkLocationMapping;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WorkLocationMapping],
    });
    service = TestBed.inject(WorkLocationMapping);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends a single request when facilityIDs fits in one batch', () => {
    const facilityIDs = [1, 2, 3];
    let result: any;
    service.getNikshayVillages(facilityIDs).subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      `${environment.nikshayVillages_url}?facilityIDs=1,2,3`,
    );
    req.flush({ data: [{ nikshayVillageID: 10 }, { nikshayVillageID: 11 }] });

    expect(result.data).toEqual([
      { nikshayVillageID: 10 },
      { nikshayVillageID: 11 },
    ]);
  });

  it('splits a large facilityIDs list into 200-sized batches and merges results in order', () => {
    const facilityIDs = Array.from({ length: 450 }, (_, i) => i + 1); // 1..450
    let result: any;
    service.getNikshayVillages(facilityIDs).subscribe((r) => (result = r));

    const requests = httpMock.match(() => true);
    expect(requests.length).toBe(3); // 200 + 200 + 50

    const batch1 = Array.from({ length: 200 }, (_, i) => i + 1);
    const batch2 = Array.from({ length: 200 }, (_, i) => i + 201);
    const batch3 = Array.from({ length: 50 }, (_, i) => i + 401);

    expect(requests[0].request.url).toContain(
      `facilityIDs=${batch1.join(',')}`,
    );
    expect(requests[1].request.url).toContain(
      `facilityIDs=${batch2.join(',')}`,
    );
    expect(requests[2].request.url).toContain(
      `facilityIDs=${batch3.join(',')}`,
    );

    // Flush out of order to prove forkJoin re-assembles by request order,
    // not completion order.
    requests[2].flush({ data: [{ nikshayVillageID: 3 }] });
    requests[0].flush({ data: [{ nikshayVillageID: 1 }] });
    requests[1].flush({ data: [{ nikshayVillageID: 2 }] });

    expect(result.data).toEqual([
      { nikshayVillageID: 1 },
      { nikshayVillageID: 2 },
      { nikshayVillageID: 3 },
    ]);
  });

  it('returns an empty list without making any request for an empty selection', () => {
    let result: any;
    service.getNikshayVillages([]).subscribe((r) => (result = r));

    httpMock.expectNone(() => true);
    expect(result).toEqual({ data: [] });
  });
});
