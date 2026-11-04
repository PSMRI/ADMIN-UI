import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import { EnrollNikshayDeviceComponent } from './enroll-nikshay-device.component';
import { NikshayDeviceConfigService } from '../../services/nikshay-device-config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: EnrollNikshayDeviceComponent;
let fixture: ComponentFixture<EnrollNikshayDeviceComponent>;

const FakeNikshayDeviceConfigService = {
  enrollDevice: (_req: any) =>
    of({ statusCode: 200, data: enrollResult(1, []) }),
};

/** Shape of the enroll API's data: per-row created/failed with counts. */
function enrollResult(successCount: number, failed: any[]) {
  return {
    total: successCount + failed.length,
    successCount,
    failedCount: failed.length,
    created: Array.from({ length: successCount }, (_, i) => ({ rowIndex: i })),
    failed,
  };
}

const DUPLICATE_ROW = {
  rowIndex: 0,
  deviceSerialNumber: '1',
  deviceName: 'NAAT',
  phiUserId: 'phi User Id',
  reason: 'ALREADY_EXISTS',
  errors: [
    {
      field: 'deviceSerialNumber',
      message: 'A device with serial number 1 already exists',
    },
  ],
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
};

const FakeDataService = { uname: 'admin' };

/** Builds a real .xlsx File from rows, the first row being the headers. */
function xlsxFile(rows: any[][]): File {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), 'Sheet1');
  const data = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return new File([data], 'devices.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

const HEADERS = [
  'Device Serial Number',
  'Device Name',
  'PHI User Id',
  'Password',
];

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [EnrollNikshayDeviceComponent],
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
    fixture = TestBed.createComponent(EnrollNikshayDeviceComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
    // The real NgForm is resolved from the template via ViewChild; stub it
    // since these tests never render the component.
    component.enrollDeviceForm = {
      resetForm: jasmine.createSpy('resetForm'),
    } as any;
  });
}

describe('EnrollNikshayDeviceComponent', () => {
  describe('ngOnInit', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('reads createdBy from session via dataService', () => {
      expect(component.createdBy).toBe('admin');
    });
  });

  describe('toDevicePayload', () => {
    initTestBed();

    it('maps a device form into the API payload shape', () => {
      const payload = component.toDevicePayload({
        deviceSerialNumber: 'SN1',
        deviceName: 'NAAT',
        phiUserId: 'PHI1',
        password: 'pass',
      });
      expect(payload).toEqual({
        deviceSerialNumber: 'SN1',
        deviceName: 'NAAT',
        phiUserId: 'PHI1',
        password: 'pass',
      });
    });
  });

  describe('enrollDevice', () => {
    initTestBed();

    it('submits a single-device payload and resets the form on success', () => {
      spyOn(FakeDialogService, 'alert');
      component.deviceSerialNumber = 'SN1';
      component.deviceName = 'NAAT';
      component.phiUserId = 'PHI1';
      component.password = 'pass';
      component.enrollDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Device enrolled successfully',
        'success',
      );
      expect(component.enrollDeviceForm.resetForm).toHaveBeenCalled();
    });

    it('shows the row error message and keeps the form when the device is rejected', () => {
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice').and.returnValue(
        of({ statusCode: 200, data: enrollResult(0, [DUPLICATE_ROW]) }),
      );
      spyOn(FakeDialogService, 'alert');
      component.enrollDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        'A device with serial number 1 already exists',
        'error',
      );
      expect(component.enrollDeviceForm.resetForm).not.toHaveBeenCalled();
    });

    it('falls back to the reason code when a rejected device has no messages', () => {
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice').and.returnValue(
        of({
          statusCode: 200,
          data: enrollResult(0, [{ ...DUPLICATE_ROW, errors: [] }]),
        }),
      );
      spyOn(FakeDialogService, 'alert');
      component.enrollDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        'ALREADY_EXISTS',
        'error',
      );
    });

    it('shows the backend error message on failure', () => {
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice').and.returnValue(
        throwError(() => ({ errorMessage: 'Duplicate device' })),
      );
      spyOn(FakeDialogService, 'alert');
      component.enrollDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Duplicate device',
        'error',
      );
    });

    it('falls back to a generic error message when none is provided', () => {
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice').and.returnValue(
        throwError(() => ({})),
      );
      spyOn(FakeDialogService, 'alert');
      component.enrollDevice();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Failed to enroll device',
        'error',
      );
    });
  });

  describe('submitDevices', () => {
    initTestBed();

    it('sends createdBy with the devices and hands the result data to the callback', () => {
      const data = enrollResult(2, []);
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice').and.returnValue(
        of({ statusCode: 200, data }),
      );
      const onResult = jasmine.createSpy('onResult');
      const devices = [
        { deviceSerialNumber: 'A' },
        { deviceSerialNumber: 'B' },
      ];
      component.submitDevices(devices, onResult);
      expect(FakeNikshayDeviceConfigService.enrollDevice).toHaveBeenCalledWith({
        createdBy: 'admin',
        devices,
      });
      expect(onResult).toHaveBeenCalledWith(data);
    });
  });

  describe('handleBulkEnrollResult', () => {
    initTestBed();

    beforeEach(() => {
      spyOn(component, 'downloadFailedRows');
      spyOn(component, 'resetFileInput');
      spyOn(FakeDialogService, 'alert');
    });

    it('reports success and downloads nothing when every row was enrolled', () => {
      component.handleBulkEnrollResult(enrollResult(16, []));
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        '16 device(s) enrolled successfully',
        'success',
      );
      expect(component.downloadFailedRows).not.toHaveBeenCalled();
      expect(component.resetFileInput).toHaveBeenCalled();
    });

    it('warns with both counts and downloads the failed rows on a partial failure', () => {
      component.handleBulkEnrollResult(enrollResult(15, [DUPLICATE_ROW]));
      expect(component.downloadFailedRows).toHaveBeenCalledOnceWith([
        DUPLICATE_ROW,
      ]);
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        '15 device(s) enrolled, 1 failed. The failed rows have been downloaded as enroll-device-errors.xlsx.',
        'warn',
      );
      expect(component.resetFileInput).toHaveBeenCalled();
    });

    it('reports an error when no row was enrolled', () => {
      component.handleBulkEnrollResult(enrollResult(0, [DUPLICATE_ROW]));
      expect(component.downloadFailedRows).toHaveBeenCalled();
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        jasmine.stringContaining('0 device(s) enrolled, 1 failed'),
        'error',
      );
    });

    it('falls back to the array lengths when the counts are missing', () => {
      component.handleBulkEnrollResult({
        created: [{}, {}],
        failed: [DUPLICATE_ROW],
      });
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        jasmine.stringContaining('2 device(s) enrolled, 1 failed'),
        'warn',
      );
    });
  });

  describe('buildFailedRows', () => {
    initTestBed();

    it('maps each failed device to a sheet row with its Excel row number and errors', () => {
      expect(
        component.buildFailedRows([
          {
            ...DUPLICATE_ROW,
            rowIndex: 3,
            errors: [
              { field: 'deviceSerialNumber', message: 'Already exists' },
              { field: 'phiUserId', message: 'PHI user not found' },
            ],
          },
        ]),
      ).toEqual([
        {
          'Excel Row': 5,
          'Device Serial Number': '1',
          'Device Name': 'NAAT',
          'PHI User Id': 'phi User Id',
          Reason: 'ALREADY_EXISTS',
          Errors: 'Already exists; PHI user not found',
        },
      ]);
    });

    it('never includes the password', () => {
      const [row] = component.buildFailedRows([
        { ...DUPLICATE_ROW, password: 'secret' },
      ]);
      expect(Object.values(row)).not.toContain('secret');
    });
  });

  describe('onFileSelected', () => {
    initTestBed();

    function fileEvent(file: File) {
      return { target: { files: [file] } };
    }

    it('rejects an unsupported file extension', () => {
      spyOn(FakeDialogService, 'alert');
      const file = new File(['x'], 'devices.csv');
      component.onFileSelected(fileEvent(file));
      expect(component.selectedFile).toBeNull();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Invalid file format. Please upload a .xls or .xlsx file',
        'error',
      );
    });

    it('rejects a file larger than the max size', () => {
      spyOn(FakeDialogService, 'alert');
      const big = new Uint8Array(6 * 1024 * 1024);
      const file = new File([big], 'devices.xlsx');
      component.onFileSelected(fileEvent(file));
      expect(component.selectedFile).toBeNull();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        jasmine.stringMatching(/exceeds the maximum/),
        'error',
      );
    });

    it('accepts a valid .xlsx file within the size limit', () => {
      const file = new File(['x'], 'devices.xlsx');
      component.onFileSelected(fileEvent(file));
      expect(component.selectedFile).toBe(file);
    });

    it('ignores the event when no file (or more than one) was selected', () => {
      component.selectedFile = null;
      component.onFileSelected({ target: { files: [] } });
      expect(component.selectedFile).toBeNull();
    });
  });

  describe('validateRows', () => {
    initTestBed();

    const headers = [
      'Device Serial Number',
      'Device Name',
      'PHI User Id',
      'Password',
    ];

    it('rejects an empty file', () => {
      expect(component.validateRows([])).toBe('The uploaded file is empty');
    });

    it('rejects missing or unexpected columns', () => {
      const error = component.validateRows([
        ['Device Serial Number', 'Extra Column'],
      ]);
      expect(error).toContain('Invalid file format. Expected columns');
    });

    it('rejects duplicate columns', () => {
      const error = component.validateRows([[...headers, 'Device Name']]);
      expect(error).toContain('Duplicate columns');
    });

    it('rejects a file with no data rows', () => {
      expect(component.validateRows([headers])).toBe(
        'The uploaded file has no data rows',
      );
    });

    it('flags rows with blank required cells', () => {
      const error = component.validateRows([
        headers,
        ['SN1', '', 'PHI1', 'pass'],
      ]);
      expect(error).toContain('Row 2');
    });

    it('flags an invalid Device Name value', () => {
      const error = component.validateRows([
        headers,
        ['SN1', 'BADVALUE', 'PHI1', 'pass'],
      ]);
      expect(error).toContain('Device Name must be NAAT or XRAY');
    });

    it('returns null for a fully valid sheet', () => {
      const error = component.validateRows([
        headers,
        ['SN1', 'NAAT', 'PHI1', 'pass'],
      ]);
      expect(error).toBeNull();
    });
  });

  describe('uploadFile', () => {
    initTestBed();

    it('does nothing when no file has been selected', () => {
      spyOn(FakeNikshayDeviceConfigService, 'enrollDevice');
      component.selectedFile = null;
      component.uploadFile();
      expect(
        FakeNikshayDeviceConfigService.enrollDevice,
      ).not.toHaveBeenCalled();
    });

    // uploadFile reads the file with a real FileReader, so these tests wait
    // for the callback the reader ends in (submitDevices or the alert).
    it('maps every sheet row into a device and submits them in one request', async () => {
      const submitted = new Promise<any[]>((resolve) =>
        spyOn(component, 'submitDevices').and.callFake((devices: any[]) =>
          resolve(devices),
        ),
      );
      component.selectedFile = xlsxFile([
        HEADERS,
        ['NAAT-DL-001', 'NAAT', 'phi_dl_001', 'Pass@123'],
        [' XRAY-DL-002 ', 'XRAY', 'phi_dl_002', 'Pass@456'],
      ]);
      component.uploadFile();

      expect(await submitted).toEqual([
        {
          deviceSerialNumber: 'NAAT-DL-001',
          deviceName: 'NAAT',
          phiUserId: 'phi_dl_001',
          password: 'Pass@123',
        },
        {
          deviceSerialNumber: 'XRAY-DL-002',
          deviceName: 'XRAY',
          phiUserId: 'phi_dl_002',
          password: 'Pass@456',
        },
      ]);
    });

    it('maps columns by header name, whatever their order in the sheet', async () => {
      const submitted = new Promise<any[]>((resolve) =>
        spyOn(component, 'submitDevices').and.callFake((devices: any[]) =>
          resolve(devices),
        ),
      );
      component.selectedFile = xlsxFile([
        ['Password', 'PHI User Id', 'Device Name', 'Device Serial Number'],
        ['Pass@123', 'phi_dl_001', 'NAAT', 'NAAT-DL-001'],
      ]);
      component.uploadFile();

      expect(await submitted).toEqual([
        {
          deviceSerialNumber: 'NAAT-DL-001',
          deviceName: 'NAAT',
          phiUserId: 'phi_dl_001',
          password: 'Pass@123',
        },
      ]);
    });

    it('alerts the validation error and submits nothing for an invalid sheet', async () => {
      spyOn(component, 'submitDevices');
      const alerted = new Promise<any[]>((resolve) =>
        spyOn(FakeDialogService, 'alert').and.callFake(
          (msg?: any, type?: any) => {
            resolve([msg, type]);
            return undefined;
          },
        ),
      );
      component.selectedFile = xlsxFile([
        HEADERS,
        ['NAAT-DL-003', 'CT', 'phi_dl_003', 'Pass@789'],
      ]);
      component.uploadFile();

      const [message, type] = await alerted;
      expect(type).toBe('error');
      expect(message).toContain('Device Name must be NAAT or XRAY');
      expect(component.submitDevices).not.toHaveBeenCalled();
    });
  });
});
