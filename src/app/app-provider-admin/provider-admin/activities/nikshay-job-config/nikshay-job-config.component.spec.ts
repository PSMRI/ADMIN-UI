import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of, Subject, throwError } from 'rxjs';
import { NikshayJobConfigComponent } from './nikshay-job-config.component';
import { NikshayBeneficiaryListService } from '../services/nikshay-beneficiary-list.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

let component: NikshayJobConfigComponent;
let fixture: ComponentFixture<NikshayJobConfigComponent>;

const FakeNikshayBeneficiaryListService = {
  runNikshayJob: () => of({}),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};

describe('NikshayJobConfigComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [NikshayJobConfigComponent],
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

  it('shows the message from the response on success', () => {
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      of({ message: 'Job started' }),
    );
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Job started',
      'success',
    );
  });

  it('shows a plain-text response as the success message', () => {
    spyOn(FakeNikshayBeneficiaryListService, 'runNikshayJob').and.returnValue(
      of('Nikshay job queued'),
    );
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Nikshay job queued',
      'success',
    );
  });

  it('falls back to a generic success message', () => {
    spyOn(FakeDialogService, 'alert');
    component.triggerNikshayJob();
    expect(FakeDialogService.alert).toHaveBeenCalledOnceWith(
      'Nikshay job triggered successfully',
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
});
