import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectMasterService {
  constructor(private http: HttpClient) {}

  getProjectMasters(serviceProviderId: any) {
    return this.http.get(environment.getProjectNames + serviceProviderId);
  }

  addProject(reqObj: any) {
    return this.http.post(environment.addProjectName, reqObj);
  }

  updateProject(reqObj: any) {
    return this.http.post(environment.updateProjectName, reqObj);
  }
}
