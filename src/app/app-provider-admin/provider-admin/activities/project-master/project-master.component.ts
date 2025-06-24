import { Component, DoCheck, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ProjectMasterService } from '../services/project-master-service.service';
import { MatSort } from '@angular/material/sort';
import { NgForm } from '@angular/forms';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { dataService } from 'src/app/core/services/dataService/data.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Component({
  selector: 'app-project-master',
  templateUrl: './project-master.component.html',
  styleUrls: ['./project-master.component.css'],
})
export class ProjectMasterComponent implements OnInit {
  currentLanguageSet: any;
  serviceProviderId: any;
  showTable = true;
  projectName: any;
  enableEditMode = false;
  saveBoolean = false;

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  @ViewChild(MatSort) sort: MatSort | null = null;

  dataSource = new MatTableDataSource<any>();
  displayedColumns = ['sno', 'projectName', 'edit', 'deleted'];

  @ViewChild('projectNameForm')
  projectNameForm!: NgForm;
  ProjectList: any = [];
  originalProjectName = null;
  projectId: any;

  constructor(
    private projectMasterService: ProjectMasterService,
    private confirmationService: ConfirmationDialogsService,
    private dataService: dataService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderId = this.sessionstorage.getItem('service_providerID');
    this.getProjects();
  }

  getProjects() {
    this.projectMasterService
      .getProjectMasters(this.serviceProviderId)
      .subscribe(
        (res: any) => {
          if (res && res.statusCode === 200) {
            this.showTable = true;
            this.ProjectList = res.data;
            this.dataSource.data = res.data;
            this.ProjectList.forEach((item: any, index: number) => {
              item.sno = index + 1;
            });
            this.dataSource.data.forEach((item: any, index: number) => {
              item.sno = index + 1;
            });
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          } else {
            this.confirmationService.alert(res.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.confirmationService.alert(err.errorMessage, 'error');
        },
      );
  }

  createProject() {
    this.showTable = false;
    this.projectName = '';
  }

  goBack() {
    this.showTable = true;
    this.enableEditMode = false;
    this.getProjects();
  }

  addProject(element: any) {
    const projectCheck = element.some(
      (project: any) => project.projectName === this.projectName,
    );
    if (projectCheck) {
      this.confirmationService.alert('project already exists', 'error');
      return;
    }
    const reqObj = {
      serviceProviderId: this.serviceProviderId,
      projectName: this.projectName,
      createdBy: this.sessionstorage.getItem('uname'),
    };
    this.projectMasterService.addProject(reqObj).subscribe(
      (res: any) => {
        if (res && res.statusCode === 200) {
          this.confirmationService.alert(
            'Project saved successfully',
            'success',
          );
          this.showTable = true;
          this.projectNameForm.reset();
          this.getProjects();
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
          this.projectNameForm.reset();
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  filterComponentList(searchTerm?: string) {
    if (!searchTerm) {
      this.dataSource.data = this.ProjectList;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      this.ProjectList.forEach((item: any) => {
        for (const key in item) {
          if (key === 'projectName') {
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

  editProjectName(element: any) {
    this.enableEditMode = true;
    this.showTable = false;
    this.projectName = element.projectName;
    this.projectId = element.projectId;
    this.originalProjectName = this.projectName;
  }

  checkProjectNameExists(element: any, deactivate: boolean) {
    const projectExists = this.ProjectList.some(
      (item: any) =>
        item.projectName.toLowerCase() === element.projectName.toLowerCase() &&
        item.projectId !== element.projectId &&
        !deactivate &&
        !item.deleted,
    );

    if (projectExists) {
      this.confirmationService.alert('Project Name already exists', 'error');
    } else {
      this.activateDeactivate(element, deactivate);
    }
  }

  activateDeactivate(element: any, deactivate: boolean) {
    let text;
    if (!deactivate) text = 'Are you sure you want to Activate?';
    else text = 'Are you sure you want to Deactivate?';
    this.confirmationService
      .confirm('Confirm', text)
      .subscribe((response: any) => {
        if (response) {
          const reqObj = {
            serviceProviderId:
              this.sessionstorage.getItem('service_providerID'),
            projectId: element.projectId,
            projectName: element.projectName,
            deleted: deactivate,
            modifiedBy: this.sessionstorage.getItem('uname'),
          };
          this.projectMasterService.updateProject(reqObj).subscribe(
            (res: any) => {
              if (res && res.statusCode === 200) {
                if (deactivate) {
                  this.confirmationService.alert(
                    'Project name deactivated successfully',
                    'success',
                  );
                  this.getProjects();
                } else {
                  this.confirmationService.alert(
                    'Project name activated successfully',
                    'success',
                  );
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
      });
  }

  updateProjectName() {
    const projectExists = this.ProjectList.some(
      (item: any) =>
        item.projectName.toLowerCase() === this.projectName.toLowerCase() &&
        item.projectId !== this.projectId,
    );

    if (projectExists) {
      this.confirmationService.alert('Project Name already exists', 'error');
    } else {
      const reqObj = {
        serviceProviderId: this.sessionstorage.getItem('service_providerID'),
        projectId: this.projectId,
        projectName: this.projectName,
        deleted: false,
        modifiedBy: this.sessionstorage.getItem('uname'),
      };
      this.projectMasterService.updateProject(reqObj).subscribe(
        (res: any) => {
          if (res && res.statusCode === 200) {
            this.confirmationService.alert(
              'Project name updated successfully',
              'success',
            );
            this.projectNameForm.reset();
            this.showTable = true;
            this.enableEditMode = false;
            this.projectName = null;
            this.projectId = null;
            this.originalProjectName = null;
            this.getProjects();
          } else {
            this.confirmationService.alert(res.errorMessage, 'error');
          }
        },
        (err: any) => {
          this.confirmationService.alert(err.errorMessage, 'error');
        },
      );
    }
  }
}
