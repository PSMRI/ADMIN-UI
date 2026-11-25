import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { InstituteDirectoryMasterService } from '../services/institute-directory-master-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

@Component({
  selector: 'app-serviceline-cdss-mapping',
  templateUrl: './servicelineCdssMapping.component.html',
  styleUrls: ['./servicelineCdssMapping.component.css'],
})
export class ServicelineCdssMappingComponent implements OnInit {
  services: any = [];
  states: any = [];
  userID: any;
  state: any;
  stateID: any;
  serviceCdss: any;
  service: any;
  serviceID: any;
  nationalFlag: any;
  providerServiceMapID: any;
  isCdssForm = false;
  showActivateFlag = false;
  showDeactivateFalg = false;
  createdBy: any;
  cdssServices: any;

  constructor(
    public instituteDirectoryService: InstituteDirectoryMasterService,
    public commonDataService: dataService,
    public dialogService: ConfirmationDialogsService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.userID = this.commonDataService.uid;
    this.createdBy = this.commonDataService.uname;
    // this.providerServiceMapID = this.commonDataService.provider_serviceMapID;
    //	this.instituteDirectoryService.getStates(this.serviceProviderID).subscribe(response=>this.getStatesSuccessHandeler(response)); // commented on 10/4/18(1097 regarding changes) Gursimran
    this.instituteDirectoryService
      .getServiceLinesNewCdss(this.userID)
      .subscribe((response: any) => {
        this.successhandeler(response),
          (err: any) => {
            console.log('ERROR in fetching serviceline', err);
            //this.alertService.alert(err, 'error');
          };
      });
  }

  successhandeler(res: any) {
    this.services = res.data.filter(function (item: any) {
      console.log('item', item);
      if (item.serviceID === 9 || item.serviceID === 2 || item.serviceID === 12)
        return item;
    });
  }
  getStates(value: any) {
    const obj = {
      userID: this.userID,
      serviceID: value.serviceID,
      isNational: value.isNational,
    };
    this.instituteDirectoryService.getStatesNew(obj).subscribe(
      (response: any) => this.getStatesSuccessHandeler(response, value),
      (err) => {
        console.log('error in fetching states', err);
      },
    );
  }

  getStatesSuccessHandeler(response: any, value: any) {
    this.states = response.data;
    if (value.isNational) {
      this.nationalFlag = value.isNational;
      this.setProviderServiceMapID(response.data[0].providerServiceMapID);
      this.stateID = value.stateID;
    } else {
      this.nationalFlag = value.isNational;
    }
  }
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.fetchCdssDetails();
    // this.showActivateFlag = true;
  }

  activateDeactivateCdss() {
    this.isCdssForm = true;
    const reqObj = {
      psmId: this.providerServiceMapID,
      serviceId: this.service.serviceID,
      stateId: this.state.stateID,
      isCdss: this.isCdssForm,
      createdBy: this.createdBy,
    };
    this.instituteDirectoryService.saveCdssMapping(reqObj).subscribe(
      (response: any) => this.saveSuccessHandeler(response),
      (err) => {
        console.log('error in fetching states', err);
        //this.alertService.alert(err, 'error');
      },
    );
    this.resetForm();
  }

  DeactivateCdss() {
    this.showDeactivateFalg = true;
    this.isCdssForm = false;
    const reqObj = {
      psmId: this.providerServiceMapID,
      serviceId: this.service.serviceID,
      stateId: this.state.stateID,
      isCdss: this.isCdssForm,
      createdBy: this.createdBy,
    };
    this.instituteDirectoryService.saveCdssMapping(reqObj).subscribe(
      (response: any) => this.saveDeactivateCdss(response),
      (err) => {
        console.log('error in fetching states', err);
        //this.alertService.alert(err, 'error');
      },
    );
    this.resetForm();
  }
  saveSuccessHandeler(response: any) {
    console.log('response', response);
    if (response) {
      this.dialogService.alert('Activated successfully', 'success');
    }
  }
  saveDeactivateCdss(response: any) {
    console.log('response', response);
    if (response) {
      this.dialogService.alert('Deativated successfully', 'success');
    }
  }

  resetForm() {
    this.service = '';
    this.state = '';
    this.showActivateFlag = false;
    this.showDeactivateFalg = false;
  }
  fetchCdssDetails() {
    const reqobj = this.providerServiceMapID;
    this.instituteDirectoryService.getCdssDetails(reqobj).subscribe(
      (response: any) => this.getCdssSuccessHandeler(response.data),
      (err) => {
        console.log('error in fetching cdss Details', err);
        //this.alertService.alert(err, 'error');
      },
    );
  }
  getCdssSuccessHandeler(value: any) {
    if (
      value.isCdss !== null &&
      value.isCdss !== undefined &&
      value.isCdss === true
    ) {
      this.showActivateFlag = false;
      this.showDeactivateFalg = true;
    } else {
      this.showActivateFlag = true;
      this.showDeactivateFalg = false;
    }
  }
}
