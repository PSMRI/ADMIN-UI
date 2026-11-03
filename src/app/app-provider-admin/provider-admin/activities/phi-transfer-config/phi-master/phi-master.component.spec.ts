import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, of, throwError } from 'rxjs';
import { PhiMasterComponent } from './phi-master.component';
import { PhiTransferConfigService } from '../../services/phi-transfer-config.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

let component: PhiMasterComponent;
let fixture: ComponentFixture<PhiMasterComponent>;

const phiRecords = [
  {
    id: 1,
    villageId: 10000,
    tbuId: 100,
    designatedPhiId: 'PHI_1',
    designationHierarchyId: 'HIER_1',
    createdBy: 'admin',
  },
];

const FakePhiTransferConfigService = {
  getAllDesignatedPhi: () => of({ data: phiRecords }),
  getDesignatedPhi: (_filters: any) => of({ data: phiRecords }),
  updateDesignatedPhi: (_req: any) => of({ data: {} }),
};

const FakeDialogService = {
  alert: (_msg?: any, _type?: any) => undefined,
};

const FakeDataService = { uname: 'admin' };

function initTestBed() {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [PhiMasterComponent],
      schemas: [NO_ERRORS_SCHEMA],
      imports: [FormsModule],
      providers: [
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
    fixture = TestBed.createComponent(PhiMasterComponent);
    component = fixture.componentInstance;
  });
}

describe('PhiMasterComponent', () => {
  describe('construction', () => {
    initTestBed();

    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('reads updatedBy from session via dataService', () => {
      expect(component.updatedBy).toBe('admin');
    });
  });

  describe('search', () => {
    initTestBed();

    it('calls getAllDesignatedPhi when no filter is set', () => {
      spyOn(
        FakePhiTransferConfigService,
        'getAllDesignatedPhi',
      ).and.callThrough();
      spyOn(FakePhiTransferConfigService, 'getDesignatedPhi');
      component.ngOnInit();
      expect(
        FakePhiTransferConfigService.getAllDesignatedPhi,
      ).toHaveBeenCalled();
      expect(
        FakePhiTransferConfigService.getDesignatedPhi,
      ).not.toHaveBeenCalled();
      expect(component.phiList.data).toEqual(phiRecords);
      expect(component.showTableFlag).toBeTrue();
    });

    it('calls getDesignatedPhi with the active filters when any filter is set', () => {
      spyOn(FakePhiTransferConfigService, 'getDesignatedPhi').and.callThrough();
      component.filterVillageId = 10000;
      component.search();
      expect(
        FakePhiTransferConfigService.getDesignatedPhi,
      ).toHaveBeenCalledWith({
        villageId: 10000,
        tbuId: undefined,
        designatedPhiId: undefined,
      });
    });

    it('cancels a previous in-flight search before starting a new one', () => {
      const firstCall$ = new Subject<any>();
      const getAll = spyOn(
        FakePhiTransferConfigService,
        'getAllDesignatedPhi',
      ).and.returnValue(firstCall$);
      component.search();
      const firstSubscription = (component as any).searchSubscription;
      spyOn(firstSubscription, 'unsubscribe').and.callThrough();

      getAll.and.returnValue(of({ data: phiRecords }));
      component.search();

      expect(firstSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('shows the backend error message on failure', () => {
      spyOn(
        FakePhiTransferConfigService,
        'getAllDesignatedPhi',
      ).and.returnValue(
        throwError(() => ({
          errorMessage: 'Village, TBU or district is required',
        })),
      );
      spyOn(FakeDialogService, 'alert');
      component.search();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Village, TBU or district is required',
        'error',
      );
    });
  });

  describe('clearFilters', () => {
    initTestBed();

    it('clears all filter fields and hides the table', () => {
      component.filterVillageId = 1;
      component.filterTbuId = 2;
      component.filterDesignatedPhiId = 'x';
      component.phiList.data = phiRecords;
      component.showTableFlag = true;
      component.clearFilters();
      expect(component.filterVillageId).toBeUndefined();
      expect(component.filterTbuId).toBeUndefined();
      expect(component.filterDesignatedPhiId).toBeUndefined();
      expect(component.phiList.data).toEqual([]);
      expect(component.showTableFlag).toBeFalse();
    });
  });

  describe('edit / update flow', () => {
    initTestBed();

    it('editRecord loads the row into the edit fields and enters edit mode', () => {
      component.editRecord(phiRecords[0]);
      expect(component.selectedRecord).toBe(phiRecords[0]);
      expect(component.edit_designatedPhiId).toBe('PHI_1');
      expect(component.edit_designationHierarchyId).toBe('HIER_1');
      expect(component.editMode).toBeTrue();
    });

    it('cancelEdit leaves edit mode and clears the selected record', () => {
      component.editRecord(phiRecords[0]);
      component.cancelEdit();
      expect(component.editMode).toBeFalse();
      expect(component.selectedRecord).toBeUndefined();
    });

    it('updatePhiTransfer sends null for an empty Designation Hierarchy Id', () => {
      let sentRequest: any;
      spyOn(FakePhiTransferConfigService, 'updateDesignatedPhi').and.callFake(
        (req: any) => {
          sentRequest = req;
          return of({ data: {} });
        },
      );
      component.editRecord(phiRecords[0]);
      component.edit_designationHierarchyId = '';
      component.updatePhiTransfer();
      expect(sentRequest).toEqual({
        id: 1,
        villageId: 10000,
        tbuId: 100,
        designatedPhiId: 'PHI_1',
        designationHierarchyId: null,
        createdBy: 'admin',
        updatedBy: 'admin',
      });
    });

    it('shows a success alert, exits edit mode, and refreshes the list on success', () => {
      spyOn(FakeDialogService, 'alert');
      spyOn(component, 'search');
      component.editRecord(phiRecords[0]);
      component.updatePhiTransfer();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Designated PHI transfer updated successfully',
        'success',
      );
      expect(component.editMode).toBeFalse();
      expect(component.search).toHaveBeenCalled();
    });

    it('shows the backend error message on failure', () => {
      spyOn(
        FakePhiTransferConfigService,
        'updateDesignatedPhi',
      ).and.returnValue(
        throwError(() => ({
          errorMessage: 'Row was modified by someone else',
        })),
      );
      spyOn(FakeDialogService, 'alert');
      component.editRecord(phiRecords[0]);
      component.updatePhiTransfer();
      expect(FakeDialogService.alert).toHaveBeenCalledWith(
        'Row was modified by someone else',
        'error',
      );
    });
  });
});
