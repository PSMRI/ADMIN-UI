import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, NgForm } from '@angular/forms';
import { ProjectServicelineMappingService } from '../services/project-serviceline-mapping.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-project-serviceline-mapping',
  templateUrl: './project-serviceline-mapping.component.html',
  styleUrls: ['./project-serviceline-mapping.component.css'],
})
export class ProjectServicelineMappingComponent implements OnInit {
  // state: any;
  // district: any;
  // block: any;
  // serviceline: any;
  // project: any;
  servicelines: any = [];
  states: any = [];
  districts: any = [];
  blocks: any = [];
  projectNames: any = [];
  addedFields: any = [];

  // @ViewChild('projectServcelineMappingForm')
  // projectServcelineMappingForm!: NgForm;

  projectServcelineMappingForm!: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<any>();

  displayedColumns = ['sno', 'projectName', 'block', 'deleted'];
  enableProjectField = false;
  serviceProviderId: any;
  enableUpdate = false;

  constructor(
    private projectServicelineMappingService: ProjectServicelineMappingService,
    private confirmationService: ConfirmationDialogsService,
    private projectMasterService: ProjectMasterService,
    private dataService: dataService,
    private fb: FormBuilder,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.createProjectServicelineForm();
    this.serviceProviderId = this.sessionstorage.getItem('service_providerID');
    this.getProviderServices();
    this.projectServcelineMappingForm.get('projectName')?.disable();
  }

  createProjectServicelineForm() {
    return (this.projectServcelineMappingForm = this.fb.group({
      id: null,
      serviceline: null,
      state: null,
      district: null,
      block: null,
      projectName: null,
      projectId: null,
    }));
  }
  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.addedFields;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.addedFields.forEach((item: any) => {
        for (const key in item) {
          if (key === 'projectName' || key === 'blockName') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
            this.dataSource.paginator = this.paginator;
          }
        }
      });
    }
  }
  getProviderServices() {
    const reqObj = {
      userID: this.sessionstorage.getItem('uid'),
    };
    this.projectServicelineMappingService.getServices(reqObj).subscribe(
      (res: any) => {
        if (res.data && res.statusCode === 200) {
          this.servicelines = this.filterServices(res.data);
          this.getStates();
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  filterServices(res: any) {
    const services: any = [];
    res.filter((item: any) => {
      if (item.serviceID === 4 || item.serviceID === 2 || item.serviceID === 9)
        services.push(item);
    });
    return services;
  }

  getStates() {
    this.dataSource.data = [];
    this.projectServicelineMappingService.getStates().subscribe(
      (res: any) => {
        if (res.data && res.statusCode === 200) {
          this.states = res.data;
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  getDistricts() {
    this.dataSource.data = [];
    this.projectServcelineMappingForm.controls['district'].patchValue(null);
    this.projectServcelineMappingForm.controls['block'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectName'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectId'].patchValue(null);
    // this.dataSource.data = [];
    this.enableProjectField = false;
    const stateId =
      this.projectServcelineMappingForm.get('state')?.value.stateID;
    this.projectServicelineMappingService.getDistricts(stateId).subscribe(
      (res: any) => {
        if (res.data && res.statusCode === 200) {
          this.districts = res.data;
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  getBlocks() {
    console.log('this.dataSource.dataGetBLOCKS', this.dataSource.data);
    this.projectServcelineMappingForm.controls['block'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectId'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectName'].patchValue(null);

    this.enableProjectField = false;
    const districtId =
      this.projectServcelineMappingForm.get('district')?.value.districtID;
    this.projectServicelineMappingService.getBlocks(districtId).subscribe(
      (res: any) => {
        if (res.data && res.statusCode === 200) {
          const existingBlockNames = this.dataSource.data.map(
            (item: any) => item.blockName,
          );
          console.log('existingBlockNames', existingBlockNames);
          this.blocks = res.data.filter(
            (element: any) => !existingBlockNames.includes(element.blockName),
          );
          console.log('this.blocks ', this.blocks);
          // this.blocks = res.data;
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  // getMappedProjectNames() {
  //   this.projectServcelineMappingForm.controls['projectId'].patchValue(null);
  //   this.projectServcelineMappingForm.controls['projectName'].patchValue(null);
  //   this.enableProjectField = false;
  //   const reqObj = {
  //     serviceLineId:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
  //     serviceLine:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
  //     stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
  //     stateName:
  //       this.projectServcelineMappingForm.get('state')?.value.stateName,
  //     districtId:
  //       this.projectServcelineMappingForm.get('district')?.value.districtID,
  //     districtName:
  //       this.projectServcelineMappingForm.get('district')?.value.districtName,
  //     serviceProviderId: this.sessionstorage.getItem('service_providerID'),
  //     blockId: this.projectServcelineMappingForm.get('block')?.value.blockID,
  //     blockName:
  //       this.projectServcelineMappingForm.get('block')?.value.blockName,
  //   };
  //   this.projectServicelineMappingService.fetchMappedProjects(reqObj).subscribe(
  //     (res: any) => {
  //       if (res && res.data && res.statusCode === 200) {
  //         if (
  //           res.data &&
  //           res.data.response !== null &&
  //           res.data.response !== 'null'
  //         ) {
  //           this.projectServcelineMappingForm.get('projectName')?.enable();
  //           this.getProjects();
  //           this.projectServcelineMappingForm.patchValue(res.data);
  //           this.projectServcelineMappingForm.controls[
  //             'projectName'
  //           ].patchValue(res.data.projectName);
  //           this.projectServcelineMappingForm.controls['projectId'].patchValue(
  //             res.data.projectId,
  //           );
  //           this.projectServcelineMappingForm.controls['id'].patchValue(
  //             res.data.id,
  //           );
  //           this.projectServcelineMappingForm.markAsPristine();
  //           this.enableUpdate = true;
  //         } else {
  //           this.projectServcelineMappingForm.get('projectName')?.enable();
  //           this.enableUpdate = false;
  //           this.getProjects();
  //         }
  //       } else {
  //         this.confirmationService.alert(res.errorMessage, 'error');
  //       }
  //     },
  //     (err: any) => {
  //       this.confirmationService.alert(err.errorMessage, 'error');
  //     },
  //   );
  // }
  getMappedProjectNames() {
    this.dataSource.data = [];
    this.projectServcelineMappingForm.controls['projectId'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectName'].patchValue(null);
    this.enableProjectField = false;
    const reqObj = {
      serviceLineId:
        this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
      serviceLine:
        this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
      stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
      stateName:
        this.projectServcelineMappingForm.get('state')?.value.stateName,
      districtId:
        this.projectServcelineMappingForm.get('district')?.value.districtID,
      districtName:
        this.projectServcelineMappingForm.get('district')?.value.districtName,
      serviceProviderId: this.sessionstorage.getItem('service_providerID'),
      // blockId: this.projectServcelineMappingForm.get('block')?.value.blockID,
      // blockName:
      //   this.projectServcelineMappingForm.get('block')?.value.blockName,
    };
    this.projectServicelineMappingService.fetchMappedProjects(reqObj).subscribe(
      (res: any) => {
        if (res && res.data && res.statusCode === 200) {
          if (res.data && res.data.length > 0) {
            this.dataSource.data = res.data;
            this.addedFields = res.data;
            console.log('this.dataSource.data', this.dataSource.data);
            this.getBlocks();
            this.projectServcelineMappingForm.get('projectName')?.enable();
            this.getProjects();
            this.projectServcelineMappingForm.patchValue(res.data);
            this.projectServcelineMappingForm.controls[
              'projectName'
            ].patchValue(res.data.projectName);
            this.projectServcelineMappingForm.controls['projectId'].patchValue(
              res.data.projectId,
            );
            this.projectServcelineMappingForm.controls['id'].patchValue(
              res.data.id,
            );
            this.projectServcelineMappingForm.markAsPristine();
            this.enableUpdate = true;
          } else {
            this.getBlocks();
            this.projectServcelineMappingForm.get('projectName')?.enable();
            this.enableUpdate = false;
            this.getProjects();
          }
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }
  getProjects() {
    const serviceProviderId = this.sessionstorage.getItem('service_providerID');
    this.projectMasterService.getProjectMasters(serviceProviderId).subscribe(
      (res: any) => {
        if (res && res.statusCode === 200) {
          res.data.forEach((element: any) => {
            if (element.deleted === false) this.projectNames.push(element);
          });
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  setProjectId() {
    const projectName =
      this.projectServcelineMappingForm.controls['projectName'].value;
    this.projectNames.forEach((item: any) => {
      if (projectName === item.projectName) {
        this.projectServcelineMappingForm.controls['projectId'].patchValue(
          item.projectId,
        );
      }
    });
  }

  // updateProjectToServiceline() {
  //   const selectedBlocks = this.projectServcelineMappingForm.get('block')?.value;
  //   const reqObjUpdateArray = selectedBlocks.map((item: any) => ({
  //     id: this.projectServcelineMappingForm.get('serviceline')?.value.id,
  //     serviceLineId:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
  //     serviceLine:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
  //     stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
  //     stateName:
  //       this.projectServcelineMappingForm.get('state')?.value.stateName,
  //     districtId:
  //       this.projectServcelineMappingForm.get('district')?.value.districtID,
  //     districtName:
  //       this.projectServcelineMappingForm.get('district')?.value.districtName,
  //     serviceProviderId: this.sessionstorage.getItem('service_providerID'),
  //     blockId: item.blockID,
  //     blockName: item.blockName,
  //     projectName: this.projectServcelineMappingForm.get('projectName')?.value,
  //     projectId: this.projectServcelineMappingForm.get('projectId')?.value,
  //     deleted: false,
  //     modifiedBy: this.sessionstorage.getItem('uname'),
  //     createdBy: this.sessionstorage.getItem('uname'),
  //   }));
  //   // const reqObj = {
  //   //   id: this.projectServcelineMappingForm.get('serviceline')?.value.id,
  //   //   serviceLineId:
  //   //     this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
  //   //   serviceLine:
  //   //     this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
  //   //   stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
  //   //   stateName:
  //   //     this.projectServcelineMappingForm.get('state')?.value.stateName,
  //   //   districtId:
  //   //     this.projectServcelineMappingForm.get('district')?.value.districtID,
  //   //   districtName:
  //   //     this.projectServcelineMappingForm.get('district')?.value.districtName,
  //   //   serviceProviderId: this.sessionstorage.getItem('service_providerID'),
  //   //   blockId: this.projectServcelineMappingForm.get('block')?.value.blockID,
  //   //   blockName:
  //   //     this.projectServcelineMappingForm.get('block')?.value.blockName,
  //   //   projectName: this.projectServcelineMappingForm.get('projectName')?.value,
  //   //   projectId: this.projectServcelineMappingForm.get('projectId')?.value,
  //   //   deleted: false,
  //   //   modifiedBy: this.sessionstorage.getItem('uname'),
  //   //   createdBy: this.sessionstorage.getItem('uname'),
  //   // };
  //   this.projectServicelineMappingService
  //     .updateProjectToServiceline(reqObjUpdateArray)
  //     .subscribe(
  //       (res: any) => {
  //         if (res && res.statusCode === 200) {
  //           this.confirmationService.alert(
  //             'Project updated to servicveline successfully',
  //             'success',
  //           );
  //           this.projectServcelineMappingForm.reset();
  //           this.enableUpdate = false;
  //         } else {
  //           this.confirmationService.alert(res.errorMessage, 'error');
  //         }
  //       },
  //       (err: any) => {
  //         this.confirmationService.alert(err.errorMessage, 'error');
  //       },
  //     );
  // }

  updateProjectToServiceline(element: any) {
    const reqObj = {
      id: element.id,
      serviceLineId: element.serviceLineId,
      serviceLine: element.serviceLine,
      stateId: element.stateId,
      stateName: element.stateName,
      districtId: element.districtId,
      districtName: element.districtName,
      serviceProviderId: this.sessionstorage.getItem('service_providerID'),
      blockId: element.blockId,
      blockName: element.blockName,
      projectName: element.projectName,
      projectId: element.projectId,
      deleted: true,
      modifiedBy: this.sessionstorage.getItem('uname'),
      createdBy: this.sessionstorage.getItem('uname'),
    };
    this.projectServicelineMappingService
      .updateProjectToServiceline(reqObj)
      .subscribe(
        (res: any) => {
          if (res && res.statusCode === 200) {
            this.confirmationService.alert(
              'Project updated to servicveline successfully',
              'success',
            );
            this.projectServcelineMappingForm.reset();
            this.dataSource.data = [];
            this.enableUpdate = false;
          } else {
            this.confirmationService.alert(res.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.confirmationService.alert(err.errorMessage, 'error');
        },
      );
  }

  // saveProjectToServiceline() {
  //   const selectedBlocks = this.projectServcelineMappingForm.get('block')?.value;
  //   const blockIds = selectedBlocks.map((block: any) => block.blockID);
  //   const blockNames = selectedBlocks.map((block: any) => block.blockName);
  //   const reqObj = {
  //     serviceLineId:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
  //     serviceLine:
  //       this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
  //     stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
  //     stateName:
  //       this.projectServcelineMappingForm.get('state')?.value.stateName,
  //     districtId:
  //       this.projectServcelineMappingForm.get('district')?.value.districtID,
  //     districtName:
  //       this.projectServcelineMappingForm.get('district')?.value.districtName,
  //     serviceProviderId: this.sessionstorage.getItem('service_providerID'),
  //     blockId: this.projectServcelineMappingForm.get('block')?.value.blockID,
  //     blockName: this.projectServcelineMappingForm.get('block')?.value.blockName,
  //     projectName: this.projectServcelineMappingForm.get('projectName')?.value,
  //     projectId: this.projectServcelineMappingForm.get('projectId')?.value,
  //     createdBy: this.sessionstorage.getItem('uname'),
  //   };
  //   this.projectServicelineMappingService
  //     .saveProjectToServiceline(reqObj)
  //     .subscribe(
  //       (res: any) => {
  //         if (res && res.statusCode === 200) {
  //           this.confirmationService.alert(
  //             'Project mapped to servicveline successfully',
  //             'success',
  //           );
  //           this.projectServcelineMappingForm.reset();
  //         } else {
  //           this.confirmationService.alert(res.errorMessage, 'error');
  //         }
  //       },
  //       (err: any) => {
  //         this.confirmationService.alert(err.errorMessage, 'error');
  //       },
  //     );
  // }

  saveProjectToServiceline() {
    const selectedBlocks =
      this.projectServcelineMappingForm.get('block')?.value;
    const reqObjArray = selectedBlocks.map((block: any) => ({
      serviceLineId:
        this.projectServcelineMappingForm.get('serviceline')?.value.serviceID,
      serviceLine:
        this.projectServcelineMappingForm.get('serviceline')?.value.serviceName,
      stateId: this.projectServcelineMappingForm.get('state')?.value.stateID,
      stateName:
        this.projectServcelineMappingForm.get('state')?.value.stateName,
      districtId:
        this.projectServcelineMappingForm.get('district')?.value.districtID,
      districtName:
        this.projectServcelineMappingForm.get('district')?.value.districtName,
      serviceProviderId: this.sessionstorage.getItem('service_providerID'),
      blockId: block.blockID,
      blockName: block.blockName,
      projectName: this.projectServcelineMappingForm.get('projectName')?.value,
      projectId: this.projectServcelineMappingForm.get('projectId')?.value,
      createdBy: this.sessionstorage.getItem('uname'),
    }));

    this.projectServicelineMappingService
      .saveProjectToServiceline(reqObjArray)
      .subscribe(
        (res: any) => {
          if (res && res.statusCode === 200) {
            this.confirmationService.alert(
              'Project mapped to servicveline successfully',
              'success',
            );
            this.projectServcelineMappingForm.reset();
            this.dataSource.data = [];
          } else {
            this.confirmationService.alert(res.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.confirmationService.alert(err.errorMessage, 'error');
        },
      );
  }

  resetAllFields() {
    this.projectServcelineMappingForm.controls['state'].patchValue(null);
    this.projectServcelineMappingForm.controls['district'].patchValue(null);
    this.projectServcelineMappingForm.controls['block'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectName'].patchValue(null);
    this.projectServcelineMappingForm.controls['projectId'].patchValue(null);
    this.districts = [];
    this.blocks = [];
    this.projectNames = [];
    this.dataSource.data = [];
  }
}
