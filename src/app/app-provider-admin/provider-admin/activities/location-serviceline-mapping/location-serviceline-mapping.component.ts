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
import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { NgForm } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
// import { ConfirmationDialogsService } from '../services/dialog/confirmation.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { LocationServicelineMapping } from '../services/location-serviceline-mapping.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
declare let jQuery: any;
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-location-serviceline-mapping',
  templateUrl: './location-serviceline-mapping.component.html',
  styleUrls: ['./location-serviceline-mapping.component.css'],
})
export class LocationServicelineMappingComponent
  implements OnInit, AfterViewInit
{
  [x: string]: any;
  // dataSource = new MatTableDataSource<any>();
  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  filteredworkLocations = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.filteredworkLocations.paginator = this.paginator;
  }
  userID: any;
  displayedColumns: string[] = [
    'activePage',
    'locationName',
    'serviceName',
    'address',
    'stateName',
    'districtName',
    'edit',
    'action',
  ];
  // ngModels
  state: any;
  district: any;
  office_address1: any;
  office_address2: any;
  OfficeID: any;

  providerServiceMapIDs: any = [];

  serviceProviderID: any;
  providerServiceMapID: any;

  PSMID_searchService: any;
  service_ID: any;

  search_state: any;
  search_serviceline: any;
  service_id: any;

  // arrays
  states: any;
  districts: any;
  servicelines: any;

  workLocations: any;

  providerServiceMapID_request_array: any;
  dummyIndexArray: any;
  officeArray: any = [];
  // flags
  showTable = false;
  showForm: boolean;
  nationalFlag: any;
  disableSelection = false;

  @ViewChild('f')
  form!: NgForm;
  constructor(
    public provider_admin_location_serviceline_mapping: LocationServicelineMapping,
    public commonDataService: dataService,
    public dialog: MatDialog,
    private alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.userID = this.sessionstorage.getItem('uid');
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID'); //pass this value dynamically
    this.states = [];
    this.districts = [];
    this.servicelines = [];
    this.workLocations = [];
    this.filteredworkLocations.data = [];
    console.log('service provider id', this.commonDataService);
    console.log('USER ID IS', this.userID);
    this.showForm = false;
  }

  ngOnInit() {
    // this.provider_admin_location_serviceline_mapping.getStates(this.serviceProviderID)
    //   .subscribe(response => this.states = this.successhandeler(response));

    this.provider_admin_location_serviceline_mapping
      .getServiceLinesNew(this.userID)
      .subscribe(
        (response) => this.servicesSuccesshandeler(response),
        (err) => {
          console.log('ERROR WHILE FETCHING SERVICES', err);
          // this.alertService.alert(err, 'error');
        },
      );

    // this.getAllWorkLocations();
  }

  ngAfterViewInit() {
    this.filteredworkLocations.paginator = this.paginator;
  }
  last_searchServiceobj: any;
  saveSearchServicelineObj(obj: any) {
    this.last_searchServiceobj = obj;
  }

  changeTableFlag(flag_val: boolean) {
    if (flag_val === true) {
      // let confirmation = confirm("Do you really want to cancel and go back to main screen?");
      // if (confirmation) {
      // this.showTable = flag_val;
      this.showForm = !flag_val;
      this.showTable = flag_val;
      this.disableSelection = false;
      // this.resetFields();
      this.findLocations(
        this.search_state.stateID,
        this.search_serviceline.serviceID,
      );
      //  }
    } else {
      // this.showTable = !flag_val;
      this.disableSelection = true;
      this.showTable = flag_val;
      this.showForm = !flag_val;
      this.service_id = this.search_serviceline.serviceID;
      this.state = this.search_state;
      if (!this.nationalFlag) {
        this.getDistricts(this.serviceProviderID, this.search_state.stateID);
      }
      this.providerServiceMapIDs = [];
      if (
        this.PSMID_searchService !== null &&
        this.PSMID_searchService !== undefined &&
        this.PSMID_searchService !== ''
      ) {
        this.providerServiceMapIDs.push(this.PSMID_searchService);
      }
    }
  }
  back(flag_val: boolean) {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.form.resetForm();
          this.changeTableFlag(flag_val);
        }
      });
  }

  // resetFields() {
  //   // ngmodels
  //   this.state = "";
  //   this.district = "";
  //   this.office_address1 = "";
  //   this.office_address2 = "";
  //   this.OfficeID = "";
  //   this.providerServiceMapIDs = "";

  //   this.search_state="";
  //   this.search_serviceline="";
  // }

  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.provider_admin_location_serviceline_mapping
      .getStatesNew(obj)
      .subscribe(
        (response: any) => this.getStatesSuccessHandeler(response.data, value),
        (err) => {
          console.log('error in fetching states');
          // this.alertService.alert(err, 'error');
        },
      );
  }
  getStatesSuccessHandeler(response: any, value: any) {
    this.search_state = '';
    this.states = response;
    this.workLocations = [];
    this.filteredworkLocations.data = [];
    this.filteredworkLocations.paginator = this.paginator;
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setPSMID(response[0].providerServiceMapID);
      this.findLocations(undefined, this.search_serviceline.serviceID);
    } else {
      this.nationalFlag = value.isNational;
      //  this.showTable = false;
    }
  }
  setPSMID(psmID: any) {
    this.PSMID_searchService = psmID;
    console.log('PSM ID SET HO GAYI HAI BHAAAI', this.PSMID_searchService);
  }

  // setIsNational(value) {
  //   this.isNational = value;
  //   if (value) {
  //     this.state = '';
  //     this.district = '';
  //   }
  // }

  setSL(serviceID: any) {
    this.service_ID = serviceID;
  }

  getDistricts(serviceProviderID: any, stateID: any) {
    this.provider_admin_location_serviceline_mapping
      .getDistricts(serviceProviderID, stateID)
      .subscribe(
        (response: any) => this.getDistrictsSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }

  getServiceLines(serviceProviderID: any, stateID: any) {
    this.provider_admin_location_serviceline_mapping
      .getServiceLines(serviceProviderID, stateID)
      .subscribe(
        (response: any) => this.servicesSuccesshandeler(response),
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }
  getServiceLinesfromSearch(serviceProviderID: any, stateID: any) {
    this.search_serviceline = '';
    this.getServiceLines(serviceProviderID, stateID);
    this.findLocations(
      this.search_state.stateID,
      this.search_serviceline.serviceID,
    );
  }

  //  CRUD functionalities

  findLocations(stateID: any, serviceID: any) {
    const reqOBJ = {
      serviceProviderID: this.serviceProviderID,
      stateID: stateID,
      serviceID: serviceID,
      isNational: this.nationalFlag,
    };

    this.provider_admin_location_serviceline_mapping
      .getWorkLocations(reqOBJ)
      .subscribe(
        (response) => {
          this.showTable = true;
          this.findLocationsSuccesshandeler(response);
        },
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }

  saveOfficeAddress(requestObject: any) {
    // console.log(requestObject);
    const OBJ = {
      serviceProviderID: this.serviceProviderID,
      stateID: this.state,
      serviceID: this.providerServiceMapIDs,
      // "providerServiceMapID": this.providerServiceMapID,
      districtID: this.district,
      locationName:
        this.OfficeID !== undefined && this.OfficeID !== null
          ? this.OfficeID.trim()
          : null,
      address:
        (this.office_address1 !== undefined && this.office_address1 !== null
          ? this.office_address1.trim()
          : this.office_address1) +
        ',' +
        (this.office_address2 !== undefined && this.office_address2 !== null
          ? this.office_address2.trim()
          : this.office_address2),
      createdBy: this.commonDataService.uname,
    };

    // for (let i = 0; i < this.serviceLine.length;i++)
    // {
    //   this.providerServiceMapID_request_array.push(this.serviceLine.)
    // }

    const newreqobj = {
      serviceProviderID: this.serviceProviderID,
      stateID: this.state,
      // "serviceID": "6",
      providerServiceMapID: this.providerServiceMapIDs,
      districtID: this.district,
      locationName:
        this.OfficeID !== undefined && this.OfficeID !== null
          ? this.OfficeID.trim()
          : null,
      address:
        (this.office_address1 !== undefined && this.office_address1 !== null
          ? this.office_address1.trim()
          : this.office_address1) +
        ',' +
        (this.office_address2 !== undefined && this.office_address2 !== null
          ? this.office_address2.trim()
          : this.office_address2),
      createdBy: this.commonDataService.uname,
    };
    let count = 0;
    if (newreqobj.stateID === '') {
      for (let a = 0; a < this.workLocations.length; a++) {
        if (
          this.workLocations[a].locationName === newreqobj.locationName &&
          this.workLocations[a].address === newreqobj.address &&
          this.workLocations[a].providerServiceMapID ===
            newreqobj.providerServiceMapID[0]
        ) {
          count = count + 1;
        }
      }
    } else {
      for (let a = 0; a < this.workLocations.length; a++) {
        if (
          this.workLocations[a].locationName === newreqobj.locationName &&
          this.workLocations[a].districtID === parseInt(newreqobj.districtID) &&
          this.workLocations[a].address === newreqobj.address &&
          this.workLocations[a].providerServiceMapID ===
            newreqobj.providerServiceMapID[0]
        ) {
          count = count + 1;
        }
      }
    }

    console.log(OBJ, 'requestOBJ');
    console.log(newreqobj, 'new requestOBJ');
    if (count === 0) {
      this.provider_admin_location_serviceline_mapping
        .addWorkLocation(newreqobj)
        .subscribe(
          (response) => this.saveOfficeSuccessHandeler(response),
          (err) => {
            console.log('error', err);
            //this.alertService.alert(err, 'error')
          },
        );
    } else {
      this.alertService.alert('Already exists');
    }
  }

  editOfficeAddress(toBeEditedOBJ: any) {
    const OBJ = {
      toBeEditedOBJ: toBeEditedOBJ,
      offices: this.workLocations,
    };
    const dialog_Ref = this.dialog.open(EditLocationModalComponent, {
      width: '500px',
      data: OBJ,
    });

    dialog_Ref.afterClosed().subscribe((result) => {
      console.log(`Dialog result: ${result}`);
      if (result === 'success') {
        this.findLocations(
          this.search_state.stateID,
          this.search_serviceline.serviceID,
        );
      }
    });
  }
  confirmMessage: any;
  activeDeactivate(id: any, flag: any) {
    const obj = {
      pSAddMapID: id,
      deleted: flag,
    };
    console.log(obj);

    if (flag) {
      this.confirmMessage = 'Deactivate';
    } else {
      this.confirmMessage = 'Activate';
    }
    // let confirmation = confirm("do you really want to delete the location with psaddmapid:" + id + "??");
    this.alertService
      .confirm('confirm', 'Are you sure want to ' + this.confirmMessage + '?')
      .subscribe(
        (res) => {
          if (res) {
            console.log(id);

            this.provider_admin_location_serviceline_mapping
              .deleteWorkLocation(obj)
              .subscribe(
                (response) => this.deleteOfficeSuccessHandeler(response),
                (err) => {
                  console.log('error', err);
                  //this.alertService.alert(err, 'error')
                },
              );
          }
        },
        (err) => {
          console.log(err);
        },
      );
  }

  // handeler functions

  successhandeler(response: any) {
    console.log(response, 'successful response');
    return response;
  }

  findLocationsSuccesshandeler(response: any) {
    console.log(response, 'get locations success');

    this.workLocations = response.data;
    this.filteredworkLocations.data = response.data;
    this.filteredworkLocations.paginator = this.paginator;
    // this.showTable = true;
  }

  getDistrictsSuccessHandeler(response: any) {
    console.log(response, 'districts');
    this.districts = response.data;
  }

  servicesSuccesshandeler(response: any) {
    console.log(response, 'services');
    this.servicelines = response.data;
    // if (response.length > 0) {
    //   this.providerServiceMapID = response[0].providerServiceMapID;
    // }
  }

  saveOfficeSuccessHandeler(response: any) {
    // alert("location successfully created");
    this.alertService.alert('Saved successfully', 'success');
    console.log('saved', response.data);
    // this.showTable = false;
    this.showForm = false;
    this.disableSelection = false;
    //  this.resetFields();

    // this.search_serviceline=this.service_ID; we can use this also if we want to find for specific

    // jQuery('#locationForm').trigger('reset');
    this.form.resetForm();
    this.findLocations(
      this.search_state.stateID,
      this.search_serviceline.serviceID,
    );
  }

  deleteOfficeSuccessHandeler(response: any) {
    this.alertService.alert(this.confirmMessage + 'd successfully', 'success');
    console.log('deleted', response);
    this.findLocations(
      this.search_state.stateID,
      this.search_serviceline.serviceID,
    );
  }
  clear() {
    jQuery('#searchForm').trigger('reset');
    // this.search_serviceline = "";
    // this.search_state = "";
    this.showTable = false;
    this.workLocations = [];
    this.filteredworkLocations.data = [];
    this.servicelines = [];
    this.PSMID_searchService = '';
  }

  servicelineSelected(array: any) {
    let req_array = [];
    if (array.constructor !== Array) {
      req_array.push(array);
    } else {
      req_array = array;
    }
    this.OfficeID = '';
    this.officeNameExist = false;
    this.provider_admin_location_serviceline_mapping
      .getWorklocationOnProviderArray(req_array)
      .subscribe(
        (response) => this.currentServicesSuccess(response),
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }

  setPSMID_onStateSeletion(psmID: any) {
    this.providerServiceMapIDs = [psmID];
    const reqArray = [psmID];
    this.OfficeID = '';
    this.officeNameExist = false;
    this.provider_admin_location_serviceline_mapping
      .getWorklocationOnProviderArray(reqArray)
      .subscribe(
        (response) => this.currentServicesSuccess(response.data),
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }

  currentServicesSuccess(res: any) {
    this.officeArray = res;
    console.log('officearray', this.officeArray);
  }
  officeNameExist = false;
  msg: any;

  checkOfficeName(value: any) {
    for (let i = 0; i < this.officeArray.length; i++) {
      const a = this.workLocations[i].locationName;
      console.log(value.trim(), 'EDsdd');
      if (
        a !== undefined &&
        a !== null &&
        value !== undefined &&
        value !== null &&
        a.trim().toLowerCase() === value.trim().toLowerCase()
      ) {
        this.officeNameExist = true;
        this.msg = 'Office name exists';
        break;
      } else {
        this.officeNameExist = false;
        this.msg = '';
      }
    }

    if (value !== undefined && value !== null && value.trim().length === 0) {
      this.officeNameExist = true;
    }
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      // this.dataSource = this.workLocations;
      this.filteredworkLocations.data = this.workLocations;
      this.filteredworkLocations.paginator = this.paginator;
    } else {
      this.filteredworkLocations.data = [];
      this.filteredworkLocations.paginator = this.paginator;
      this.workLocations.forEach((item: any) => {
        for (const key in item) {
          if (key === 'locationName' || key === 'districtName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.filteredworkLocations.data.push(item);
              this.filteredworkLocations.paginator = this.paginator;
              break;
            }
          }
        }
      });
    }
  }
}

@Component({
  selector: 'app-editlocationmodalwindow-component',
  templateUrl: './editLocationModal.html',
})
export class EditLocationModalComponent implements OnInit {
  // modal windows ngmodels
  serviceProviderName: any;
  stateName: any;
  districtName: any;
  address: any;
  officeID: any;

  originalOfficeID: any;
  officeNameExist = false;
  msg: any = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialog: MatDialog,
    public provider_admin_location_serviceline_mapping: LocationServicelineMapping,
    public dialog_Ref: MatDialogRef<EditLocationModalComponent>,
    private alertService: ConfirmationDialogsService,
  ) {}

  ngOnInit() {
    console.log(this.data, 'modal content');

    this.serviceProviderName = this.data.toBeEditedOBJ.serviceProviderName;
    this.stateName =
      this.data.toBeEditedOBJ.stateName === undefined
        ? 'All states'
        : this.data.toBeEditedOBJ.stateName;
    this.districtName = this.data.toBeEditedOBJ.districtName;
    this.address = this.data.toBeEditedOBJ.address;
    this.officeID = this.data.toBeEditedOBJ.locationName;

    this.originalOfficeID = this.data.toBeEditedOBJ.locationName;
  }

  checkOfficeName(value: any) {
    for (let i = 0; i < this.data.offices.length; i++) {
      const a = this.data.offices[i].locationName;

      if (
        a !== undefined &&
        a !== null &&
        value !== undefined &&
        value !== null &&
        this.originalOfficeID !== undefined &&
        this.originalOfficeID !== null &&
        a.trim().toLowerCase() === value.trim().toLowerCase() &&
        this.originalOfficeID.trim().toLowerCase() !== a.trim().toLowerCase()
      ) {
        this.officeNameExist = true;
        this.msg = 'OfficeName exist for ' + this.data.offices[i].serviceName;
        break;
      } else {
        this.officeNameExist = false;
      }
    }

    if (value !== undefined && value !== null && value.trim().length === 0) {
      this.officeNameExist = true;
    }
  }

  update() {
    const editedObj = {
      pSAddMapID: this.data.toBeEditedOBJ.pSAddMapID,
      providerServiceMapID: this.data.toBeEditedOBJ.providerServiceMapID,
      locationName:
        this.officeID !== undefined && this.officeID !== null
          ? this.officeID.trim()
          : null,
      address:
        this.address !== undefined && this.address !== null
          ? this.address.trim()
          : null,
      districtID: this.data.toBeEditedOBJ.districtID,
      createdBy: this.data.toBeEditedOBJ.CreatedBy,
    };

    console.log(editedObj, 'edit rwq obj in modal');

    this.provider_admin_location_serviceline_mapping
      .editWorkLocation(editedObj)
      .subscribe(
        (response) => this.editOfficeSuccessHandeler(response),
        (err) => {
          console.log('error', err);
          //this.alertService.alert(err, 'error')
        },
      );
  }

  editOfficeSuccessHandeler(response: any) {
    this.alertService.alert('Updated successfully', 'success');
    console.log('edited', response);
    this.dialog_Ref.close('success');
  }
}
