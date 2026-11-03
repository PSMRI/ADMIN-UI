import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';
import { NikshayDeviceConfigService } from './nikshay-device-config.service';

describe('NikshayDeviceConfigService', () => {
  let service: NikshayDeviceConfigService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [NikshayDeviceConfigService],
    });
    service = TestBed.inject(NikshayDeviceConfigService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getStates hits the states URL', () => {
    service.getStates().subscribe();
    const req = httpMock.expectOne(environment.nikshay_GetStates_Url);
    expect(req.request.method).toBe('GET');
    req.flush({ statusCode: 200, data: [] });
  });

  it('getDistricts appends stateID as a query param', () => {
    service.getDistricts(2).subscribe();
    const req = httpMock.expectOne(
      `${environment.nikshay_GetDistricts_Url}?stateID=2`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('getTUs appends districtID as a query param', () => {
    service.getTUs(29).subscribe();
    const req = httpMock.expectOne(
      `${environment.nikshay_GetTUs_Url}?districtID=29`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('getFacilities appends tuIDs as a query param', () => {
    service.getFacilities(377).subscribe();
    const req = httpMock.expectOne(
      `${environment.nikshay_GetFacilities_Url}?tuIDs=377`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('getVillages appends facilityIDs as a query param', () => {
    service.getVillages('1,2').subscribe();
    const req = httpMock.expectOne(
      `${environment.nikshay_GetVillages_Url}?facilityIDs=1,2`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('enrollDevice posts to the enroll URL with the given body', () => {
    const body = { createdBy: 'admin', devices: [] };
    service.enrollDevice(body).subscribe();
    const req = httpMock.expectOne(environment.nikshay_EnrollDevice_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ statusCode: 200, data: {} });
  });

  it('linkDeviceToVillage posts to the link URL', () => {
    const body = { deviceDetailId: 1 };
    service.linkDeviceToVillage(body).subscribe();
    const req = httpMock.expectOne(environment.nikshay_LinkDeviceToVillage_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ statusCode: 200, data: {} });
  });

  it('unlinkDeviceVillage posts to the unlink URL', () => {
    const body = { mappingIds: [10] };
    service.unlinkDeviceVillage(body).subscribe();
    const req = httpMock.expectOne(environment.nikshay_UnlinkDeviceVillage_Url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBe(body);
    req.flush({ statusCode: 200, data: {} });
  });

  it('listDevices hits the list URL', () => {
    service.listDevices().subscribe();
    const req = httpMock.expectOne(environment.nikshay_ListDevices_Url);
    expect(req.request.method).toBe('GET');
    req.flush({ statusCode: 200, data: [] });
  });

  it('searchDevice URL-encodes the serial number query param', () => {
    service.searchDevice('A B').subscribe();
    const req = httpMock.expectOne(
      `${environment.nikshay_SearchDevice_Url}?deviceSerialNumber=A%20B`,
    );
    req.flush({ statusCode: 200, data: [] });
  });

  it('passes through the response when statusCode is 200', () => {
    let result: any;
    service.getStates().subscribe((res: any) => (result = res));
    const req = httpMock.expectOne(environment.nikshay_GetStates_Url);
    req.flush({ statusCode: 200, data: [{ nikshayStateID: 1 }] });
    expect(result.data).toEqual([{ nikshayStateID: 1 }]);
  });

  it('errors with the backend errorMessage when statusCode is not 200', () => {
    let error: any;
    service.getStates().subscribe({
      next: () => fail('should not succeed'),
      error: (err) => (error = err),
    });
    const req = httpMock.expectOne(environment.nikshay_GetStates_Url);
    req.flush({ statusCode: 500, errorMessage: 'Something broke' });
    expect(error.errorMessage).toBe('Something broke');
  });

  it('falls back to a generic error message when none is provided', () => {
    let error: any;
    service.getStates().subscribe({
      next: () => fail('should not succeed'),
      error: (err) => (error = err),
    });
    const req = httpMock.expectOne(environment.nikshay_GetStates_Url);
    req.flush(null);
    expect(error.errorMessage).toBe('Request failed');
  });
});
