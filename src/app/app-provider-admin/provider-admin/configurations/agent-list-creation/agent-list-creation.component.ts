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
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { AgentListCreationService } from '../services/agent-list-creation-service.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-agent-list-creation',
  templateUrl: './agent-list-creation.component.html',
  styleUrls: ['./agent-list-creation.component.css'],
})
export class AgentListCreationComponent implements OnInit, AfterViewInit {
  // filteredagentLists: any = [];
  serviceProviderID: any;
  providerServiceMapID: any;
  radio_option: any;

  state: any;
  service: any;
  campaign_name: any;
  agent_ID: any;
  password: any;
  editMode = false;
  states: any = [];
  services: any = [];
  campaignNames: any = [];
  resultArray: any = [];
  agentLists: any = [];
  usrAgentMappingID: any;
  disableButtonFlag = true;
  userID: any;
  isNational = false;
  showFormFlag = false;
  showTableFlag = false;
  disableSelection = false;
  editable: any = false;
  displayedColumns: any = ['sNo', 'agentID', 'campaignName', 'edit'];

  @ViewChild('agentListCreationForm')
  agentListForm!: NgForm;

  paginator!: MatPaginator;
  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }
  dataSource = new MatTableDataSource<any>();

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
  }
  agentsResponse: any;

  constructor(
    public _AgentListCreationService: AgentListCreationService,
    public alertService: ConfirmationDialogsService,
    readonly sessionstorage: SessionStorageService,
  ) {
    this.serviceProviderID = this.sessionstorage.getItem('service_providerID');
  }

  ngOnInit() {
    this.radio_option = '1';
    this.userID = this.sessionstorage.getItem('uid');
    console.log('userID', this.userID);
    this.getServices(this.userID);
    this.dataSource.data = this.agentsResponse.data;
    this.dataSource.paginator = this.paginator;
  }
  ngAfterViewInit() {
    this.dataSource.data = this.agentsResponse.data;
    this.dataSource.paginator = this.paginator;
  }

  setIsNational(value: any) {
    this.isNational = value;
    if (value) {
      this.state = '';
    }
  }

  getStates(serviceID: any, isNational: any) {
    this.state = '';
    this._AgentListCreationService
      .getStates(this.userID, serviceID, isNational)
      .subscribe(
        (response) => this.getStatesSuccessHandeler(response, isNational),
        (err) => console.log('Error', err),
      );
    //this.alertService.alert(err, 'error'));
  }

  getStatesSuccessHandeler(response: any, isNational: any) {
    console.log('STATE', response);
    this.states = response.data;
    if (isNational) {
      this.setProviderServiceMapID(this.states[0].providerServiceMapID);
    }
  }

  getServices(userID: any) {
    // this.service = '';
    this._AgentListCreationService.getServices(userID).subscribe(
      (response) => this.getServicesSuccessHandeler(response),
      (err) => console.log('Error', err),
    ); //
    //this.alertService.alert(err, 'error'));
  }

  getServicesSuccessHandeler(response: any) {
    console.log('SERVICES', response.data);
    // this.services = response.data;
    this.services = response.data.filter(function (item: any) {
      console.log('item', item);
      if (
        item.serviceID === 1 ||
        item.serviceID === 3 ||
        item.serviceID === 6 ||
        item.serviceID === 10
      )
        return item;
    });
  }

  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.getAllAgents(this.providerServiceMapID);
  }

  getAllAgents(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);

    this._AgentListCreationService.getAllAgents(providerServiceMapID).subscribe(
      (agentsResponse) => this.agentsListSuccessHandler(agentsResponse),
      (err) => {
        console.log('Error', err);
      },
    );
  }
  agentsListSuccessHandler(agentsResponse: any) {
    console.log('Agents list', agentsResponse);
    this.agentLists = agentsResponse.data;
    this.dataSource.data = agentsResponse.data;
    this.dataSource.paginator = this.paginator;
    this.showTableFlag = true;
    this.showFormFlag = false;
    this.editable = false;
  }
  getCampaignNames(serviceName: any) {
    this._AgentListCreationService.getCampaignNames(serviceName).subscribe(
      (response) => this.getCampaignNamesSuccessHandeler(response),
      (err) => console.log('Error', err),
    );
    // this.alertService.alert(err, 'error'));
  }

  getCampaignNamesSuccessHandeler(response: any) {
    if (response) {
      this.campaignNames = response.data.campaign;
    }
  }

  reset() {
    this.agent_ID = '';
    this.resultArray = [];
    this.password = '';
  }

  showForm() {
    this.radio_option = '1';
    this.showFormFlag = true;
    this.showTableFlag = false;
    this.disableSelection = true;
  }
  back() {
    this.alertService
      .confirm(
        'confirm',
        'Do you really want to cancel? Any unsaved data would be lost',
      )
      .subscribe((res) => {
        if (res) {
          this.agentListForm.resetForm();
          this.campaign_name = undefined;
          this.agent_ID = '';
          this.password = '';
          this.showTableFlag = true;
          this.showFormFlag = false;
          this.editable = false;
          this.editMode = false;
        }
      });
  }
  validate_one(agentID: any) {
    this.resultArray = [];

    if (agentID !== '' || agentID !== null || agentID !== undefined) {
      // var obj=
      // {
      // 	"agentID":agentID
      // }

      const obj = {
        agentID: parseInt(agentID),
        agentPassword: this.password,
        providerServiceMapID: this.providerServiceMapID,
        cti_CampaignName: this.campaign_name,
        createdBy: this.sessionstorage.getItem('uname'),
      };
      console.log('agent obj', obj);

      this.resultArray.push(obj);
    }

    console.log('Result from 1', this.resultArray);

    if (this.resultArray.length > 0) {
      let tick = 0;
      for (let z = 0; z < this.resultArray.length; z++) {
        if (
          this.resultArray[z].agentID.toString()[0] === '2' ||
          this.resultArray[z].agentID.toString()[0] === '3' ||
          this.resultArray[z].agentID.toString()[0] === '4'
        ) {
          console.log(
            'Validate One',
            this.resultArray[z].agentID.toString()[0],
          );
          tick = tick + 1;
        }
      }

      if (tick > 0) {
        return 'GO';
      }
    }
    return 'No valid agentID found';
  }

  validate_two(agentID: any) {
    this.resultArray = [];

    const items = agentID.split(',');
    for (let i = 0; i < items.length; i++) {
      // let obj=
      // {
      // 	"agentID":parseInt(items[i])
      // }

      if (items[i].length === 0) {
        continue;
      }

      const obj = {
        agentID: parseInt(items[i]),
        agentPassword: this.password,
        providerServiceMapID: this.providerServiceMapID,
        cti_CampaignName: this.campaign_name,
        createdBy: this.sessionstorage.getItem('uname'),
      };

      if (this.resultArray.length === 0) {
        this.resultArray.push(obj);
      } else {
        let count = 0;
        for (let k = 0; k < this.resultArray.length; k++) {
          if (this.resultArray[k].agentID === obj.agentID) {
            count = count + 1;
          }
        }

        if (count === 0) {
          this.resultArray.push(obj);
        }
      }
    }
    console.log('Result from 2', this.resultArray);

    if (this.resultArray.length > 0) {
      let tick = 0;
      for (let z = 0; z < this.resultArray.length; z++) {
        if (
          this.resultArray[z].agentID.toString()[0] === '2' ||
          this.resultArray[z].agentID.toString()[0] === '3' ||
          this.resultArray[z].agentID.toString()[0] === '4'
        ) {
          console.log(this.resultArray[z].agentID.toString()[0]);
          tick = tick + 1;
        }
      }

      if (tick > 0) {
        return 'GO';
      }
    }
    return 'No valid agentID found';
  }

  validate_three(agentID: any) {
    this.resultArray = [];

    const hyphen_items = agentID.split('-');
    if (
      hyphen_items.length === 2 &&
      hyphen_items[0].length > 0 &&
      hyphen_items[1].length > 0 &&
      parseInt(hyphen_items[1]) > parseInt(hyphen_items[0])
    ) {
      const no_of_items =
        parseInt(hyphen_items[1]) - parseInt(hyphen_items[0]) + 1;
      for (let j = 0; j < no_of_items; j++) {
        // let obj=
        // {
        // 	"agentID":parseInt(hyphen_items[0])+j
        // }

        const obj = {
          agentID: parseInt(hyphen_items[0]) + j,
          agentPassword: this.password,
          providerServiceMapID: this.providerServiceMapID,
          cti_CampaignName: this.campaign_name,
          createdBy: this.sessionstorage.getItem('uname'),
        };

        if (this.resultArray.length === 0) {
          this.resultArray.push(obj);
        } else {
          let count = 0;
          for (let i = 0; i < this.resultArray.length; i++) {
            if (this.resultArray[i].agentID === obj.agentID) {
              count = count + 1;
            }
          }

          if (count === 0) {
            this.resultArray.push(obj);
          }
        }
      }
    }

    if (this.resultArray.length > 0) {
      let tick = 0;
      for (let z = 0; z < this.resultArray.length; z++) {
        if (
          this.resultArray[z].agentID.toString()[0] === '2' ||
          this.resultArray[z].agentID.toString()[0] === '3' ||
          this.resultArray[z].agentID.toString()[0] === '4'
        ) {
          console.log(this.resultArray[z].agentID.toString()[0]);
          tick = tick + 1;
        }
      }

      if (tick > 0) {
        return 'GO';
      }
    }
    return 'No valid agentID found';

    console.log('Result from 3', this.resultArray);
  }

  map(choice: any) {
    let result: any = '';
    if (choice === '1') {
      result = this.validate_one(this.agent_ID);
    }
    if (choice === '2') {
      result = this.validate_two(this.agent_ID);
    }
    if (choice === '3') {
      result = this.validate_three(this.agent_ID);
    }

    if (result === 'GO') {
      this._AgentListCreationService
        .saveAgentListMapping(this.resultArray)
        .subscribe(
          (response) => this.saveSuccessHandeler(response),
          (err) => console.log('Error', err),
        );
      // this.alertService.alert(err, 'error'));
    } else {
      this.alertService.alert('Invalid entry in agent ID', 'error');
    }
  }

  saveSuccessHandeler(response: any) {
    if (response) {
      if (response.data.length > 0) {
        this.alertService.alert('Saved successfully', 'success');
        this.agentListForm.resetForm();
        this.showFormFlag = false;
        this.getAllAgents(this.providerServiceMapID);
      }
      if (response.data.length === 0) {
        this.alertService.alert('Mapping  already exists');
      }
    }
  }

  resetFields() {
    // this.state = "";
    // this.service = "";
    // this.campaign_name = "";
    // this.agent_ID = "";
    // this.password = "";

    this.isNational = false;
    this.agentListForm.reset();

    //    this.radio_option = '1';

    this.states = [];
    this.campaignNames = [];
    this.resultArray = [];
  }

  multiagents: any = [];
  rangeagents: any = [];
  editAgentCampaign(data: any) {
    console.log('data', data);
    // this.service = data.service,
    // this.state = data.state,
    this.radio_option = '1';
    this.campaign_name = data.cti_CampaignName;
    this.editMode = true;
    // this.radio_option = data.radio_option
    this.agent_ID = data.agentID;
    this.password = data.agentPassword;
    this.editable = true;
    this.usrAgentMappingID = data.usrAgentMappingID;
  }
  updateAgent(formValue: any) {
    const updateAgentObj = {
      agentID: formValue.agent_ID,
      agentPassword: formValue.password,
      providerServiceMapID: formValue.providerServiceMapID,
      cti_CampaignName: formValue.campaign_name,
      usrAgentMappingID: this.usrAgentMappingID,
    };
    console.log('Data to be update', updateAgentObj);

    this._AgentListCreationService.editAgentDetails(updateAgentObj).subscribe(
      (response) => {
        console.log('updated obj', response);
        this.alertService.alert('Updated successfully', 'success');
        this.agentListForm.resetForm();
        // this.campaign_name = undefined;
        // this.agent_ID = '';
        // this.password = '';
        this.showTableFlag = true;
        this.showFormFlag = false;
        this.editable = false;
        this.editMode = false;
        /* resetting form and ngModels used in editing */
        this.getAllAgents(this.providerServiceMapID);
        // this.showTableFlag = true;
      },
      (err) => console.log('Error', err),
    );
    //this.alertService.alert(err, 'error'));
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.agentLists;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.agentLists.forEach((item: any) => {
        for (const key in item) {
          if (key === 'agentID' || key === 'cti_CampaignName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          }
        }
        this.dataSource.paginator = this.paginator;
      });
    }
  }
}
