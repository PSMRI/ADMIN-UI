import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProjectConfigurationService {
  constructor(private http: HttpClient) {}

  getSectionMasters() {
    return this.http.get(environment.getSectionMaster);
  }

  fetchMappedSectionsForProject(reqObj: any) {
    return this.http.post(environment.fetchMappedSections, reqObj);
  }

  mapSectionsToProject(reqObj: any) {
    return this.http.post(environment.mapSectionsToProject, reqObj);
  }
}
