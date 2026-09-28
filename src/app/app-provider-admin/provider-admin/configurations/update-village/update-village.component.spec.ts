/*
 * AMRIT – Accessible Medical Records via Integrated Technology
 * Integrated EHR (Electronic Health Records) Solution
 *
 * Copyright (C) "Piramal Swasthya Management and Research Institute"
 *
 * This file is part of AMRIT.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see https://www.gnu.org/licenses/.
 */
import { of, throwError } from 'rxjs';
import { UpdateVillageComponent } from './update-village.component';

describe('UpdateVillageComponent', () => {
  let component: UpdateVillageComponent;
  let service: any;
  let alertService: any;
  let sessionstorage: any;

  const user = { userID: 7, userName: 'asha01', firstName: 'Asha' };
  const mapping = {
    uSRMappingID: 101,
    userID: 7,
    roleID: 3,
    roleName: 'ASHA',
    providerServiceMapID: 1717,
    stateID: 5,
    workingDistrictID: '50',
    blockID: 500,
    blockName: 'Block A',
    villageID: ['9001', ' 9002'],
    villageName: ['Village A', 'Village B '],
  };

  beforeEach(() => {
    service = jasmine.createSpyObj('UpdateVillageService', [
      'getUserList',
      'getUserDetail',
      'getUserRoleMapped',
      'getStates',
      'getDistricts',
      'getBlocks',
      'getVillages',
      'updateVillage',
    ]);
    alertService = jasmine.createSpyObj('ConfirmationDialogsService', [
      'alert',
      'confirm',
    ]);
    sessionstorage = jasmine.createSpyObj('SessionStorageService', ['getItem']);
    sessionstorage.getItem.and.callFake((key: string) =>
      key === 'service_providerID' ? 12 : 'admin',
    );

    service.getUserList.and.returnValue(of({ data: [user] }));
    service.getStates.and.returnValue(
      of({ data: [{ stateID: 5, stateName: 'State' }] }),
    );
    service.getUserDetail.and.returnValue(of({ data: { employeeID: 'E1' } }));
    service.getUserRoleMapped.and.returnValue(
      of({ data: [mapping, { ...mapping, uSRMappingID: 999, userID: 8 }] }),
    );
    service.getDistricts.and.returnValue(
      of({ data: [{ districtID: 50, districtName: 'District' }] }),
    );
    service.getBlocks.and.returnValue(
      of({
        data: [
          { blockID: 500, blockName: 'Block A' },
          { blockID: 600, blockName: 'Block B' },
        ],
      }),
    );
    service.getVillages.and.returnValue(
      of({
        data: [
          { districtBranchID: 9001, villageName: 'Village A' },
          { districtBranchID: 9003, villageName: 'Village C' },
        ],
      }),
    );

    component = new UpdateVillageComponent(
      service,
      alertService,
      sessionstorage,
    );
    component.ngOnInit();
  });

  it('loads users and states on init', () => {
    expect(service.getUserList).toHaveBeenCalledWith(12);
    expect(service.getStates).toHaveBeenCalledWith(1);
    expect(component.userNamesList).toEqual([user]);
    expect(component.statesList.length).toBe(1);
  });

  it('loads only the selected user mappings and pre-fills the hierarchy', () => {
    component.user = user;
    component.onUserChange();

    expect(service.getUserDetail).toHaveBeenCalledWith('asha01');
    expect(component.userDetail.employeeID).toBe('E1');
    expect(component.userMappings.length).toBe(1);
    expect(component.userMappings[0].mappedVillages).toEqual([
      { villageID: '9001', villageName: 'Village A' },
      { villageID: '9002', villageName: 'Village B' },
    ]);
    // single mapping is auto-selected and its state/district/block pre-filled
    expect(component.selectedMapping.uSRMappingID).toBe(101);
    expect(component.state.stateID).toBe(5);
    expect(component.district.districtID).toBe(50);
    expect(component.block.blockID).toBe(500);
    expect(component.villagesList.length).toBe(2);
  });

  it('validates the selection step by step', () => {
    expect(component.validationMessage).toBe('Select a user');
    component.user = user;
    expect(component.validationMessage).toContain('mapping');
    component.onUserChange();
    expect(component.validationMessage).toBe('Select the village to replace');
    component.oldVillage = component.selectedMapping.mappedVillages[0];
    expect(component.validationMessage).toBe('Select the new village');
    component.newVillage = component.villagesList[0];
    expect(component.validationMessage).toContain('already mapped');
    component.newVillage = component.villagesList[1];
    expect(component.validationMessage).toBeNull();
    expect(component.canSubmit).toBeTrue();
  });

  it('flags a block different from the current mapping', () => {
    component.user = user;
    component.onUserChange();
    expect(component.blockChanged).toBeFalse();
    component.block = component.blocksList[1];
    expect(component.blockChanged).toBeTrue();
  });

  it('builds the request and updates after confirmation', () => {
    component.user = user;
    component.onUserChange();
    component.oldVillage = component.selectedMapping.mappedVillages[1];
    component.newVillage = component.villagesList[1];
    alertService.confirm.and.returnValue(of(true));
    service.updateVillage.and.returnValue(of({ data: null }));

    component.confirmAndUpdate();

    expect(service.updateVillage).toHaveBeenCalledWith({
      userID: 7,
      userName: 'asha01',
      uSRMappingID: 101,
      roleID: 3,
      providerServiceMapID: 1717,
      oldBlockID: 500,
      oldVillageID: 9002,
      oldVillageName: 'Village B',
      newStateID: 5,
      newDistrictID: 50,
      newBlockID: 500,
      newBlockName: 'Block A',
      newVillageID: 9003,
      newVillageName: 'Village C',
      modifiedBy: 'admin',
    });
    expect(alertService.alert).toHaveBeenCalledWith(
      'Village updated successfully',
      'success',
    );
    expect(component.updateResult.newVillageName).toBe('Village C');
    expect(component.submitting).toBeFalse();
  });

  it('does not update when the confirmation is declined', () => {
    component.user = user;
    component.onUserChange();
    component.oldVillage = component.selectedMapping.mappedVillages[0];
    component.newVillage = component.villagesList[1];
    alertService.confirm.and.returnValue(of(false));

    component.confirmAndUpdate();

    expect(service.updateVillage).not.toHaveBeenCalled();
  });

  it('shows the error and re-enables submit when the update fails', () => {
    component.user = user;
    component.onUserChange();
    component.oldVillage = component.selectedMapping.mappedVillages[0];
    component.newVillage = component.villagesList[1];
    alertService.confirm.and.returnValue(of(true));
    service.updateVillage.and.returnValue(
      throwError(() => ({ errorMessage: 'failed' })),
    );

    component.confirmAndUpdate();

    expect(alertService.alert).toHaveBeenCalledWith('failed', 'error');
    expect(component.submitting).toBeFalse();
    expect(component.updateResult).toBeNull();
  });

  it('resets lower levels when a higher level changes', () => {
    component.user = user;
    component.onUserChange();
    component.newVillage = component.villagesList[1];

    component.onBlockChange();
    expect(component.newVillage).toBeNull();

    component.onDistrictChange();
    expect(service.getBlocks).toHaveBeenCalledWith(50);

    component.state = null;
    component.onStateChange();
    expect(component.district).toBeNull();
    expect(component.districtsList).toEqual([]);
  });
});
