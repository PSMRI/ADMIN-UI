import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { LinkNikshayDeviceComponent } from './link-nikshay-device.component';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: LinkNikshayDeviceComponent;
let fixture: ComponentFixture<LinkNikshayDeviceComponent>;

const FakeNikshayDeviceConfigService = {
  listDevices: () => of({ data: [{ id: 1, deviceId: 'DEV1' }] }),
  getStates: () =>
    of({ data: [{ nikshayStateID: 1, stateName: 'Karnataka' }] }),
  getDistricts: (_stateID: any) =>
    of({ data: [{ nikshayDistrictID: 10, districtName: 'Bidar' }] }),
  getTUs: (_districtID: any) =>
    of({ data: [{ nikshayTUID: 100, tUName: 'Bhalki-TU' }] }),
  getFacilities: (_tuIDs: any) =>
    of({ data: [{ nikshayFacilityID: 1000, facilityName: 'PHC A' }] }),
  getVillages: (_facilityIDs: any) =>
    of({ data: [{ nikshayVillageID: 10000, villageName: 'Alamkeri' }] }),
  linkDeviceToVillage: (_req: any) => of({ data: {} }),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
};

const FakeDataService = { uname: 'admin' };

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [LinkNikshayDeviceComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: NikshayDeviceConfigService,
          useValue: FakeNikshayDeviceConfigService,
        },
        { provide: ConfirmationDialogsService, useValue: FakeDialogService },
        { provide: dataService, useValue: FakeDataService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkNikshayDeviceComponent);
    component = fixture.componentInstance;
    component.linkDeviceForm = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
  });
}

describe('LinkNikshayDeviceComponent', () => {
  describe('ngOnInit', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('loads devices and states, and reads createdBy from session', () => {
      component.ngOnInit();
      expect(component.devices_array).toEqual([{ id: 1, deviceId: 'DEV1' }]);
      expect(component.states_array).toEqual([
        { nikshayStateID: 1, stateName: 'Karnataka' },
      ]);
      expect(component.createdBy).toBe('admin');
    });
  });

  describe('cascading location pickers', () => {
    initTestBed();

    it('getDistricts loads districts for the selected state and resets downstream fields', () => {
      component.state = { nikshayStateID: 1 };
      component.district = { nikshayDistrictID: 1 };
      component.getDistricts();
      expect(component.districts_array).toEqual([
        { nikshayDistrictID: 10, districtName: 'Bidar' },
      ]);
      expect(component.district).toBeUndefined();
      expect(component.tu).toBeUndefined();
      expect(component.facility).toEqual([]);
    });

    it('getDistricts does nothing when no state is selected', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getDistricts');
      component.state = undefined;
      component.getDistricts();
      expect(
        FakeNikshayDeviceConfigService.getDistricts,
      ).not.toHaveBeenCalled();
    });

    it('ignores a districts response for a state the user has since changed', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getDistricts').and.callFake(() => {
        component.state = { nikshayStateID: 999 };
        return of({ data: [{ nikshayDistrictID: 10, districtName: 'Stale' }] });
      });
      component.state = { nikshayStateID: 1 };
      component.getDistricts();
      expect(component.districts_array).toEqual([]);
    });

    it('ignores a TUs response for a district the user has since changed', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getTUs').and.callFake(() => {
        component.district = { nikshayDistrictID: 999 };
        return of({ data: [{ nikshayTUID: 100, tUName: 'Stale' }] });
      });
      component.district = { nikshayDistrictID: 10 };
      component.getTUs();
      expect(component.tus_array).toEqual([]);
    });

    it('ignores a facilities response for a TU the user has since changed', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getFacilities').and.callFake(
        () => {
          component.tu = { nikshayTUID: 999 };
          return of({
            data: [{ nikshayFacilityID: 1000, facilityName: 'Stale' }],
          });
        },
      );
      component.tu = { nikshayTUID: 100 };
      component.getFacilities();
      expect(component.facilities_array).toEqual([]);
    });

    it('ignores a villages response for a facility selection that has since changed', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getVillages').and.callFake(() => {
        component.facility = [{ nikshayFacilityID: 2000 }];
        return of({
          data: [{ nikshayVillageID: 10000, villageName: 'Stale' }],
        });
      });
      component.facility = [{ nikshayFacilityID: 1000 }];
      component.getVillages();
      expect(component.villages_array).toEqual([]);
    });

    it('getTUs loads TUs for the selected district', () => {
      component.district = { nikshayDistrictID: 10 };
      component.getTUs();
      expect(component.tus_array).toEqual([
        { nikshayTUID: 100, tUName: 'Bhalki-TU' },
      ]);
    });

    it('getFacilities loads and filters facilities for the selected TU', () => {
      component.tu = { nikshayTUID: 100 };
      component.getFacilities();
      expect(component.facilities_array).toEqual([
        { nikshayFacilityID: 1000, facilityName: 'PHC A' },
      ]);
      expect(component.filteredFacilities).toEqual(component.facilities_array);
    });

    it('getVillages requests villages for the comma-joined selected facility ids', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getVillages').and.callThrough();
      component.facility = [
        { nikshayFacilityID: 1000 },
        { nikshayFacilityID: 2000 },
      ];
      component.getVillages();
      expect(FakeNikshayDeviceConfigService.getVillages).toHaveBeenCalledWith(
        '1000,2000',
      );
      expect(component.villages_array).toEqual([
        { nikshayVillageID: 10000, villageName: 'Alamkeri' },
      ]);
    });

    it('getVillages does nothing when no facility is selected', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getVillages');
      component.facility = [];
      component.getVillages();
      expect(FakeNikshayDeviceConfigService.getVillages).not.toHaveBeenCalled();
    });

    it('shows the backend error message when a lookup fails', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getTUs').and.returnValue(
        throwError(() => ({ errorMessage: 'No TUs found' })),
      );
      spyOn(FakeDialogService, 'alert');
      component.district = { nikshayDistrictID: 10 };
      component.getTUs();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'No TUs found',
        'error',
      );
    });
  });

  describe('facility multi-select', () => {
    initTestBed();

    beforeEach(() => {
      component.facilities_array = [
        { nikshayFacilityID: 1, facilityName: 'Alpha' },
        { nikshayFacilityID: 2, facilityName: 'Beta' },
      ];
      component.applyFacilityFilter();
    });

    it('filters by name while keeping already-selected facilities visible', () => {
      component.facility = [{ nikshayFacilityID: 2, facilityName: 'Beta' }];
      component.applyFacilityFilter('alp');
      // Order follows the source list; only membership matters here
      expect(component.filteredFacilities).toEqual(
        jasmine.arrayWithExactContents([
          { nikshayFacilityID: 2, facilityName: 'Beta' },
          { nikshayFacilityID: 1, facilityName: 'Alpha' },
        ]),
      );
    });

    it('toggleSelectAllFacilities selects all, then clears, and reloads villages', () => {
      spyOn(component, 'getVillages');
      component.facility = [];
      component.toggleSelectAllFacilities();
      expect(component.facility).toEqual(component.facilities_array);
      component.toggleSelectAllFacilities();
      expect(component.facility).toEqual([]);
      expect(component.getVillages).toHaveBeenCalledTimes(2);
    });

    it('compareFacilities matches on nikshayFacilityID', () => {
      expect(
        component.compareFacilities(
          { nikshayFacilityID: 1 },
          { nikshayFacilityID: 1 },
        ),
      ).toBeTrue();
      expect(
        component.compareFacilities(
          { nikshayFacilityID: 1 },
          { nikshayFacilityID: 2 },
        ),
      ).toBeFalse();
    });
  });

  describe('village multi-select', () => {
    initTestBed();

    beforeEach(() => {
      component.villages_array = [
        { nikshayVillageID: 1, villageName: 'Alamkeri' },
        { nikshayVillageID: 2, villageName: 'Bhalki' },
      ];
      component.applyVillageFilter();
    });

    it('filters by name while keeping already-selected villages visible', () => {
      component.selectedVillages = [
        { nikshayVillageID: 2, villageName: 'Bhalki' },
      ];
      component.applyVillageFilter('alam');
      // Order follows the source list; only membership matters here
      expect(component.filteredVillages).toEqual(
        jasmine.arrayWithExactContents([
          { nikshayVillageID: 2, villageName: 'Bhalki' },
          { nikshayVillageID: 1, villageName: 'Alamkeri' },
        ]),
      );
    });

    it('toggleSelectAllVillages selects all and then clears', () => {
      component.selectedVillages = [];
      component.toggleSelectAllVillages();
      expect(component.selectedVillages).toEqual(component.villages_array);
      component.toggleSelectAllVillages();
      expect(component.selectedVillages).toEqual([]);
    });

    it('compareVillages matches on nikshayVillageID', () => {
      expect(
        component.compareVillages(
          { nikshayVillageID: 1 },
          { nikshayVillageID: 1 },
        ),
      ).toBeTrue();
    });
  });

  describe('linkDevice', () => {
    initTestBed();

    it('builds the link payload from the selected device and location chain', () => {
      spyOn(FakeDialogService, 'alert');
      component.selectedDevice = { id: 42 };
      component.state = { nikshayStateID: 1 };
      component.district = { nikshayDistrictID: 10 };
      component.tu = { nikshayTUID: 100 };
      component.facility = [
        { nikshayFacilityID: 1000 },
        { nikshayFacilityID: 2000 },
      ];
      component.selectedVillages = [
        { nikshayVillageID: 10000 },
        { nikshayVillageID: 20000 },
      ];
      component.createdBy = 'admin';

      let sentRequest: any;
      spyOn(FakeNikshayDeviceConfigService, 'linkDeviceToVillage').and.callFake(
        (req: any) => {
          sentRequest = req;
          return of({ data: {} });
        },
      );

      component.linkDevice();

      expect(sentRequest).toEqual({
        deviceDetailId: 42,
        stateId: 1,
        districtId: 10,
        tbuId: 100,
        facilityIds: [1000, 2000],
        villageIds: [10000, 20000],
        moreData: null,
        createdBy: 'admin',
      });
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Device linked successfully',
        'success',
      );
      expect(component.linkDeviceForm.resetForm).toHaveBeenCalled();
    });

    it('shows the backend error message when linking fails', () => {
      spyOn(
        FakeNikshayDeviceConfigService,
        'linkDeviceToVillage',
      ).and.returnValue(throwError(() => ({ errorMessage: 'Already linked' })));
      spyOn(FakeDialogService, 'alert');
      component.selectedDevice = { id: 1 };
      component.state = { nikshayStateID: 1 };
      component.district = { nikshayDistrictID: 1 };
      component.tu = { nikshayTUID: 1 };
      component.facility = [];
      component.selectedVillages = [];
      component.linkDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Already linked',
        'error',
      );
    });
  });
});
