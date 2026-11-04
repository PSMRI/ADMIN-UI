import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CreatePhiTransferComponent } from './create-phi-transfer.component';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';
import { PhiTransferConfigService } from '../../services/phi-transfer-config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: CreatePhiTransferComponent;
let fixture: ComponentFixture<CreatePhiTransferComponent>;

const FakeNikshayDeviceConfigService = {
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
};

const FakePhiTransferConfigService = {
  createDesignatedPhi: (_req: any) => of({ data: {} }),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
};

const FakeDataService = { uname: 'admin' };

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [CreatePhiTransferComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
        {
          provide: NikshayDeviceConfigService,
          useValue: FakeNikshayDeviceConfigService,
        },
        {
          provide: PhiTransferConfigService,
          useValue: FakePhiTransferConfigService,
        },
        { provide: ConfirmationDialogsService, useValue: FakeDialogService },
        { provide: dataService, useValue: FakeDataService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePhiTransferComponent);
    component = fixture.componentInstance;
    component.createPhiTransferForm = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
  });
}

describe('CreatePhiTransferComponent', () => {
  describe('ngOnInit', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('loads states and reads createdBy from session', () => {
      component.ngOnInit();
      expect(component.states_array).toEqual([
        { nikshayStateID: 1, stateName: 'Karnataka' },
      ]);
      expect(component.createdBy).toBe('admin');
    });
  });

  describe('cascading location pickers', () => {
    initTestBed();

    it('getDistricts loads districts and resets downstream selections', () => {
      component.state = { nikshayStateID: 1 };
      component.district = { nikshayDistrictID: 1 };
      component.village = { nikshayVillageID: 1 };
      component.getDistricts();
      expect(component.districts_array).toEqual([
        { nikshayDistrictID: 10, districtName: 'Bidar' },
      ]);
      expect(component.district).toBeUndefined();
      expect(component.village).toBeUndefined();
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

    it('ignores a villages response for a facility the user has since changed', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getVillages').and.callFake(() => {
        component.facility = { nikshayFacilityID: 2000 };
        return of({
          data: [{ nikshayVillageID: 10000, villageName: 'Stale' }],
        });
      });
      component.facility = { nikshayFacilityID: 1000 };
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

    it('getFacilities loads facilities for the selected TU', () => {
      component.tu = { nikshayTUID: 100 };
      component.getFacilities();
      expect(component.facilities_array).toEqual([
        { nikshayFacilityID: 1000, facilityName: 'PHC A' },
      ]);
    });

    it('getVillages loads villages for the selected facility', () => {
      component.facility = { nikshayFacilityID: 1000 };
      component.getVillages();
      expect(component.villages_array).toEqual([
        { nikshayVillageID: 10000, villageName: 'Alamkeri' },
      ]);
    });

    it('shows the backend error message when a lookup fails', () => {
      spyOn(FakeNikshayDeviceConfigService, 'getVillages').and.returnValue(
        throwError(() => ({ errorMessage: 'No villages found' })),
      );
      spyOn(FakeDialogService, 'alert');
      component.facility = { nikshayFacilityID: 1000 };
      component.getVillages();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'No villages found',
        'error',
      );
    });
  });

  describe('createPhiTransfer', () => {
    initTestBed();

    it('sends null for an empty Designation Hierarchy Id', () => {
      let sentRequest: any;
      spyOn(FakePhiTransferConfigService, 'createDesignatedPhi').and.callFake(
        (req: any) => {
          sentRequest = req;
          return of({ data: {} });
        },
      );
      component.village = { nikshayVillageID: 10000 };
      component.tu = { nikshayTUID: 100 };
      component.designatedPhiId = 'PHI_1';
      component.designationHierarchyId = '';
      component.createdBy = 'admin';

      component.createPhiTransfer();

      expect(sentRequest).toEqual({
        villageId: 10000,
        tbuId: 100,
        designatedPhiId: 'PHI_1',
        designationHierarchyId: null,
        createdBy: 'admin',
      });
    });

    it('shows a success alert and resets the form on success', () => {
      spyOn(FakeDialogService, 'alert');
      component.village = { nikshayVillageID: 10000 };
      component.tu = { nikshayTUID: 100 };
      component.designatedPhiId = 'PHI_1';
      component.createPhiTransfer();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Designated PHI transfer created successfully',
        'success',
      );
      expect(component.createPhiTransferForm.resetForm).toHaveBeenCalled();
    });

    it('shows the backend error message on failure', () => {
      spyOn(
        FakePhiTransferConfigService,
        'createDesignatedPhi',
      ).and.returnValue(throwError(() => ({ errorMessage: 'Already exists' })));
      spyOn(FakeDialogService, 'alert');
      component.village = { nikshayVillageID: 10000 };
      component.tu = { nikshayTUID: 100 };
      component.createPhiTransfer();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Already exists',
        'error',
      );
    });
  });
});
