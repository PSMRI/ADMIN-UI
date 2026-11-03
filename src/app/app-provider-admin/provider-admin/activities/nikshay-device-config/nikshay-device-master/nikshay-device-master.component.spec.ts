import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { NikshayDeviceMasterComponent } from './nikshay-device-master.component';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: NikshayDeviceMasterComponent;
let fixture: ComponentFixture<NikshayDeviceMasterComponent>;

function devicesPage() {
  return [
    {
      id: 1,
      deviceSerialNumber: 'DEV1',
      villages: [{ mappingId: 10, villageName: 'V1' }],
    },
    { id: 2, deviceSerialNumber: 'DEV2', villages: [] },
  ];
}

const FakeNikshayDeviceConfigService = {
  listDevices: () => of({ data: devicesPage() }),
  searchDevice: (_term: any) => of({ data: devicesPage()[0] }),
  unlinkDeviceVillage: (_req: any) => of({ data: {} }),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

const FakeDataService = { uname: 'admin' };

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NikshayDeviceMasterComponent],
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
    fixture = TestBed.createComponent(NikshayDeviceMasterComponent);
    component = fixture.componentInstance;
  });
}

describe('NikshayDeviceMasterComponent', () => {
  describe('ngOnInit', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('loads the device list and shows the table', () => {
      component.ngOnInit();
      expect(component.allDevices).toEqual(devicesPage());
      expect(component.deviceList.data).toEqual(devicesPage());
      expect(component.showTableFlag).toBeTrue();
    });

    it('shows an error alert when loading devices fails', () => {
      spyOn(FakeNikshayDeviceConfigService, 'listDevices').and.returnValue(
        throwError(() => ({ errorMessage: 'Boom' })),
      );
      spyOn(FakeDialogService, 'alert');
      component.ngOnInit();
      expect(FakeDialogService.alert).toHaveBeenCalledWith('Boom', 'error');
    });
  });

  describe('search', () => {
    initTestBed();
    beforeEach(() => component.ngOnInit());

    it('resets to the full list when the search term is empty', () => {
      component.searchDeviceSerialNumber = '';
      component.search();
      expect(component.deviceList.data).toEqual(devicesPage());
    });

    it('wraps a single search result into an array', () => {
      component.searchDeviceSerialNumber = 'DEV1';
      component.search();
      expect(component.deviceList.data).toEqual([devicesPage()[0]]);
    });

    it('clears the list when the search finds nothing', () => {
      spyOn(FakeNikshayDeviceConfigService, 'searchDevice').and.returnValue(
        of({ data: null } as any),
      );
      component.searchDeviceSerialNumber = 'missing';
      component.search();
      expect(component.deviceList.data).toEqual([]);
    });

    it('shows the backend error message when the search fails', () => {
      spyOn(FakeNikshayDeviceConfigService, 'searchDevice').and.returnValue(
        throwError(() => ({ errorMessage: 'Search broke' })),
      );
      spyOn(FakeDialogService, 'alert');
      component.searchDeviceSerialNumber = 'DEV1';
      component.search();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Search broke',
        'error',
      );
    });

    it('ignores a stale response for a term the user has since changed', () => {
      component.searchDeviceSerialNumber = 'DEV1';
      spyOn(FakeNikshayDeviceConfigService, 'searchDevice').and.callFake(() => {
        // Simulate the user typing something else before the response arrives.
        component.searchDeviceSerialNumber = 'DEV2';
        return of({ data: devicesPage()[0] });
      });
      component.deviceList.data = [];
      component.search();
      expect(component.deviceList.data).toEqual([]);
    });
  });

  describe('debounced search input', () => {
    initTestBed();
    beforeEach(() => component.ngOnInit());

    it('triggers a search 300ms after the input stops changing', fakeAsync(() => {
      spyOn(component, 'search');
      component.onSearchInputChange('DEV');
      tick(299);
      expect(component.search).not.toHaveBeenCalled();
      tick(1);
      expect(component.search).toHaveBeenCalledTimes(1);
    }));

    it('only fires once for rapid keystrokes', fakeAsync(() => {
      spyOn(component, 'search');
      component.onSearchInputChange('D');
      tick(100);
      component.onSearchInputChange('DE');
      tick(100);
      component.onSearchInputChange('DEV');
      tick(300);
      expect(component.search).toHaveBeenCalledTimes(1);
    }));

    it('stops reacting to input after the component is destroyed', fakeAsync(() => {
      spyOn(component, 'search');
      component.ngOnDestroy();
      component.onSearchInputChange('DEV');
      tick(300);
      expect(component.search).not.toHaveBeenCalled();
    }));
  });

  describe('toggleExpand', () => {
    initTestBed();

    it('expands a collapsed device and collapses it again on a second click', () => {
      const device = devicesPage()[0];
      component.toggleExpand(device);
      expect(component.expandedDevice).toBe(device);
      component.toggleExpand(device);
      expect(component.expandedDevice).toBeNull();
    });
  });

  describe('unlinkVillage', () => {
    initTestBed();

    it('does nothing when the user cancels the confirmation', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(false));
      spyOn(FakeNikshayDeviceConfigService, 'unlinkDeviceVillage');
      component.unlinkVillage(devicesPage()[0], devicesPage()[0].villages[0]);
      expect(
        FakeNikshayDeviceConfigService.unlinkDeviceVillage,
      ).not.toHaveBeenCalled();
    });

    it('removes the village from the device on success', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(true));
      spyOn(FakeDialogService, 'alert');
      const device = {
        id: 1,
        deviceSerialNumber: 'DEV1',
        villages: [{ mappingId: 10, villageName: 'V1' }],
      };
      component.allDevices = [device];
      component.unlinkVillage(device, device.villages[0]);
      expect(device.villages.length).toBe(0);
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Village unlinked successfully',
        'success',
      );
    });

    it('also removes the village from the cached allDevices entry', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(true));
      const cached = { id: 1, villages: [{ mappingId: 10 }] };
      component.allDevices = [cached];
      const searched = { id: 1, villages: [{ mappingId: 10 }] };
      component.unlinkVillage(searched, searched.villages[0]);
      expect(cached.villages.length).toBe(0);
    });

    it('shows an error alert when the unlink call fails', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(true));
      spyOn(
        FakeNikshayDeviceConfigService,
        'unlinkDeviceVillage',
      ).and.returnValue(throwError(() => ({ errorMessage: 'Cannot unlink' })));
      spyOn(FakeDialogService, 'alert');
      const device = { id: 1, villages: [{ mappingId: 10 }] };
      component.unlinkVillage(device, device.villages[0]);
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Cannot unlink',
        'error',
      );
    });
  });
});
