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
import { Component, OnInit, ViewChild, Inject, Input } from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SuperAdmin_ServiceProvider_Service } from 'src/app/core/services/adminServices/AdminServiceProvider/superadmin_serviceprovider.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';

@Component({
  selector: 'app-provider-admin-list',
  templateUrl: './provider-admin-list.component.html',
  styleUrls: ['./provider-admin-list.component.css'],
})
export class ProviderAdminListComponent implements OnInit {
  titleID: any;
  admin_firstName: any;
  admin_middleName: any;
  admin_lastName: any;
  gender: any;
  genderID: any;
  dob: any;
  age!: number;
  primaryMobileNumber: any;
  primaryEmail: any;
  marital_status: any;
  aadharNumber: any;
  panNumber: any;
  edu_qualification: any;
  emergency_cnt_person: any;
  emergencyMobileNumber: any;
  username: any;
  user_password: any;
  today = new Date();
  mindate = new Date();
  maxdate = new Date();
  admin_remarks: any;
  username_status!: string;
  showHint: boolean;
  username_dependent_flag: boolean;
  isExistAadhar = false;
  isExistPan = false;
  errorMessageForAadhar!: string;
  errorMessageForPan!: string;
  dynamictype: any = 'password';

  resetAge = 0;
  userID: any;
  confirmMessage: any;
  createdBy: any;
  usernameBeforeEdit: any;

  //flags

  tableMode = true;
  formMode = false;
  editMode = false;
  showTableFlag = false;
  // adminNameExists: boolean = false;

  //array
  filteredValue: any = [];
  searchResult: any = [];
  titles: any = [];
  genders: any = [];
  genderName: any = [];
  maritalStatus: any = [];
  eduQualification: any = [];
  adminNameArray = [];
  searchResultArray: any = [];
  allProviderAdmin: any = [];

  //userNamePattern = /^[0-9a-zA-Z]+[0-9a-zA-Z-_.]+[0-9a-zA-Z]$/;;
  emailPattern = /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;
  passwordPattern =
    /^(?=.*[0-9])(?=.*[A-Z])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,12}$/;
  mobileNoPattern = /^[1-9][0-9]{9}/;

  @ViewChild('providerAdminCreationForm') providerAdminCreationForm!: NgForm;
  @ViewChild('adminCredentialsForm') adminCredentialsForm!: NgForm;

  displayedColumns = [
    'sno',
    'titleName',
    'userName',
    'contactNo',
    'emergencyContactNo',
    'emailID',
    'aadhaarNo',
    'pAN',
    'remarks',
    'edit',
    'action',
  ];

  displayAddedColumns = [
    'sno',
    'username',
    'primaryEmail',
    'primaryMobileNumber',
    'action',
  ];

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResult = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResult.paginator = this.paginator;
  }
  objs = new MatTableDataSource<any>();

  constructor(
    public superadminService: SuperAdmin_ServiceProvider_Service,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    public dialog: MatDialog,
  ) {
    this.showHint = false;
    this.username_dependent_flag = true;
  }

  ngOnInit() {
    this.getAllProviderAdminDetails();
  }

  /*
   * All details of the provider admin
   */

  getAllProviderAdminDetails() {
    this.superadminService.getAllProviderAdmin().subscribe(
      (response: any) => {
        if (response) {
          console.log('All details of provider admin', response);
          this.searchResult = response.data;
          this.filteredsearchResult.data = response.data;
        }
      },
      (err) => {
        console.log(err, 'error');
        console.log('Error', err);
      },
    );
  }

  filteredResult(searchValue: any) {
    console.log('Search Valueeee', searchValue);
    if (searchValue) {
      console.log('Search Value', searchValue);

      this.filteredValue = this.searchResult.filter((item: any) => {
        return item.userName
          .toLowerCase()
          .startsWith(searchValue.toLowerCase());
      });
    } else {
      this.filteredValue = this.searchResult.slice(0, 10);
    }
  }

  /*
   * Listing the default values for title, gender, marital status and educational qualification
   */
  showForm() {
    this.tableMode = false;
    this.formMode = true;
    this.editMode = false;

    this.resetDob();

    this.superadminService.getCommonRegistrationData().subscribe(
      (response) => this.showGenderOnCondition(response),
      (err) => console.log(err, 'error'),
    );

    this.superadminService.getAllQualifications().subscribe(
      (response) => this.getEduQualificationSuccessHandler(response),
      (err) => console.log(err, 'error'),
    );

    this.superadminService.getAllMaritalStatus().subscribe(
      (response) => this.showAllMaritalSuccessHandler(response),
      (err) => console.log(err, 'error'),
    );
  }
  /*
   * Reset the dob on adding multiple objects
   */
  resetDob() {
    this.dob = new Date();
    this.dob.setHours(0);
    this.dob.setMinutes(0);
    this.dob.setSeconds(0);
    this.dob.setMilliseconds(0);
    // setting dob as min 14 years to restrict child labour
    this.dob.setFullYear(this.today.getFullYear() - 14);
    this.maxdate = new Date();
    this.maxdate.setFullYear(this.today.getFullYear() - 14);
    this.mindate = new Date();
    this.mindate.setFullYear(this.today.getFullYear() - 70);
    this.calculateAge(this.dob);
  }
  /*
   * display the added admin's in the table
   */
  showTable() {
    this.dialogService
      .confirm(
        'Confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.resetAllForms();
          this.objs.data = [];
          if (this.editMode) {
            this.tableMode = true;
            this.formMode = false;
            this.editMode = false;
          } else {
            this.tableMode = true;
            this.formMode = false;
            this.editMode = false;
          }
        }
      });
  }

  calculateAge(date: any) {
    if (date !== undefined) {
      let age = this.today.getFullYear() - date.getFullYear();
      if (this.objs.data.length === 0) {
        this.age = age;
      } else {
        this.providerAdminCreationForm.form.patchValue({ person_age: age });
      }

      const month = this.today.getMonth() - date.getMonth();
      if (month < 0 || (month === 0 && this.today.getDate() < date.getDate())) {
        age--; //age is ng-model of AGE
        if (this.objs.data.length === 0) {
          this.age = age;
        } else {
          this.providerAdminCreationForm.form.patchValue({ person_age: age });
        }
      }
    }
  }

  /*
   * User name availability
   */

  checkUserNameAvailability(username: any) {
    console.log('user', this.username);
    this.superadminService.checkUserAvailability(username).subscribe(
      (response) => this.checkUsernameSuccessHandeler(response),
      (err) => console.log(err, 'error'),
    );
  }

  checkUsernameSuccessHandeler(response: any) {
    console.log('username existance status', response);
    if (response.response === 'userexist') {
      this.username_status = 'User ID exists';
      this.showHint = true;
      this.username_dependent_flag = true;
      // this.username = null;
    }
    if (response.response === 'usernotexist') {
      if (
        this.username !== '' &&
        this.username !== undefined &&
        this.username !== null
      ) {
        console.log('if response', response);
        this.showHint = false;
        this.username_dependent_flag = false;
      }
    }
  }

  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }
  // encryptionFlag: boolean = true;

  showPWD() {
    this.dynamictype = 'text';
  }

  hidePWD() {
    this.dynamictype = 'password';
  }

  /*
   * Display gender on condition
   */

  setGenderOnCondition() {
    if (
      this.titleID === 2 ||
      this.titleID === 4 ||
      this.titleID === 5 ||
      this.titleID === 13
    ) {
      this.gender = 2;
    } else if (this.titleID === 3 || this.titleID === 8) {
      this.gender = 1;
    } else {
      this.gender = '';
    }
  }
  showGenderOnCondition(response: any) {
    console.log('Display gender on condition', response);
    this.titles = response.data.m_Title;
    this.genders = response.data.m_genders;
  }

  /*
   * List the qualification details
   */
  getEduQualificationSuccessHandler(response: any) {
    console.log(response, 'admin qualification');
    this.eduQualification = response.data;
  }
  /*
   * List the marital status
   */
  showAllMaritalSuccessHandler(response: any) {
    console.log(response, 'marital status');
    this.maritalStatus = response.data;
    console.log('result', this.maritalStatus);
  }
  /*
   * Check Uniqueness in Aadhar
   */
  checkAadhar() {
    this.isExistAadhar = false;
    this.errorMessageForAadhar = '';
    if (this.aadharNumber !== undefined && this.aadharNumber !== null) {
      if (this.aadharNumber.length === 12) {
        this.superadminService.validateAadhar(this.aadharNumber).subscribe(
          (response: any) => {
            this.checkAadharSuccessHandler(response);
          },

          (err) => {
            console.log('Error', err);
            //this.dialogService.alert(err, 'error')
          },
        );
      }
    }
  }
  checkAadharSuccessHandler(response: any) {
    if (response.response === 'true') {
      this.isExistAadhar = true;
      this.errorMessageForAadhar = 'Aadhar number already exists';
    } else {
      this.isExistAadhar = false;
      this.errorMessageForAadhar = '';
    }
  }
  /*
   * Check Uniqueness in Pan
   */
  checkPan() {
    this.isExistPan = false;
    this.errorMessageForPan = '';
    if (this.panNumber !== undefined && this.panNumber !== null) {
      if (this.panNumber.length === 10) {
        this.superadminService.validatePan(this.panNumber).subscribe(
          (response) => {
            console.log('pan response', response);
            this.checkPanSuccessHandler(response);
          },
          (err) => {
            console.log('Error', err);
            //this.dialogService.alert(err, 'error')
          },
        );
      }
    }
  }
  checkPanSuccessHandler(response: any) {
    if (response.response === 'true') {
      this.isExistPan = true;
      this.errorMessageForPan = 'Pan number already exists';
    } else {
      this.isExistPan = false;
      this.errorMessageForPan = '';
    }
  }
  /*
   * Reset all the forms
   */
  resetAllForms() {
    this.providerAdminCreationForm.resetForm();
    this.adminCredentialsForm.resetForm();
    this.resetDob();
  }
  /*
   * Method for addition of objects
   */
  add_object(providerAdminData: any, adminCredentials: any) {
    console.log('providerAdmin', providerAdminData);
    console.log('user', adminCredentials);

    const tempObj = {
      titleID: providerAdminData.title_Id,
      admin_firstName: providerAdminData.firstName,
      admin_middleName: providerAdminData.middleName,
      admin_lastName: providerAdminData.lastName,
      genderID: providerAdminData.adminGender,
      dob: new Date(
        providerAdminData.admin_dob.valueOf() -
          1 * providerAdminData.admin_dob.getTimezoneOffset() * 60 * 1000,
      ),
      // 'age': providerAdminData.age,
      age: this.age,
      primaryMobileNumber: providerAdminData.contact_number,
      primaryEmail: providerAdminData.email,
      maritalStatusID: providerAdminData.admin_maritalStatusId,
      aadhaarNo: providerAdminData.aadhar_number,
      pAN: providerAdminData.pan_number,
      edu_qualification: providerAdminData.admin_edu_qualification,
      emergency_cnt_person: providerAdminData.em_contact_person,
      emergencyMobileNumber: providerAdminData.em_contact_number,
      username: adminCredentials.user_name,
      password: adminCredentials.password,
      admin_remarks:
        adminCredentials.remarks !== undefined &&
        adminCredentials.remarks !== null
          ? adminCredentials.remarks.trim()
          : null,
    };
    console.log('add objects', tempObj);
    this.checkUserNameAvailability(name);
    this.checkDuplicatesInBuffer(tempObj);
    this.resetAllForms();
  }

  checkDuplicatesInBuffer(tempObj: any) {
    let duplicateAadhar = 0;
    let duplicatePan = 0;
    let duplicateName = 0;
    if (this.objs.data.length === 0) {
      this.objs.data.push(tempObj);
    } else {
      for (let i = 0; i < this.objs.data.length; i++) {
        if (
          this.objs.data[i].aadhaarNo !== undefined &&
          this.objs.data[i].aadhaarNo === tempObj.aadhaarNo
        ) {
          duplicateAadhar = duplicateAadhar + 1;
          console.log('duplicateAadhar', duplicateAadhar);
        }
        if (
          this.objs.data[i].pAN !== undefined &&
          this.objs.data[i].pAN === tempObj.pAN
        ) {
          duplicatePan = duplicatePan + 1;
          console.log('duplicatePan', duplicatePan);
        }
        if (
          this.objs.data[i].username !== undefined &&
          this.objs.data[i].username === tempObj.username
        ) {
          duplicateName = duplicateName + 1;
          console.log('this.duplicateName', duplicateName);
        }
      }
      if (duplicateAadhar === 0 && duplicatePan === 0 && duplicateName === 0) {
        this.objs.data.push(tempObj);
      } else if (duplicateAadhar > 0 && duplicatePan > 0 && duplicateName > 0) {
        this.dialogService.alert(
          'Aadhar, Pan number and Username already exists',
        );
      } else if (duplicateAadhar > 0 && duplicatePan > 0) {
        this.dialogService.alert('Aadhar and Pan number already exists');
      } else if (duplicateAadhar > 0 && duplicateName > 0) {
        this.dialogService.alert('Aadhar number and Username already exists');
      } else if (duplicatePan > 0 && duplicateName > 0) {
        this.dialogService.alert('Pan number and Username already exists');
      } else if (duplicateAadhar > 0) {
        this.dialogService.alert('Aadhar number already exists');
      } else if (duplicatePan > 0) {
        this.dialogService.alert('Pan number already exists');
      } else {
        this.dialogService.alert('Already exists');
      }
    }
  }
  /*
   * Removing single object
   */
  remove_obj(index: any) {
    this.objs.data.splice(index, 1);
  }
  /*
  /*
  * Clear all the data
  */
  /*
   * provider creation
   */
  createProviderAdmin() {
    const reqObject = [];
    for (let i = 0; i < this.objs.data.length; i++) {
      const tempObj = {
        titleID: this.objs.data[i].titleID,
        firstName: this.objs.data[i].admin_firstName,
        middleName: this.objs.data[i].admin_middleName,
        lastName: this.objs.data[i].admin_lastName,
        genderID: this.objs.data[i].genderID,
        dOB: this.objs.data[i].dob,
        //  'age': this.objs.data[i].age,
        contactNo: this.objs.data[i].primaryMobileNumber,
        emailID: this.objs.data[i].primaryEmail,
        maritalStatusID: this.objs.data[i].maritalStatusID,
        aadhaarNo:
          this.objs.data[i].aadhaarNo === ''
            ? null
            : this.objs.data[i].aadhaarNo,
        pAN: this.objs.data[i].pAN === '' ? null : this.objs.data[i].pAN,
        qualificationID: this.objs.data[i].edu_qualification,
        emergencyContactPerson: this.objs.data[i].emergency_cnt_person,
        emergencyContactNo: this.objs.data[i].emergencyMobileNumber,
        userName: this.objs.data[i].username,
        password: this.objs.data[i].password,
        remarks:
          this.objs.data[i].admin_remarks !== undefined &&
          this.objs.data[i].admin_remarks !== null
            ? this.objs.data[i].admin_remarks.trim()
            : null,
        createdBy: this.commonDataService.uname,
        isProviderAdmin: 'true',
        statusID: '1',
      };
      reqObject.push(tempObj);
    }
    console.log(reqObject, 'details to be saved');
    this.superadminService.createProviderAdmin(reqObject).subscribe(
      (response) => {
        console.log('response', response);

        this.dialogService.alert('Saved successfully', 'success');
        this.tableMode = true;
        this.formMode = false;
        this.editMode = false;
        this.objs.data = [];
        this.getAllProviderAdminDetails();
      },
      (err) => console.log(err, 'error'),
    );
  }
  /*
   * Editing provider admin details
   */
  editProviderAdmin(item: any) {
    console.log('Existing Data', item);
    const dialog_Ref = this.dialog.open(EditProviderAdminModalComponent, {
      height: '500px',
      width: '1000px',
      disableClose: true,
      data: item,
    });
    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.dialogService.alert('Updated successfully', 'success');
        this.getAllProviderAdminDetails();
        this.tableMode = true;
        this.formMode = false;
        this.editMode = false;
      }
    });
  }

  /*
   * Activation and deactivation of the provider admin
   */
  activateDeactivate(userID: any, flag: any) {
    const obj = {
      userID: userID,
      deleted: flag,
    };
    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    this.dialogService
      .confirm('Confirm', 'Are you sure want to ' + this.confirmMessage + '?')
      .subscribe(
        (res) => {
          if (res) {
            console.log('Obj', obj);
            this.superadminService.delete_toggle_activation(obj).subscribe(
              (res: any) => {
                console.log('response', res);
                this.dialogService.alert(
                  this.confirmMessage + 'd successfully',
                  'success',
                );
                this.getAllProviderAdminDetails();
              },
              (err) => {
                console.log(err, 'error');
                console.log(err);
              },
            );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResult.data = this.searchResult;
    } else {
      this.filteredsearchResult.data = [];
      this.searchResult.forEach((item: any) => {
        for (const key in item) {
          if (
            key === 'userName' ||
            key === 'contactNo' ||
            key === 'emergencyContactNo' ||
            key === 'emailID'
          ) {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResult.data.push(item);
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-editprovideradminmodal',
  templateUrl: './edit-provider-admin-list.html',
  styleUrls: ['./provider-admin-list.component.css'],
})
export class EditProviderAdminModalComponent implements OnInit {
  //ngModel

  titleID: any;
  admin_firstName: any;
  admin_middleName: any;
  admin_lastName: any;
  gender: any;
  dob: any;
  age: any;
  primaryMobileNumber: any;
  primaryEmail: any;
  marital_status: any;
  aadharNumber: any;
  panNumber: any;
  edu_qualification: any;
  emergency_cnt_person: any;
  emergencyMobileNumber: any;
  admin_remarks: any;
  today = new Date();
  mindate = new Date();
  maxdate = new Date();
  formMode = true;
  isExistAadhar = false;
  isExistPan = false;
  errorMessageForAadhar!: string;
  errorMessageForPan!: string;

  // arrays
  genders: any = [];
  genderID: any = [];
  titles: any = [];
  eduQualification: any = [];
  maritalStatus: any = [];
  allProviderAdmin: any = [];

  emailPattern = /^[0-9a-zA-Z_.]+@[a-zA-Z_]+?\.\b(org|com|COM|IN|in|co.in)\b$/;

  @ViewChild('editAdminCreationForm') editAdminCreationForm!: NgForm;
  tomorrow: any;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public superadminService: SuperAdmin_ServiceProvider_Service,
    public dialogRef: MatDialogRef<EditProviderAdminModalComponent>,
    public dialogService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log('Initial value', this.data);
    this.superadminService
      .getCommonRegistrationData()
      .subscribe((response: any) => this.showGenderOnCondition(response));
    this.superadminService
      .getAllQualifications()
      .subscribe((response: any) =>
        this.getEduQualificationSuccessHandler(response),
      );
    this.superadminService
      .getAllMaritalStatus()
      .subscribe((response: any) =>
        this.showAllMaritalSuccessHandler(response),
      );
    this.edit();
  }

  edit() {
    this.dob = new Date();
    this.titleID = this.data.titleID;
    this.admin_firstName = this.data.firstName;
    this.admin_middleName = this.data.middleName;
    this.admin_lastName = this.data.lastName;
    this.gender = this.data.genderID;
    this.primaryMobileNumber = this.data.contactNo;
    this.primaryEmail = this.data.emailID;
    this.dob = this.data.dOB;
    this.marital_status = this.data.maritalStatusID;
    this.aadharNumber = this.data.aadhaarNo;
    this.panNumber = this.data.pAN;
    this.edu_qualification = this.data.qualificationID;
    this.emergency_cnt_person = this.data.emergencyContactPerson;
    this.emergencyMobileNumber = this.data.emergencyContactNo;
    this.admin_remarks =
      this.data.remarks !== undefined && this.data.remarks !== null
        ? this.data.remarks.trim()
        : null;
    this.resetDob();
  }
  /*
   * Reset the dob on adding multiple objects
   */
  resetDob() {
    this.dob = new Date();
    this.dob.setHours(0);
    this.dob.setMinutes(0);
    this.dob.setSeconds(0);
    this.dob.setMilliseconds(0);
    // setting dob as min 14 years to restrict child labour
    this.dob.setFullYear(this.today.getFullYear() - 14);
    this.maxdate = new Date();
    this.maxdate.setFullYear(this.today.getFullYear() - 14);
    this.mindate = new Date();
    this.mindate.setFullYear(this.today.getFullYear() - 70);
    this.calculateAge(this.dob);
  }
  /*
   * Display gender on condition
   */

  setGenderOnCondition() {
    if (
      this.titleID === 2 ||
      this.titleID === 4 ||
      this.titleID === 5 ||
      this.titleID === 13
    ) {
      this.gender = 2;
    } else if (this.titleID === 3 || this.titleID === 8) {
      this.gender = 1;
    } else {
      this.gender = '';
    }
  }
  showGenderOnCondition(response: any) {
    console.log('Display gender on condition', response);
    this.titles = response.data.m_Title;
    this.genders = response.data.m_genders;
  }
  /*
   * Calculate age
   */
  calculateAge(dob: any) {
    if (dob !== undefined) {
      const existDobAge = new Date(dob);
      this.age = this.today.getFullYear() - existDobAge.getFullYear();
      const month = this.today.getMonth() - existDobAge.getMonth();
      if (
        month < 0 ||
        (month === 0 && this.today.getDate() < existDobAge.getDate())
      ) {
        this.age--; //age is ng-model of AGE
      }
    }
  }
  /*
   * Success Handlers
   */
  getAllProviderAdminDetailsSuccessHandler(response: any) {
    console.log('All provider details', response);
    this.allProviderAdmin = response.data;
  }
  getEduQualificationSuccessHandler(response: any) {
    console.log('Admin qualification', response);
    this.eduQualification = response.data;
  }
  showAllMaritalSuccessHandler(response: any) {
    console.log('Marital status', response);
    this.maritalStatus = response.data;
  }
  /*
   * Check Uniqueness in Aadhar
   */
  checkAadhar() {
    this.isExistAadhar = false;
    this.errorMessageForAadhar = '';
    if (this.aadharNumber !== undefined && this.aadharNumber !== null) {
      if (this.aadharNumber.length === 12) {
        this.superadminService.validateAadhar(this.aadharNumber).subscribe(
          (response: any) => {
            this.checkAadharSuccessHandler(response);
          },
          (err) => {
            console.log('Error', err);
          },
        );
      }
    }
  }
  checkAadharSuccessHandler(response: any) {
    if (response.response === 'true') {
      this.isExistAadhar = true;
      this.errorMessageForAadhar = 'Aadhar number already exists';
    } else {
      this.isExistAadhar = false;
      this.errorMessageForAadhar = '';
    }
  }
  /*
   * Check Uniqueness in Pan
   */
  checkPan() {
    this.isExistPan = false;
    this.errorMessageForPan = '';
    if (this.panNumber !== undefined && this.panNumber !== null) {
      if (this.panNumber.length === 10) {
        this.superadminService.validatePan(this.panNumber).subscribe(
          (response) => {
            console.log('pan response', response);
            this.checkPanSuccessHandler(response);
          },
          (err) => {},
        );
      }
    }
  }
  checkPanSuccessHandler(response: any) {
    if (response.response === 'true') {
      this.isExistPan = true;
      this.errorMessageForPan = 'Pan number already exists';
    } else {
      this.isExistPan = false;
      this.errorMessageForPan = '';
    }
  }
  preventTyping(e: any) {
    if (e.keyCode === 9) {
      return true;
    } else {
      return false;
    }
  }

  update() {
    const update_tempObj = {
      titleID: this.titleID,
      firstName: this.admin_firstName,
      middleName: this.admin_middleName,
      lastName: this.admin_lastName,
      genderID: this.gender,
      dOB: this.dob,
      //  'age': this.age,
      contactNo: this.primaryMobileNumber,
      emailID: this.primaryEmail,
      maritalStatusID: this.marital_status,
      aadhaarNo: this.aadharNumber === '' ? null : this.aadharNumber,
      pAN: this.panNumber === '' ? null : this.panNumber,
      qualificationID: this.edu_qualification,
      emergencyContactPerson: this.emergency_cnt_person,
      emergencyContactNo: this.emergencyMobileNumber,
      remarks:
        this.admin_remarks !== undefined && this.admin_remarks !== null
          ? this.admin_remarks.trim()
          : null,
      userID: this.data.userID,
      modifiedBy: this.data.createdBy,
    };
    this.superadminService
      .updateProviderAdmin(update_tempObj)
      .subscribe((response) => {
        console.log('Data to be update', response);
        this.dialogRef.close('success');
      });
  }
}
