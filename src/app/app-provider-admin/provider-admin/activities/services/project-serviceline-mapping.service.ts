import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectServicelineMappingService {
  constructor(private http: HttpClient) {}

  getServices(reqObj: any) {
    return this.http.post(environment.getServicelines, reqObj);
  }

  getStates() {
    const countryId = 1;
    return this.http.get(environment.getStates + countryId);
  }

  getDistricts(stateId: number) {
    return this.http.get(environment.getDistricts + stateId);
  }

  getBlocks(blockId: any) {
    return this.http.get(environment.getBranches + blockId);
  }

  fetchMappedProjects(reqObj: any) {
    return this.http.post(environment.fetchMappedProjects, reqObj);
  }

  saveProjectToServiceline(reqObj: any) {
    return this.http.post(environment.saveProjectToServiceline, reqObj);
  }

  updateProjectToServiceline(reqObj: any) {
    return this.http.post(environment.updateProjectToServiceline, reqObj);
  }
}
