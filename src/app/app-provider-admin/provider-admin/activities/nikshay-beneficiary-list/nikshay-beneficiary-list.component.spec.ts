import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { NikshayBeneficiaryListComponent } from './nikshay-beneficiary-list.component';
import {
  NikshayBeneficiaryListItem,
  NikshayBeneficiaryListService,
} from '../services/nikshay-beneficiary-list.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

let component: NikshayBeneficiaryListComponent;
let fixture: ComponentFixture<NikshayBeneficiaryListComponent>;

function listResponse(
  beneficiaries: NikshayBeneficiaryListItem[] = [],
  total = 0,
) {
  return { total, page: 0, size: 20, beneficiaries };
}

const FakeNikshayBeneficiaryListService = {
  getNikshayBeneficiaryList: (_query: any) => of(listResponse()),
  reprocessPhase: (_phase: any, _ids: any) => of({}),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NikshayBeneficiaryListComponent],
      // The template exports the filter menu trigger (#x="matMenuTrigger")
      imports: [MatMenuModule, NoopAnimationsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        {
          provide: NikshayBeneficiaryListService,
          useValue: FakeNikshayBeneficiaryListService,
        },
        { provide: ConfirmationDialogsService, useValue: FakeDialogService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NikshayBeneficiaryListComponent);
    component = fixture.componentInstance;
  });
}

describe('NikshayBeneficiaryListComponent', () => {
  describe('ngOnInit', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('loads the first page into the data source', () => {
      const beneficiaries = [
        { benRegId: 1, name: 'Alice', nikshayId: 'NIK1', phases: {} } as any,
      ];
      spyOn(
        FakeNikshayBeneficiaryListService,
        'getNikshayBeneficiaryList',
      ).and.returnValue(of(listResponse(beneficiaries, 1)));
      component.ngOnInit();
      expect(component.dataSource.data).toEqual(beneficiaries);
      expect(component.totalCount).toBe(1);
      expect(component.isLoadingBeneficiaryList).toBeFalse();
    });

    it('shows an error alert and clears the list when loading fails', () => {
      spyOn(
        FakeNikshayBeneficiaryListService,
        'getNikshayBeneficiaryList',
      ).and.returnValue(throwError(() => ({ errorMessage: 'Service down' })));
      spyOn(FakeDialogService, 'alert');
      component.ngOnInit();
      expect(component.dataSource.data).toEqual([]);
      expect(component.totalCount).toBe(0);
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Service down',
        'error',
      );
    });

    it('ignores a stale response for a request that is no longer the latest', () => {
      spyOn(
        FakeNikshayBeneficiaryListService,
        'getNikshayBeneficiaryList',
      ).and.callFake(() => {
        // A second, newer request starts and completes before this one resolves.
        (component as any).listRequestId++;
        return of(listResponse([{ benRegId: 1, name: 'Stale' } as any], 1));
      });
      component.ngOnInit();
      expect(component.dataSource.data).toEqual([]);
      expect(component.totalCount).toBe(0);
    });
  });

  describe('onPageChange', () => {
    initTestBed();

    it('updates the page index/size and reloads the list', () => {
      spyOn(component, 'loadNikshayBeneficiaryList');
      component.onPageChange({ pageIndex: 2, pageSize: 50 } as any);
      expect(component.pageIndex).toBe(2);
      expect(component.pageSize).toBe(50);
      expect(component.loadNikshayBeneficiaryList).toHaveBeenCalled();
    });
  });

  describe('onSearchInputChange', () => {
    initTestBed();

    it('filters the data source by the trimmed, lower-cased search term', () => {
      component.beneficiaryListSearchTerm = '  Alice  ';
      component.onSearchInputChange();
      expect(component.dataSource.filter).toBe('alice');
    });
  });

  describe('empty state', () => {
    initTestBed();

    function emptyStateText(): string {
      fixture.detectChanges();
      return fixture.nativeElement.textContent;
    }

    it('says no beneficiaries were found when the list is empty', () => {
      fixture.detectChanges();
      expect(emptyStateText()).toContain('No beneficiaries found');
    });

    it('says the search only covers this page when the search matches nothing', () => {
      fixture.detectChanges();
      component.dataSource.data = [
        { benRegId: 1, name: 'Alice', nikshayId: 'NIK1', phases: {} } as any,
      ];
      component.beneficiaryListSearchTerm = 'zzz';
      component.onSearchInputChange();
      const text = emptyStateText();
      expect(text).toContain('No beneficiaries on this page match the search');
      expect(text).not.toContain('No beneficiaries found');
    });
  });

  describe('buildQuery', () => {
    initTestBed();

    it('sends only page and size when no filter is applied', () => {
      component.pageIndex = 1;
      component.pageSize = 20;
      expect(component.buildQuery()).toEqual({ page: 1, size: 20 });
    });

    it('sends only the status when the stage filter is "Any Stage"', () => {
      component.appliedStageFilter = component.anyStage;
      component.appliedStatusFilter = 'FAILED';
      expect(component.buildQuery()).toEqual({
        page: 0,
        size: 20,
        status: 'FAILED',
      });
    });

    it('sends both phase and status for a specific stage', () => {
      component.appliedStageFilter = 'ENROLMENT';
      component.appliedStatusFilter = 'DONE';
      expect(component.buildQuery()).toEqual({
        page: 0,
        size: 20,
        phase: 'ENROLMENT',
        status: 'DONE',
      });
    });

    it('ignores a stage filter with no status selected', () => {
      component.appliedStageFilter = 'ENROLMENT';
      component.appliedStatusFilter = null;
      expect(component.buildQuery()).toEqual({ page: 0, size: 20 });
    });
  });

  describe('stage filter menu', () => {
    initTestBed();

    it('onStageFilterMenuOpened copies the applied filter into the pending one', () => {
      component.appliedStageFilter = 'ENROLMENT';
      component.appliedStatusFilter = 'DONE';
      component.onStageFilterMenuOpened();
      expect(component.pendingStageFilter).toBe('ENROLMENT');
      expect(component.pendingStatusFilter).toBe('DONE');
    });

    it('applyStageFilter commits the pending filter, resets to page 0, and reloads', () => {
      spyOn(component, 'loadNikshayBeneficiaryList');
      component.pageIndex = 3;
      component.pendingStageFilter = 'XRAY_UPLOAD';
      component.pendingStatusFilter = 'FAILED';
      component.applyStageFilter();
      expect(component.appliedStageFilter).toBe('XRAY_UPLOAD');
      expect(component.appliedStatusFilter).toBe('FAILED');
      expect(component.pageIndex).toBe(0);
      expect(component.loadNikshayBeneficiaryList).toHaveBeenCalled();
    });

    it('resetStageFilter clears both pending and applied filters', () => {
      component.appliedStageFilter = 'ENROLMENT';
      component.appliedStatusFilter = 'DONE';
      spyOn(component, 'loadNikshayBeneficiaryList');
      component.resetStageFilter();
      expect(component.appliedStageFilter).toBeNull();
      expect(component.appliedStatusFilter).toBeNull();
    });

    it('appliedStageFilterLabel is empty until both stage and status are applied', () => {
      expect(component.appliedStageFilterLabel).toBe('');
      component.appliedStageFilter = 'ENROLMENT';
      expect(component.appliedStageFilterLabel).toBe('');
    });

    it('appliedStageFilterLabel combines the stage and status labels', () => {
      component.appliedStageFilter = 'ENROLMENT';
      component.appliedStatusFilter = 'DONE';
      expect(component.appliedStageFilterLabel).toBe('Nikshay Status: Success');
    });

    it('appliedStageFilterLabel reports "Any Stage" for the any-stage filter', () => {
      component.appliedStageFilter = component.anyStage;
      component.appliedStatusFilter = 'FAILED';
      expect(component.appliedStageFilterLabel).toBe('Any Stage: Failed');
    });
  });

  describe('maskName', () => {
    initTestBed();

    it('masks all but the first and last character', () => {
      expect(component.maskName('Alice')).toBe('A***e');
    });

    it('leaves very short names unmasked', () => {
      expect(component.maskName('Al')).toBe('Al');
      expect(component.maskName('')).toBe('');
    });
  });

  describe('getStageStatus', () => {
    initTestBed();

    it('reports NOT_STARTED when the phase has no row yet', () => {
      const status = component.getStageStatus(
        { phases: {} } as any,
        'ENROLMENT',
      );
      expect(status.status).toBe('NOT_STARTED');
      expect(status.cssClass).toBe('status-not-started');
      expect(status.reason).toBeNull();
    });

    it('surfaces the failure reason only when the phase failed', () => {
      const row = {
        phases: {
          ENROLMENT: {
            status: 'FAILED',
            failureReason: 'Timeout',
            errorDetail: null,
          },
        },
      } as any;
      const status = component.getStageStatus(row, 'ENROLMENT');
      expect(status.status).toBe('FAILED');
      expect(status.label).toBe('Failed');
      expect(status.reason).toBe('Timeout');
    });

    it('does not surface a reason for a non-failed phase', () => {
      const row = {
        phases: { ENROLMENT: { status: 'DONE' } },
      } as any;
      const status = component.getStageStatus(row, 'ENROLMENT');
      expect(status.reason).toBeNull();
    });
  });

  describe('retry flow', () => {
    initTestBed();

    it('does nothing when the user cancels the confirmation', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(false));
      spyOn(FakeNikshayBeneficiaryListService, 'reprocessPhase');
      component.onStageRetryClick({ benRegId: 1 } as any, 'ENROLMENT');
      expect(
        FakeNikshayBeneficiaryListService.reprocessPhase,
      ).not.toHaveBeenCalled();
    });

    it('tracks the stage as retrying until the call resolves, then reloads', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(true));
      spyOn(FakeDialogService, 'alert');
      spyOn(component, 'loadNikshayBeneficiaryList');
      const row = { benRegId: 1 } as any;

      component.onStageRetryClick(row, 'ENROLMENT');

      expect(component.isRetrying(row, 'ENROLMENT')).toBeFalse();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Retry started successfully',
        'success',
      );
      expect(component.loadNikshayBeneficiaryList).toHaveBeenCalled();
    });

    it('clears the retrying flag and shows the backend error on failure', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(true));
      spyOn(
        FakeNikshayBeneficiaryListService,
        'reprocessPhase',
      ).and.returnValue(throwError(() => ({ errorMessage: 'Retry rejected' })));
      spyOn(FakeDialogService, 'alert');
      const row = { benRegId: 1 } as any;

      component.onStageRetryClick(row, 'ENROLMENT');

      expect(component.isRetrying(row, 'ENROLMENT')).toBeFalse();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Retry rejected',
        'error',
      );
    });
  });
});
