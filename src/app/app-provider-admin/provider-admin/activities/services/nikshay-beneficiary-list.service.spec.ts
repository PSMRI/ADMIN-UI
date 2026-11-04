import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { NikshayBeneficiaryListService } from './nikshay-beneficiary-list.service';

describe('NikshayBeneficiaryListService', () => {
  let service: NikshayBeneficiaryListService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NikshayBeneficiaryListService],
    });
    service = TestBed.inject(NikshayBeneficiaryListService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('sends page and size as query params and omits phase/status when unset', () => {
    service.getNikshayBeneficiaryList({ page: 0, size: 20 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_GetBeneficiaryList_Url,
    );
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.has('phase')).toBeFalse();
    expect(req.request.params.has('status')).toBeFalse();
    req.flush({ data: { total: 0, page: 0, size: 20, beneficiaries: [] } });
  });

  it('includes phase and status query params when given', () => {
    service
      .getNikshayBeneficiaryList({
        page: 1,
        size: 10,
        phase: 'ENROLMENT',
        status: 'FAILED',
      })
      .subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_GetBeneficiaryList_Url,
    );
    expect(req.request.params.get('phase')).toBe('ENROLMENT');
    expect(req.request.params.get('status')).toBe('FAILED');
    req.flush({ data: { total: 0, page: 1, size: 10, beneficiaries: [] } });
  });

  it('maps a full response into the expected shape', () => {
    let result: any;
    service
      .getNikshayBeneficiaryList({ page: 0, size: 20 })
      .subscribe((res) => (result = res));
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_GetBeneficiaryList_Url,
    );
    req.flush({
      data: {
        total: 42,
        page: 0,
        size: 20,
        beneficiaries: [{ benRegId: 1, name: 'A' }],
      },
    });
    expect(result).toEqual({
      total: 42,
      page: 0,
      size: 20,
      beneficiaries: [{ benRegId: 1, name: 'A' }],
    });
  });

  it('defaults missing fields when the response is sparse', () => {
    let result: any;
    service
      .getNikshayBeneficiaryList({ page: 0, size: 20 })
      .subscribe((res) => (result = res));
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_GetBeneficiaryList_Url,
    );
    req.flush({});
    expect(result).toEqual({ total: 0, page: 0, size: 20, beneficiaries: [] });
  });

  it('throws with the backend errorMessage when statusCode is not 200', () => {
    let error: any;
    service.getNikshayBeneficiaryList({ page: 0, size: 20 }).subscribe({
      next: () => fail('should not succeed'),
      error: (err) => (error = err),
    });
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_GetBeneficiaryList_Url,
    );
    req.flush({ statusCode: 500, errorMessage: 'Server exploded' });
    expect(error.errorMessage).toBe('Server exploded');
  });

  it('reprocessPhase posts the benRegIds with runNow=true', () => {
    service.reprocessPhase('XRAY_UPLOAD', [1, 2]).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === `${environment.nikshay_Phase_Url}XRAY_UPLOAD/reprocess`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.params.get('runNow')).toBe('true');
    expect(req.request.body).toEqual([1, 2]);
    req.flush({ data: {} });
  });

  it('runNikshayJob posts to the job run URL with no body', () => {
    let result: any;
    service.runNikshayJob().subscribe((res) => (result = res));
    const req = httpMock.expectOne(environment.nikshay_RunJob_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush({ statusCode: 200, data: { message: 'Job started' } });
    expect(result).toEqual({ message: 'Job started' });
    expect(environment.nikshay_RunJob_Url).toMatch(/nikshay\/phase\/job\/run$/);
  });

  it('runNikshayJob throws with the backend errorMessage when statusCode is not 200', () => {
    let error: any;
    service.runNikshayJob().subscribe({ error: (e) => (error = e) });
    httpMock
      .expectOne(environment.nikshay_RunJob_Url)
      .flush({ statusCode: 5000, errorMessage: 'Job already running' });
    expect(error).toEqual({ errorMessage: 'Job already running' });
  });

  it('getNikshayJobTriggerHistory sends page, size and the date range', () => {
    let result: any;
    service
      .getNikshayJobTriggerHistory({
        page: 1,
        size: 20,
        fromDate: '2026-11-01',
        toDate: '2026-11-03',
      })
      .subscribe((res) => (result = res));
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_JobTriggerHistory_Url,
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('size')).toBe('20');
    expect(req.request.params.get('fromDate')).toBe('2026-11-01');
    expect(req.request.params.get('toDate')).toBe('2026-11-03');
    const runs = [{ jobRunId: 'run-1', status: 'SUCCESS', summary: null }];
    req.flush({
      statusCode: 200,
      data: { total: 21, page: 1, size: 20, runs },
    });
    expect(result).toEqual({ total: 21, page: 1, size: 20, runs });
  });

  it('getNikshayJobTriggerHistory reads the total from totalElements', () => {
    let result: any;
    service
      .getNikshayJobTriggerHistory({ page: 0, size: 10 })
      .subscribe((res) => (result = res));
    const runs = [{ jobRunId: 'run-1' }];
    httpMock
      .expectOne((r) => r.url === environment.nikshay_JobTriggerHistory_Url)
      .flush({ size: 10, page: 0, runs, totalElements: 15 });
    expect(result).toEqual({ total: 15, page: 0, size: 10, runs });
  });

  it('getNikshayJobTriggerHistory reports a null total when the API sends none', () => {
    let result: any;
    service
      .getNikshayJobTriggerHistory({ page: 0, size: 50 })
      .subscribe((res) => (result = res));
    const runs = [{ jobRunId: 'run-1' }];
    httpMock
      .expectOne((r) => r.url === environment.nikshay_JobTriggerHistory_Url)
      .flush({ size: 50, page: 0, runs });
    expect(result).toEqual({ total: null, page: 0, size: 50, runs });
  });

  it('getNikshayJobTriggerHistory sends the trigger type when set', () => {
    service
      .getNikshayJobTriggerHistory({ page: 0, size: 10, triggerType: 'MANUAL' })
      .subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_JobTriggerHistory_Url,
    );
    expect(req.request.params.get('triggerType')).toBe('MANUAL');
    req.flush({ statusCode: 200, data: {} });
  });

  it('getNikshayJobTriggerHistory omits the dates when no range is set', () => {
    service.getNikshayJobTriggerHistory({ page: 0, size: 10 }).subscribe();
    const req = httpMock.expectOne(
      (r) => r.url === environment.nikshay_JobTriggerHistory_Url,
    );
    expect(req.request.params.has('fromDate')).toBeFalse();
    expect(req.request.params.has('toDate')).toBeFalse();
    expect(req.request.params.has('triggerType')).toBeFalse();
    req.flush({ statusCode: 200, data: {} });
  });
});
