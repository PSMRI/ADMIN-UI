import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { PhiTransferConfigService } from './phi-transfer-config.service';

describe('PhiTransferConfigService', () => {
  let service: PhiTransferConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PhiTransferConfigService],
    });
    service = TestBed.inject(PhiTransferConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAllDesignatedPhi hits the getAll URL with no query params', () => {
    service.getAllDesignatedPhi().subscribe();
    const req = httpMock.expectOne(environment.phi_GetAllDesignatedPhi_Url);
    expect(req.request.method).toBe('GET');
    req.flush({ statusCode: 200, data: [] });
  });

  it('createDesignatedPhi posts to the save URL', () => {
    const body = { villageId: 1 };
    service.createDesignatedPhi(body).subscribe();
    const req = httpMock.expectOne(environment.phi_CreateDesignatedPhi_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ statusCode: 200, data: {} });
  });

  it('updateDesignatedPhi posts to the update URL', () => {
    const body = { id: 1 };
    service.updateDesignatedPhi(body).subscribe();
    const req = httpMock.expectOne(environment.phi_UpdateDesignatedPhi_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ statusCode: 200, data: {} });
  });

  it('getDesignatedPhi builds a query string from only the provided filters', () => {
    service
      .getDesignatedPhi({
        villageId: 123,
        tbuId: undefined,
        designatedPhiId: 'PHI_1',
      })
      .subscribe();
    const req = httpMock.expectOne(
      `${environment.phi_GetDesignatedPhi_Url}?villageId=123&designatedPhiId=PHI_1`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('getDesignatedPhi omits the query string when no filters are given', () => {
    service.getDesignatedPhi({}).subscribe();
    const req = httpMock.expectOne(environment.phi_GetDesignatedPhi_Url);
    req.flush({ statusCode: 200, data: [] });
  });

  it('errors with the backend errorMessage when statusCode is not 200', () => {
    let error: any;
    service.getAllDesignatedPhi().subscribe({
      next: () => fail('should not succeed'),
      error: (err) => (error = err),
    });
    const req = httpMock.expectOne(environment.phi_GetAllDesignatedPhi_Url);
    req.flush({
      statusCode: 5000,
      errorMessage: 'Village, TBU or district is required',
    });
    expect(error.errorMessage).toBe('Village, TBU or district is required');
  });
});
