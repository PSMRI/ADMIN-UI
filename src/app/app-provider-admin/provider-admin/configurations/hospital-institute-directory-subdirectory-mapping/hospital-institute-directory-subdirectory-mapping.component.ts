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
import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { HospitalInstituteMappingService } from '../../activities/services/hospital-institute-mapping-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-hospital-institute-directory-subdirectory-mapping',
  templateUrl:
    './hospital-institute-directory-subdirectory-mapping.component.html',
  styleUrls: [
    './hospital-institute-directory-subdirectory-mapping.component.css',
  ],
})
export class HospitalInstituteDirectorySubdirectoryMappingComponent
  implements OnInit
{
  /*ngModels*/
  userID: any;
  serviceProviderID: any;
  providerServiceMapID: any;

  state: any;
  service: any;
  district: any;
  taluk: any;
  hospital: any;
  institute_directory: any;
  institute_subdirectory: any;

  /*arrays*/
  states: any = [];
  services: any = [];
  districts: any = [];
  taluks: any = [];
  hospitals: any = [];
  institute_directories: any = [];
  institute_subdirectories: any = [];

  searchResultArray: any = [];

  /*flags*/
  showTableFlag = false;
  showFormFlag = false;
  disableSelection = false;

  displayedColumns = ['sno', 'institutionName', 'action'];

  displayAddedColumns = ['sno', 'institutionName', 'action'];

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredsearchResultArray = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredsearchResultArray.paginator = this.paginator;
  }
  bufferArray = new MatTableDataSource<any>();

  @ViewChild('hospitalForm') hospitalForm!: NgForm;
  @ViewChild('hospitalForm2') hospitalForm2!: NgForm;
  constructor(
    public hospitalInstituteMappingService: HospitalInstituteMappingService,
    public commonDataService: dataService,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.getServices(this.userID);
  }

  getServices(userID: any) {
    this.state = '';
    this.district = '';
    this.taluk = '';
    (this.institute_directory = ''), (this.institute_subdirectory = '');

    this.institute_directories = [];
    this.institute_subdirectories = [];
    this.taluks = [];

    this.hospitalInstituteMappingService.getServices(userID).subscribe(
      (response: any) => this.getServiceSuccessHandeler(response),
      (err) => {
        console.log('error while fetching service', err);
      },
    );
  }

  getServiceSuccessHandeler(response: any) {
    if (response) {
      this.services = response.data.filter(function (item: any) {
        console.log('item', item);
        if (
          item.serviceID === 1 ||
          item.serviceID === 3 ||
          item.serviceID === 6
        )
          return item;
      });
    }
  }
  getStates(serviceID: any, isNational: any) {
    this.hospitalInstituteMappingService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response),
        (err) => {
          console.log('error', err);
        },
      );
  }
  getStatesSuccessHandeler(response: any) {
    this.hospitalForm.controls['state'].reset();
    this.hospitalForm2.resetForm();
    this.districts = [];
    this.taluks = [];
    this.institute_directories = [];
    this.institute_subdirectories = [];
    this.searchResultArray = [];
    if (response) {
      this.states = response.data;
    }
  }

  showForm() {
    this.showTableFlag = false;
    this.showFormFlag = true;
    this.disableSelection = true;
  }

  back() {
    this.showTableFlag = true;
    this.showFormFlag = false;
    /*reset the input fields of the form*/
    this.hospital = '';
    this.bufferArray.data = [];

    this.disableSelection = false;
  }

  clear() {
    /*resetting the search fields*/
    this.state = '';
    this.service = '';
    this.providerServiceMapID = '';
    this.district = '';
    this.taluk = '';
    this.hospital = '';
    this.institute_directory = '';
    this.institute_subdirectory = '';

    this.states = [];
    this.districts = [];
    this.taluks = [];
    this.hospitals = [];
    this.institute_directories = [];
    this.institute_subdirectories = [];

    /*resetting the flag*/
    this.showTableFlag = false;
    /*resetting the search result array*/
    this.searchResultArray = [];
    this.filteredsearchResultArray.data = [];
  }

  getDistrict(stateID: any) {
    this.hospitalForm2.resetForm();
    this.taluks = [];
    this.institute_directories = [];
    this.institute_subdirectories = [];
    this.searchResultArray = [];
    this.hospitalInstituteMappingService.getDistricts(stateID).subscribe(
      (response: any) => this.getDistrictSuccessHandeler(response),
      (err) => {
        console.log('error', err);
      },
    );
  }

  getDistrictSuccessHandeler(response: any) {
    console.log(response, 'Districts');
    if (response) {
      this.districts = response.data;
    }
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    this.providerServiceMapID = providerServiceMapID;
    this.getInstituteDirectory();
  }

  getTaluk(districtID: any) {
    this.hospitalForm2.controls['taluk'].reset();
    this.hospitalForm2.controls['institute_directory'].reset();
    this.hospitalForm2.controls['institute_subdirectory'].reset();
    this.taluks = [];
    this.institute_subdirectories = [];
    this.searchResultArray = [];

    this.hospitalInstituteMappingService.getTaluks(districtID).subscribe(
      (response: any) => this.getTalukSuccessHandeler(response),
      (err) => {
        console.log('error', err);
      },
    );
  }

  getTalukSuccessHandeler(response: any) {
    console.log(response, 'Taluk');
    if (response) {
      this.taluks = response.data;
    }
  }

  getInstitutions() {
    this.institute_subdirectories = [];
    this.searchResultArray = [];

    const request_obj = {
      providerServiceMapID: this.providerServiceMapID,
      stateID: this.state,
      districtID: this.district,
      blockID: this.taluk,
    };

    console.log('request obj to get', request_obj);
    this.hospitalInstituteMappingService.getInstitutions(request_obj).subscribe(
      (response: any) => this.getInstitutionSuccessHandeler(response),
      (err) => {
        console.log('error', err);
      },
    );
    this.hospitalForm2.controls['institute_directory'].reset();
    this.hospitalForm2.controls['institute_subdirectory'].reset();
  }

  getInstitutionSuccessHandeler(response: any) {
    console.log(response, 'GET HOSPITAL LIST');
    if (response) {
      this.hospitals = response.data;
    }
  }

  getInstituteDirectory() {
    this.hospitalInstituteMappingService
      .getInstituteDirectory(this.providerServiceMapID)
      .subscribe(
        (response: any) => this.getInstituteDirectorySuccessHandeler(response),
        (err) => {
          console.log('error', err);
        },
      );
  }

  getInstituteDirectorySuccessHandeler(response: any) {
    this.institute_directory = '';
    if (response) {
      console.log('institute directory', response);
      this.institute_directories = response.data.filter(function (item: any) {
        if (item.deleted === false) {
          return item;
        }
      });
    }
  }

  getInstituteSubdirectory(institute_directory: any) {
    this.searchResultArray = [];
    const data = {
      instituteDirectoryID: institute_directory,
      providerServiceMapId: this.providerServiceMapID,
    };

    this.hospitalInstituteMappingService
      .getInstituteSubDirectory(data)
      .subscribe(
        (response: any) =>
          this.getInstituteSubDirectorySuccessHandeler(response),
        (err) => {
          console.log('error', err);
        },
      );
  }

  getInstituteSubDirectorySuccessHandeler(response: any) {
    this.hospitalForm2.controls['institute_subdirectory'].reset();
    if (response) {
      console.log('INSTITUTE SUB DIRECTORY', response);
      this.institute_subdirectories = response.data.filter(function (
        item: any,
      ) {
        if (item.deleted === false) {
          return item;
        }
      });
    }
  }

  getMappingHistory() {
    this.searchResultArray = [];
    const reqObj = {
      instituteDirectoryID: this.institute_directory,
      instituteSubDirectoryID: this.institute_subdirectory,
      blockID: this.taluk,
      stateID: this.state,
      districtID: this.district,
    };

    if (
      reqObj.blockID === undefined ||
      reqObj.blockID === null ||
      reqObj.blockID === ''
    ) {
      this.alertService.alert('Please select taluk as well');
    } else {
      console.log('GET REQ OBJ FOR GETTING MAPPINGS', reqObj);
      this.hospitalInstituteMappingService.getMappingList(reqObj).subscribe(
        (response: any) => this.mappingHistorySuccessHandeler(response),
        (err) => {
          console.log('error', err);
        },
      );
    }
  }

  mappingHistorySuccessHandeler(response: any) {
    console.log('HISTORY OF MAPPING', response);
    this.showTableFlag = true;
    this.searchResultArray = response.data;
    this.filteredsearchResultArray.data = response.data;
  }

  add_obj(hospital: any) {
    const obj = {
      institutionID: hospital,
      hospital_name: this.hospital_name,
      instituteDirectoryID: this.institute_directory,
      instituteSubDirectoryID: this.institute_subdirectory,
      providerServiceMapID: this.providerServiceMapID,
      createdBy: this.commonDataService.uname,
    };

    if (
      this.bufferArray.data.length === 0 &&
      obj.institutionID !== '' &&
      obj.institutionID !== undefined
    ) {
      const is_unique = this.preventDuplicateMapping(obj.institutionID);

      if (is_unique) {
        this.bufferArray.data.push(obj);
      } else {
        this.hospital = '';
      }
    } else {
      const is_unique = this.preventDuplicateMapping(obj.institutionID);
      if (is_unique) {
        let count = 0;
        for (let i = 0; i < this.bufferArray.data.length; i++) {
          if (obj.institutionID === this.bufferArray.data[i].institutionID) {
            count = count + 1;
          }
        }
        if (
          count === 0 &&
          obj.institutionID !== '' &&
          obj.institutionID !== undefined
        ) {
          this.bufferArray.data.push(obj);
        } else {
          this.alertService.alert('Already exists');
        }
      } else {
        this.alertService.alert('Mapping for this hospital already exists');
        this.hospital = '';
      }
    }
    /*resetting fields after entering in buffer array/or if duplicate exist*/
    this.hospital = '';
  }

  preventDuplicateMapping(hospital_id: any) {
    if (this.searchResultArray.length === 0) {
      return true;
    } else {
      let count = 0;
      for (let i = 0; i < this.searchResultArray.length; i++) {
        if (
          this.searchResultArray[i].institute.institutionID ===
          parseInt(hospital_id)
        ) {
          count = count + 1;
        }
      }
      if (count > 0) {
        this.alertService.alert('Already exists');
        return false;
      } else {
        return true;
      }
    }
  }

  removeObj(index: any) {
    this.bufferArray.data.splice(index, 1);
  }

  hospital_name: any;
  setHospitalName(hospital_name: any) {
    this.hospital_name = hospital_name;
  }

  save() {
    console.log('buffer array', this.bufferArray);
    this.hospitalInstituteMappingService
      .createMapping(this.bufferArray.data)
      .subscribe(
        (response: any) => this.saveSuccessHandeler(response),
        (err) => {
          console.log('error', err);
        },
      );
  }

  saveSuccessHandeler(response: any) {
    console.log('response', response);
    if (response) {
      this.alertService.alert('Mapping saved successfully', 'success');
      this.back();
      this.getMappingHistory();
    }
  }

  toggle_activate(instituteDirMapID: any, isDeleted: any, directory: any) {
    if (directory) {
      this.alertService.alert('Institute is inactive');
    } else {
      if (isDeleted === true) {
        this.alertService
          .confirm('Confirm', 'Are you sure you want to Deactivate?')
          .subscribe((response: any) => {
            if (response) {
              const obj = {
                instituteDirMapID: instituteDirMapID,
                deleted: isDeleted,
              };

              this.hospitalInstituteMappingService
                .toggleMappingStatus(obj)
                .subscribe(
                  (response: any) =>
                    this.toggleMappingStatusSuccessHandeler(
                      response,
                      'Deactivated',
                    ),
                  (err) => {
                    console.log('error', err);
                  },
                );
            }
          });
      }

      if (isDeleted === false) {
        this.alertService
          .confirm('Confirm', 'Are you sure you want to Activate?')
          .subscribe((response: any) => {
            if (response) {
              const obj = {
                instituteDirMapID: instituteDirMapID,
                deleted: isDeleted,
              };

              this.hospitalInstituteMappingService
                .toggleMappingStatus(obj)
                .subscribe(
                  (response: any) =>
                    this.toggleMappingStatusSuccessHandeler(
                      response,
                      'Activated',
                    ),
                  (err) => {
                    console.log('error', err);
                  },
                );
            }
          });
      }
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.filteredsearchResultArray.data = this.searchResultArray;
      this.filteredsearchResultArray.paginator = this.paginator;
    } else {
      this.filteredsearchResultArray.data = [];
      this.filteredsearchResultArray.paginator = this.paginator;
      this.searchResultArray.forEach((item: any) => {
        for (const key in item.institute) {
          if (key === 'institutionName') {
            const value: string = '' + item.institute[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredsearchResultArray.data.push(item);
              break;
            }
          }
        }
      });
    }
  }

  toggleMappingStatusSuccessHandeler(response: any, action: any) {
    console.log(response, 'delete Response');
    if (response) {
      this.alertService.alert(action + ' successfully', 'success');
      this.getMappingHistory();
    }
  }
}
