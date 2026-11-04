import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { of, Subject, throwError } from 'rxjs';
import { NikshayJobConfigComponent } from './nikshay-job-config.component';
import { NikshayBeneficiaryListService } from '../services/nikshay-beneficiary-list.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

let component: NikshayJobConfigComponent;
let fixture: ComponentFixture<NikshayJobConfigComponent>;

function historyResponse(runs: any[] = [], total: number | null = runs.length) {
  return { total, page: 0, size: 10, runs };
}

const counts = (picked = 0, succeeded = 0, failed = 0) => ({
  picked,
  succeeded,
  failed,
  notApplicable: 0,
  waiting: 0,
});

const RUN = {
  jobRunId: 'run-1',
  triggerType: 'JOB',
  triggeredBy: 'nikshay-job',
  status: 'SUCCESS',
  startedAt: '2026-11-04T11:19:36.000+00:00',
  finishedAt: '2026-11-04T11:19:57.898+00:00',
  summary: {
    ...counts(1, 1, 0),
    phases: [
      { phase: 'ENROLMENT', pass: 1, result: 'RAN', ...counts() },
      { phase: 'XRAY_UPLOAD', pass: 1, result: 'RAN', ...counts(1, 1, 0) },
      { phase: 'XRAY_UPLOAD', pass: 2, result: 'RAN', ...counts() },
    ],
  },
  message: null,
};

const FakeNikshayBeneficiaryListService = {
  runNikshayJob: () => of({}),
  getNikshayJobTriggerHistory: (_query: any) => of(historyResponse()),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

describe('NikshayJobConfigComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NikshayJobConfigComponent],
      // Real table so the history rows render
      imports: [MatTableModule],
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
    fixture = TestBed.createComponent(NikshayJobConfigComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('does nothing when the user cancels the confirmation', () => {
    spyOn(FakeDialogService, 'confirm').and.returnValue(of(false));
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob');
    component.triggerNikshayJob();
    expect(
      FakeNikshayBeneficiaryListService.runNikshayJob,
    ).not.toHaveBeenCalled();
    expect(component.isRunningJob).toBeFalse();
  });

  it('shows the loader until the job call resolves', () => {
    const run$ = new Subject<any>();
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      run$,
    );
    component.triggerNikshayJob();
    expect(component.isRunningJob).toBeTrue();
    run$.next({});
    expect(component.isRunningJob).toBeFalse();
  });

  it('disables the button and shows "Running..." while the job runs', () => {
    component.isRunningJob = true;
    fixture.detectChanges();
    const button: HTMLButtonElement =
      fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
    expect(button.textContent).toContain('Running...');
  });

  it('shows a fixed success message, whatever the response contains', () => {
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      of({
        message: 'Job started',
        picked: 4,
        succeeded: 3,
        failed: 1,
        phases: [],
      }),
    );
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Nikshay job completed successfully',
      'success',
    );
  });

  it('shows the backend error and clears the loader on failure', () => {
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      throwError(() => ({ errorMessage: 'Job already running' })),
    );
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(component.isRunningJob).toBeFalse();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Job already running',
      'error',
    );
  });

  it('falls back to a generic error message', () => {
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      throwError(() => ({})),
    );
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Could not trigger the Nikshay job. Please try again.',
      'error',
    );
  });

  describe('job run history', () => {
    function useHistoryService(response$: any = of(historyResponse([RUN], 1))) {
      return spyOn(
        FakeNikshayBeneficiaryListService,
        'getNikshayJobTriggerHistory',
      ).and.returnValue(response$);
    }

    it('loads the first page on init', () => {
      const getHistory = useHistoryService();
      component.ngOnInit();
      expect(getHistory).toHaveBeenCalledWith({ page: 0, size: 10 });
      expect(component.runs).toEqual([RUN] as any);
      expect(component.totalCount).toBe(1);
      expect(component.isLoadingHistory).toBeFalse();
    });

    it('shows an error alert and clears the runs when loading fails', () => {
      useHistoryService(throwError(() => ({ errorMessage: 'Service down' })));
      spyOn(FakeDialogService, 'alert');
      component.runs = [RUN] as any;
      component.loadHistory();
      expect(component.runs).toEqual([]);
      expect(component.totalCount).toBe(0);
      expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
        'Service down',
        'error',
      );
    });

    it('ignores a stale response for a request that is no longer the latest', () => {
      const first$ = new Subject<any>();
      const getHistory = useHistoryService(first$);
      component.loadHistory();
      getHistory.and.returnValue(of(historyResponse([RUN], 1)));
      component.loadHistory();
      first$.next(historyResponse([], 0));
      expect(component.runs).toEqual([RUN] as any);
      expect(component.totalCount).toBe(1);
    });

    it('requests the chosen page and page size', () => {
      const getHistory = useHistoryService();
      component.onHistoryPageChange({ pageIndex: 2, pageSize: 20, length: 60 });
      expect(getHistory).toHaveBeenCalledWith({ page: 2, size: 20 });
    });

    describe('paginator length without a total from the API', () => {
      it('allows one more page after a full page', () => {
        component.pageIndex = 1;
        component.pageSize = 2;
        expect(
          component.getPaginatorLength(
            historyResponse([RUN, RUN], null) as any,
          ),
        ).toBe(5);
      });

      it('stops at the last row after a partial page', () => {
        component.pageIndex = 1;
        component.pageSize = 2;
        expect(
          component.getPaginatorLength(historyResponse([RUN], null) as any),
        ).toBe(3);
      });

      it('uses the total when the API sends one', () => {
        expect(
          component.getPaginatorLength(historyResponse([RUN], 42) as any),
        ).toBe(42);
      });
    });

    it('expands one run at a time and collapses it on a second click', () => {
      const other = { ...RUN, jobRunId: 'run-2' };
      component.toggleRun(RUN as any);
      expect(component.isExpanded(RUN as any)).toBeTrue();
      component.toggleRun(other as any);
      expect(component.isExpanded(RUN as any)).toBeFalse();
      expect(component.isExpanded(other as any)).toBeTrue();
      component.toggleRun(other as any);
      expect(component.expandedRunId).toBeNull();
    });

    it('collapses any open run when a new page loads', () => {
      useHistoryService();
      component.expandedRunId = 'run-1';
      component.loadHistory();
      expect(component.expandedRunId).toBeNull();
    });

    it('shows how long each run took', () => {
      expect(component.getDuration(RUN as any)).toBe('21.9 s');
      expect(
        component.getDuration({
          ...RUN,
          finishedAt: '2026-11-04T11:21:41.000+00:00',
        } as any),
      ).toBe('2 min 5 s');
      expect(component.getDuration({ ...RUN, finishedAt: null } as any)).toBe(
        '-',
      );
    });

    it('labels statuses and trigger types', () => {
      expect(component.getStatusLabel('SUCCESS')).toBe('Success');
      expect(component.getStatusLabel('FAILED')).toBe('Failure');
      expect(component.getStatusLabel('IN_PROGRESS')).toBe('In progress');
      expect(component.getStatusClass('FAILED')).toBe('status-failed');
      expect(component.getStatusClass('IN_PROGRESS')).toBe('status-other');
      expect(component.getTriggerLabel(RUN as any)).toBe('Job');
      expect(
        component.getTriggerLabel({ ...RUN, triggerType: 'MANUAL' } as any),
      ).toBe('Manual');
    });

    it('labels phases by name', () => {
      expect(component.getPhaseLabel('XRAY_UPLOAD')).toBe('X-ray Upload');
    });

    describe('filters', () => {
      it('do not reach the list until Apply', () => {
        component.triggerTypeFilter = 'MANUAL';
        component.fromDate = new Date(2026, 10, 1);
        component.toDate = new Date(2026, 10, 3);
        expect(component.buildHistoryQuery()).toEqual({ page: 0, size: 10 });
      });

      it('Apply sends the trigger type alone and goes back to the first page', () => {
        const getHistory = useHistoryService();
        component.pageIndex = 2;
        component.triggerTypeFilter = 'MANUAL';
        component.applyFilters();
        expect(getHistory).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          triggerType: 'MANUAL',
        });
      });

      it('Apply sends the date range as yyyy-MM-dd together with the trigger type', () => {
        const getHistory = useHistoryService();
        component.fromDate = new Date(2026, 10, 1);
        component.toDate = new Date(2026, 10, 3);
        component.triggerTypeFilter = 'JOB';
        component.applyFilters();
        expect(getHistory).toHaveBeenCalledWith({
          page: 0,
          size: 10,
          fromDate: '2026-11-01',
          toDate: '2026-11-03',
          triggerType: 'JOB',
        });
      });

      it('"All" sends no trigger type', () => {
        component.appliedTriggerType = null;
        expect(component.buildHistoryQuery()).toEqual({ page: 0, size: 10 });
      });

      it('Apply is only enabled for a change, and never for a half-picked range', () => {
        expect(component.canApplyFilters).toBeFalse();
        component.triggerTypeFilter = 'JOB';
        expect(component.canApplyFilters).toBeTrue();
        component.fromDate = new Date(2026, 10, 1);
        expect(component.canApplyFilters).toBeFalse();
        component.toDate = new Date(2026, 10, 3);
        expect(component.canApplyFilters).toBeTrue();
        component.applyFilters();
        expect(component.canApplyFilters).toBeFalse();
      });

      it('Apply is enabled again once an applied filter is changed back to empty', () => {
        component.triggerTypeFilter = 'JOB';
        component.applyFilters();
        component.triggerTypeFilter = null;
        expect(component.canApplyFilters).toBeTrue();
      });

      it('Clear resets the picked and applied filters and reloads from the first page', () => {
        const getHistory = useHistoryService();
        component.fromDate = component.appliedFromDate = new Date(2026, 10, 1);
        component.toDate = component.appliedToDate = new Date(2026, 10, 3);
        component.triggerTypeFilter = component.appliedTriggerType = 'MANUAL';
        component.pageIndex = 2;
        component.clearFilters();
        expect(component.fromDate).toBeNull();
        expect(component.toDate).toBeNull();
        expect(component.triggerTypeFilter).toBeNull();
        expect(component.hasAppliedFilters).toBeFalse();
        expect(getHistory).toHaveBeenCalledWith({ page: 0, size: 10 });
      });

      it('Clear is enabled for a picked-but-unapplied trigger type', () => {
        expect(component.canClearFilters).toBeFalse();
        component.triggerTypeFilter = 'MANUAL';
        expect(component.canClearFilters).toBeTrue();
      });
    });

    it('reloads the history from the first page after a trigger, whatever the outcome', () => {
      spyOn(component, 'reloadHistoryFromFirstPage');
      component.triggerNikshayJob();
      spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
        throwError(() => ({})),
      );
      component.triggerNikshayJob();
      expect(component.reloadHistoryFromFirstPage).toHaveBeenCalledTimes(2);
    });

    it('does not reload the history when the trigger is cancelled', () => {
      spyOn(FakeDialogService, 'confirm').and.returnValue(of(false));
      spyOn(component, 'reloadHistoryFromFirstPage');
      component.triggerNikshayJob();
      expect(component.reloadHistoryFromFirstPage).not.toHaveBeenCalled();
    });

    describe('rendering', () => {
      const FAILED_RUN = {
        ...RUN,
        jobRunId: 'run-2',
        status: 'FAILED',
        summary: { ...RUN.summary, ...counts(3, 2, 1) },
        message: 'X-ray upload failed for 1 beneficiary',
      };

      it('shows each run with its status and counts', () => {
        useHistoryService(of(historyResponse([RUN, FAILED_RUN])));
        fixture.detectChanges();
        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Success');
        expect(text).toContain('Failure');
        expect(text).toContain('Job');
        expect(
          fixture.nativeElement.querySelector('.count-failed')?.textContent,
        ).toContain('1');
      });

      it('shows the message and phase breakdown only for the expanded run', () => {
        useHistoryService(of(historyResponse([RUN, FAILED_RUN])));
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain(
          'Phase Breakdown',
        );

        component.toggleRun(FAILED_RUN as any);
        fixture.detectChanges();
        const text = fixture.nativeElement.textContent;
        expect(text).toContain('Phase Breakdown');
        expect(text).toContain('X-ray upload failed for 1 beneficiary');
        expect(text).toContain('X-ray Upload');
        expect(
          fixture.nativeElement.querySelectorAll('.run-details').length,
        ).toBe(1);
      });

      it('explains an empty result for the selected filters', () => {
        useHistoryService(of(historyResponse([], 0)));
        component.appliedTriggerType = 'MANUAL';
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain(
          'No job runs match the selected filters',
        );
      });

      it('does not grey out zero counts', () => {
        useHistoryService(of(historyResponse([RUN])));
        component.toggleRun(RUN as any);
        fixture.detectChanges();
        expect(fixture.nativeElement.querySelector('.count-zero')).toBeNull();
        expect(fixture.nativeElement.querySelector('.idle-phase')).toBeNull();
      });
    });
  });
});
