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
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { ProviderAdminFetosenseTestMasterService } from '../services/fetosense-test-master-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-fetosense-test-master',
  templateUrl: './fetosense-test-master.component.html',
  styleUrls: ['./fetosense-test-master.component.css'],
})
export class FetosenseTestMasterComponent implements OnInit {
  [x: string]: any;

  displayedColumns: string[] = [
    'SNo',
    'TestName',
    'TestDescription',
    'edit',
    'action',
  ];
  displayedColumns1: string[] = ['SNo', 'TestName', 'TestDescription', 'edit'];
  userID: any;
  showTestCreationForm = false;
  updateFeaturesToRoleFlag = false;
  showWorklist = false;
  showTestCreation = false;
  showFetosenseTestMaster = true;
  services: any = [];
  states: any = [];
  stateName: any;
  serviceLine: any;
  // filteredFetosenseTests =[];
  provider_states: any = [];
  test: any;
  description: any;
  nationalFlag!: boolean;
  providerServiceMapID: any;
  disableSelection = false;
  othersExist = false;
  selectedTest: any;
  searchedFetosenseTests = [];
  saveTest = false;
  updateTest = false;
  addButton = false;
  // addedFetosenseTests: any = [];
  fetosenseTest: any = {};
  confirmMessage: any;
  foetalMonitorTestID: any;
  searchTest: any;
  state: any;
  filteredTest: any;
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredFetosenseTests = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredFetosenseTests.paginator = this.paginator;
  }
  addedFetosenseTests = new MatTableDataSource<any>();
  constructor(
    public providerAdminTestMasterService: ProviderAdminFetosenseTestMasterService,
    private commonDataService: dataService,
    private alertService: ConfirmationDialogsService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.userID = this.commonDataService.uid;
    this.getProviderServices();
  }
  getProviderServices() {
    this.providerAdminTestMasterService
      .getServicesForFetosense(this.userID)
      .subscribe(
        (response: any) => {
          if (response !== null && response !== undefined)
            // this.services = response.data;
            this.services = response.data.filter(function (item: any) {
              console.log('item', item);
              if (item.serviceID === 4 || item.serviceID === 9) return item;
            });
        },
        (err) => {
          this.alertService.alert('error', err);
        },
      );
  }
  getStates(serviceLine: any) {
    this.states = [];
    this.state = '';
    this.searchTest = '';
    this.searchedFetosenseTests = [];
    this.filteredFetosenseTests.data = [];
    const getStateObj = {
      userID: this.userID,
      serviceID: serviceLine.serviceID,
      isNational: serviceLine.isNational,
    };
    this.providerAdminTestMasterService.getStates(getStateObj).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response),
      (err) => {
        this.alertService.alert('error', err);
      },
    );
  }
  getStatesSuccessHandeler(response: any) {
    if (response) {
      console.log(response.data, 'Provider States');
      this.states = response.data;
    }
  }
  testWorklist(stateName: any) {
    this.providerServiceMapID = stateName.providerServiceMapID;
    this.showWorklist = true;
    this.getTestsWorklist();
  }
  getTestsWorklist() {
    this.providerAdminTestMasterService
      .getTests(this.providerServiceMapID)
      .subscribe((res: any) => {
        const procedureList = res.data;
        console.log(procedureList);
        this.filteredFetosenseTests.data = res.data;
        this.searchedFetosenseTests = res.data;
      });
  }
  filterTestsList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredFetosenseTests.data = this.searchedFetosenseTests;
    } else {
      this.filteredFetosenseTests.data = [];
      this.searchedFetosenseTests.forEach((item) => {
        for (const key in item) {
          if (key === 'testName' || key === 'testDesc') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredFetosenseTests.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
  createTest() {
    this.disableSelection = true;
    this.showTestCreationForm = true;
    this.showWorklist = false;
    this.selectedTest = undefined;
    this.addButton = true;
    this.showTestCreation = true;
    this.showFetosenseTestMaster = false;
  }
  // addTests(test: any, desc: any) {
  //   const result = this.validateTest(test);
  //   let selectedTests = [];
  //   if (test === null) this.alertService.alert('No more Tests to add');
  //   if (Array.isArray(test)) {
  //     selectedTests = test;
  //     console.log('Selected tests', selectedTests);
  //   } else {
  //     selectedTests.push(test);
  //   }
  //   if (result) {
  //     this.validateAddedTest(test, desc);
  //   }
  //   this.saveTest = true;
  //   this.updateTest = false;
  //   this.test = '';
  //   this.description = '';
  // }
  // validateAddedTest(test: any, desc: any) {
  //   if (this.addedFetosenseTests.data.length < 1) {
  //     const fetosenseTest = this.addtempTestMap(test, desc);
  //     if (
  //       fetosenseTest.testName !== undefined &&
  //       fetosenseTest.testName !== null &&
  //       fetosenseTest.testName.trim().length > 0
  //     ) {
  //       this.addedFetosenseTests.data.push(fetosenseTest);
  //     }
  //   } else {
  //     for (const addedTest of this.addedFetosenseTests.data) {
  //       if (
  //         addedTest.testName !== undefined &&
  //         addedTest.testName !== null &&
  //         test !== undefined &&
  //         test !== null &&
  //         addedTest.testName.toLowerCase().trim() === test.toLowerCase().trim()
  //       ) {
  //         this.alertService.alert('Test name already exists');
  //         return;
  //       }
  //     }
  //     const fetosenseTest = this.addtempTestMap(test, desc);
  //     if (
  //       fetosenseTest.testName !== undefined &&
  //       fetosenseTest.testName !== null &&
  //       fetosenseTest.testName.trim().length > 0
  //     ) {
  //       this.addedFetosenseTests.data.push(fetosenseTest);
  //     }
  //   }
  // }

  addTests(test: any, desc: any) {
    if (test === null || test === undefined) {
      this.alertService.alert('No more Tests to add');

      return;
    }

    let selectedTests = [];
    if (Array.isArray(test)) {
      selectedTests = test;

      console.log('Selected tests', selectedTests);
    } else {
      selectedTests.push(test);
    }
    for (const selectedTest of selectedTests) {
      const result = this.validateTest(selectedTest);

      if (result) {
        this.validateAddedTest(selectedTest, desc);
      }
    }

    this.saveTest = true;

    this.updateTest = false;

    this.test = '';

    this.description = '';
  }

  validateAddedTest(test: any, desc: any) {
    const isDuplicate = this.addedFetosenseTests.data.some(
      (addedTest) =>
        addedTest.testName.toLowerCase().trim() === test.toLowerCase().trim(),
    );

    if (isDuplicate) {
      this.alertService.alert('Test name already exists');
    } else {
      const fetosenseTest = this.addtempTestMap(test, desc);
      if (
        fetosenseTest.testName !== undefined &&
        fetosenseTest.testName.trim().length > 0
      ) {
        this.addedFetosenseTests.data = [
          ...this.addedFetosenseTests.data,
          fetosenseTest,
        ];
      }
    }
  }

  addtempTestMap(test: any, desc: any) {
    this.fetosenseTest = {
      testName: test,
      testDesc: desc === '' || undefined ? null : desc,
      createdBy: this.commonDataService.uname,
      providerServiceMapID: this.providerServiceMapID,
    };
    return this.fetosenseTest;
  }
  saveTests() {
    this.providerAdminTestMasterService
      .createTests(this.addedFetosenseTests.data)
      .subscribe(
        (response: any) => this.testStatusSuccessHandeler(response, 'save'),
        (err) => {
          this.alertService.alert('error', err);
        },
      );
  }
  editTest(roleObj: any) {
    this.test = roleObj.testName;
    this.description = roleObj.testDesc;
    this.saveTest = false;
    this.updateTest = true;
    this.addButton = false;
    this.disableSelection = true;
    this.showTestCreationForm = true;
    this.showWorklist = false;
    this.selectedTest = roleObj.testName;
    this.foetalMonitorTestID = roleObj.foetalMonitorTestID;
    this.showFetosenseTestMaster = false;
  }
  updateTestChanges() {
    const fetosenseTest = {
      foetalMonitorTestID: this.foetalMonitorTestID,
      testName:
        this.test !== undefined && this.test !== null ? this.test.trim() : null,
      testDesc:
        this.description !== undefined && this.description !== null
          ? this.description.trim()
          : null,
      createdBy: this.commonDataService.uname,
      providerServiceMapID: this.providerServiceMapID,
    };
    this.providerAdminTestMasterService.updateTest(fetosenseTest).subscribe(
      (response: any) => {
        this.testStatusSuccessHandeler(response, 'update');
      },
      (err) => {
        this.alertService.alert('error', err);
      },
    );
  }
  removeTest(index: any) {
    const newData = [...this.addedFetosenseTests.data];
    newData.splice(index, 1);
    this.addedFetosenseTests.data = newData;
    this.cdr.detectChanges();
    if (this.addedFetosenseTests.data.length === 0) this.saveTest = false;
  }
  deleteTest(fetoID: any, flag: any) {
    const fetosenseTest = {
      foetalMonitorTestID: fetoID,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.alertService
      .confirm(
        'Confirm',
        'Are you sure you want to ' + this.confirmMessage + '?',
      )
      .subscribe(
        (res) => {
          if (res) {
            this.providerAdminTestMasterService
              .deleteTest(fetosenseTest)
              .subscribe(
                (response: any) =>
                  this.testStatusSuccessHandeler(response, this.confirmMessage),
                (err) => {
                  this.alertService.alert('error', err);
                },
              );
          }
        },
        (err) => {
          this.alertService.alert('error', err);
        },
      );
  }
  back() {
    this.alertService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.setTestsFormFlag();
          this.getTestsWorklist();
        }
      });
  }

  validateTest(test: any): boolean {
    if (
      this.selectedTest !== undefined &&
      this.selectedTest !== null &&
      this.selectedTest.trim().toUpperCase() === test.trim().toUpperCase()
    ) {
      this.othersExist = false;
      return true; // Return value added
    } else {
      let count = 0;
      for (this.filteredTest of this.searchedFetosenseTests) {
        if (
          this.filteredTest.testName !== undefined &&
          this.filteredTest.testName !== null &&
          test !== undefined &&
          test !== null &&
          this.filteredTest.testName.trim().toUpperCase() ===
            test.trim().toUpperCase()
        ) {
          count = count + 1;
        }
      }
      console.log(count);
      if (count > 0) {
        this.othersExist = true;
        return false;
      } else {
        this.othersExist = false;
        return true;
      }
    }
  }

  setTestsFormFlag() {
    this.test = '';
    this.description = '';
    this.searchTest = '';
    this.showTestCreationForm = false;
    this.showWorklist = true;
    this.disableSelection = false;
    this.othersExist = false;
    this.saveTest = false;
    this.updateTest = false;
    this.addedFetosenseTests.data = [];
    this.showTestCreation = false;
    this.showFetosenseTestMaster = true;
    this.selectedTest = undefined;
  }
  testStatusSuccessHandeler(response: any, status: any) {
    if (status === 'save') {
      this.alertService.alert('Saved successfully', 'success');
      console.log(response.data, 'in create role success in component.ts');
    } else if (status === 'update') {
      this.alertService.alert('Updated successfully', 'success');
    } else {
      this.alertService.alert(status + 'd successfully', 'success');
    }
    this.setTestsFormFlag();
    this.getTestsWorklist();
  }
}
