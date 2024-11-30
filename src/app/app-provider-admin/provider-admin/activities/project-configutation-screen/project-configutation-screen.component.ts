import { Component, OnInit, ViewChild } from '@angular/core';
import { ProjectMasterService } from '../services/project-master-service.service';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { Observable, of } from 'rxjs';
import { ProjectConfigurationService } from '../services/project-configuration-service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { AddFieldsToProjectComponent } from '../add-fields-to-project/add-fields-to-project.component';
import { SessionStorageService } from 'src/app/core/services/session-storage.service';

@Component({
  selector: 'app-project-configutation-screen',
  templateUrl: './project-configutation-screen.component.html',
  styleUrls: ['./project-configutation-screen.component.css'],
})
export class ProjectConfigutationScreenComponent implements OnInit {
  serviceProviderId: any;
  projectNames: any = [];
  project: any;
  filteredOptions: any;
  isChecked!: boolean;
  sectionsMaster: any = [];
  sections: any = [];
  displayedColumns = ['sno', 'sectionName', 'addFields', 'isChecked'];

  dataSource = new MatTableDataSource<any>();

  constructor(
    private projectMasterService: ProjectMasterService,
    private confirmationService: ConfirmationDialogsService,
    private projectConfigurationService: ProjectConfigurationService,
    private dialog: MatDialog,
    readonly sessionstorage: SessionStorageService,
  ) {}

  ngOnInit() {
    this.serviceProviderId = this.sessionstorage.getItem('service_providerID');
    this.getProjects();
    this.getSections(null);
  }

  displayFn(project: any) {
    return project && project.projectName ? project.projectName : '';
  }

  filterOptions(value: any) {
    const filterValue = value.toLowerCase();
    this.filteredOptions = this.projectNames.filter((option: any) =>
      option.projectName.toLowerCase().includes(filterValue),
    );
    return this.filteredOptions;
  }

  getProjects() {
    this.projectMasterService
      .getProjectMasters(this.serviceProviderId)
      .subscribe(
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

  getSections(variable: any) {
    this.projectConfigurationService.getSectionMasters().subscribe(
      (res: any) => {
        if (res && res.statusCode === 200) {
          this.sections = res.data;
          this.sectionsMaster = res.data;
          if (variable === 'datarefresh') this.dataSource.data = res.data;
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.errorMessage, 'error');
      },
    );
  }

  getMappedSections() {
    this.dataSource.data = [];
    const reqObj = {
      projectName: this.project.projectName,
      projectId: this.project.projectId,
      serviceProviderId: this.serviceProviderId,
    };
    this.projectConfigurationService
      .fetchMappedSectionsForProject(reqObj)
      .subscribe((res: any) => {
        if (res && res.data && res.statusCode === 200) {
          const mappedSections = res.data;
          this.dataSource.data = [];
          if (mappedSections && mappedSections.length > 0) {
            this.sectionsMaster.forEach((section: any) => {
              const found = mappedSections.find((mappedSection: any) => {
                return (
                  mappedSection.sectionName === section.sectionName &&
                  mappedSection.deleted === false
                );
              });
              if (found) {
                section.isChecked = true;
              } else {
                section.isChecked = false;
              }
              this.dataSource.data.push(section);
            });
            console.log('dataSource', this.dataSource.data);
          } else {
            this.getSections('datarefresh');
            // this.dataSource.data = this.sections;
          }
        }
      });
  }

  mapSections() {
    const sections: any = [];
    this.dataSource.data.filter((item: any) => {
      if (item.isChecked === true) {
        sections.push({
          sectionId: item.sectionId,
          sectionName: item.sectionName,
        });
      }
    });
    const reqObj = {
      projectName: this.project.projectName,
      projectId: this.project.projectId,
      serviceProviderId: this.serviceProviderId,
      createdBy: this.sessionstorage.getItem('uname'),
      sections: sections,
    };
    this.projectConfigurationService.mapSectionsToProject(reqObj).subscribe(
      (res: any) => {
        if (res && res.data && res.statusCode === 200) {
          this.confirmationService.alert(res.data.response, 'success');
        } else {
          this.confirmationService.alert(res.errorMessage, 'error');
        }
      },
      (err: any) => {
        this.confirmationService.alert(err.error, 'error');
      },
    );
  }

  addFields(data: any) {
    const dialog_Ref = this.dialog.open(AddFieldsToProjectComponent, {
      width: '1000px',
      height: '500px',
      disableClose: true,
      data: data,
    });
  }
}
