import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AddFieldsService {
  constructor(private http: HttpClient) {}

  fetchFields(reqObj: any) {
    return this.http.post(environment.fetchMappedFields, reqObj);
  }

  saveFields(reqObj: any) {
    return this.http.post(environment.saveSectionFields, reqObj);
  }

  updateFields(reqObj: any) {
    return this.http.post(environment.updateSectionFields, reqObj);
  }

  getFieldTypes() {
    return this.http.get(environment.getFieldTypes);
  }
}
