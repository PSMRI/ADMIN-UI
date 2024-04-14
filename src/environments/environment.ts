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
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

const ADMIN_API = 'https://amritwprdev.piramalswasthya.org/';
const COMMON_API = 'https://amritwprdev.piramalswasthya.org/';
const adminBaseUrl = `${ADMIN_API}adminapi-v0.1/`;
const superadminBaseURL = `${ADMIN_API}adminapi-v0.1/`;
const commonBaseURL = `${COMMON_API}commonapi-v0.1/`;

export const environment = {
  production: false,

  adminBaseUrl: adminBaseUrl,
  superadminBaseURL: superadminBaseURL,
  commonBaseURL: commonBaseURL,

  extendSessionUrl: `${COMMON_API}common/extend/redisSession`,

  //Role Master APIs
  get_State_Url: `${adminBaseUrl}m/role/state`,
  get_Service_Url: `${adminBaseUrl}m/role/service`,
  find_Roles_By_State_Service_Url: `${adminBaseUrl}m/role/search`,
  create_Roles_Url: `${adminBaseUrl}m/role/addRole`,
  delete_Role_Url: `${adminBaseUrl}m/role/deleteRole`,
  edit_Role_Url: `${adminBaseUrl}m/role/editRole`,
  getFeaturesUrl: `${adminBaseUrl}m/searchFeature`,
  updateFeatureToRole_Url: `${adminBaseUrl}mapExterafeature`,
  getServiceLines_new_url: `${adminBaseUrl}m/role/serviceNew`,
  getStates_new_url: `${adminBaseUrl}m/role/stateNew`,

  //SMS Template APIs
  getSMStemplates_url: `${commonBaseURL}sms/getSMSTemplates`,
  saveSMStemplate_url: `${commonBaseURL}sms/saveSMSTemplate`,
  updateSMStemplate_url: `${commonBaseURL}sms/updateSMSTemplate`,
  getSMStypes_url: `${commonBaseURL}sms/getSMSTypes`,
  getSMSparameters_url: `${commonBaseURL}sms/getSMSParameters`,
  getFullSMSTemplate_url: `${commonBaseURL}sms/getFullSMSTemplate`,
  sendSMS_url: `${commonBaseURL}sms/sendSMS`,

  //snomed ct code
  getSnomedRecord: `${commonBaseURL}snomed/getSnomedCTRecordList`,
  getmasterList: `${adminBaseUrl}snomed/fetchSnomedWorklist`,
  saveMappingList: `${adminBaseUrl}snomed/saveSnomedMappingData`,
  editMappingList: `${adminBaseUrl}snomed/editSnomedMappingData`,
  updateBlockStatus: `${adminBaseUrl}snomed/updateStatus`,

  //Questionnaire APIs
  saveQuestionnaire_url: `${adminBaseUrl}saveQuestionnaire`,
  deleteQuestionnaire_url: `${adminBaseUrl}deleteQuestionnaire`,
  getQuestionnaire_url: `${adminBaseUrl}getQuestionnaireList`,
  get_Services_Url: `${adminBaseUrl}m/role/serviceNew`,
  getQuestionType_url: `${commonBaseURL}questionTypeController/get/questionTypeList`,
  editQuestionnaire_url: `${adminBaseUrl}editQuestionnaire`,
  getBlockSubcentreDataUploadUrl: `${adminBaseUrl}uptsu/saveFacility`,
  getServiceLines_newrole_url: `${adminBaseUrl}m/role/serviceNew`,
  getStates_newparking_url: `${adminBaseUrl}m/role/stateNew`,
  _getZonesParkURL: `${adminBaseUrl}zonemaster/get/zones`,
  getParkingPlacesURL: `${adminBaseUrl}parkingPlaceMaster/get/parkingPlacesbyzoneid`,
  saveParkingPlacesURL: `${adminBaseUrl}parkingPlaceMaster/create/parkingPlaces`,
  updateParkingPlaceStatusURL: `${adminBaseUrl}parkingPlaceMaster/remove/parkingPlace`,
  updateParkingPlaceDetailsURL: `${adminBaseUrl}parkingPlaceMaster/update/parkingPlaceDetails`,
  getAllParkingPlaceSubDistrictMapping_url: `${adminBaseUrl}/parkingPlaceTalukMapping/getall/parkingPlacesTalukMapping`,
  _getDistrictListURL: `${adminBaseUrl}/zonemaster/getdistrictMappedtoZone`,
  _getTalukListURL: `${commonBaseURL}location/taluks/`,
  filterMappedTaluks_url: `${adminBaseUrl}parkingPlaceTalukMapping/get/unmappedtaluk`,
  saveParkingPlaceSubDistrictMapping_url: `${adminBaseUrl}/parkingPlaceTalukMapping/create/parkingPlacesTalukMapping`,
  updateTalukMapping_url: `${adminBaseUrl}/parkingPlaceTalukMapping/update/parkingPlacesTalukMapping`,
  mappingActivationDeactivation_url: `${adminBaseUrl}/parkingPlaceTalukMapping/activate/parkingPlacesTalukMapping`,
  _getServiceLineURL: `${adminBaseUrl}m/role/serviceNew`,
  _getStateListURL: `${adminBaseUrl}m/role/stateNew`,
  _getZonesURL: `${adminBaseUrl}zonemaster/get/zones`,
  _getDistrictZoneListURL: `${adminBaseUrl}/zonemaster/getdistrictMappedtoZone`,
  getServicePointsURL: `${adminBaseUrl}servicePointMaster/get/servicePoints`,
  _getTalukZoneListURL: `${adminBaseUrl}/parkingPlaceTalukMapping/getbyppidanddid/parkingPlacesTalukMapping`,
  saveServicePointsURL: `${adminBaseUrl}servicePointMaster/create/servicePoints`,
  updateServicePointStatusURL: `${adminBaseUrl}servicePointMaster/remove/servicePoint`,
  updateServicePointsURL: `${adminBaseUrl}/servicePointMaster/edit/servicePoint`,
  _getTalukServiceListURL: `${adminBaseUrl}/parkingPlaceTalukMapping/getbyppidanddid/parkingPlacesTalukMapping`,
  saveZonesURL: `${adminBaseUrl}zonemaster/save/zone`,
  getZonesURL: `${adminBaseUrl}zonemaster/get/zones`,

  saveZoneDistrictMappingURL: `${adminBaseUrl}zonemaster/save/zoneDistrictMapping`,
  getZoneDistrictMappingURL: `${adminBaseUrl}zonemaster/get/zoneDistrictMappings`,

  updateZOneStatusURL: `${adminBaseUrl}zonemaster/remove/zone`,
  updateZOneDistrictMappingURL: `${adminBaseUrl}zonemaster/remove/zoneDistrictMapping`,

  updateZoneDataURL: `${adminBaseUrl}zonemaster/update/zoneData`,

  _getStateListByServiceIDURL: `${adminBaseUrl}m/location/getStatesByServiceID`,
  _getStateZoneListURL: `${commonBaseURL}location/states/`,
  getDistrictZoneListURL: `${commonBaseURL}location/districts/`,
  getTalukZoneListURL: `${commonBaseURL}location/taluks/`,
  _getBlockListURL: `${commonBaseURL}location/districtblocks/`,
  _getBranchListURL: `${commonBaseURL}location/village/`,
  _getServiceLinesURL: `${adminBaseUrl}getServiceline`,

  /* serviceline and state */

  getServiceLinesZone_new_url: `${adminBaseUrl}m/role/serviceNew`,
  getStateszone_new_url: `${adminBaseUrl}m/role/stateNew`,
  updateZoneMappingDataUrl: `${adminBaseUrl}/zonemaster/edit/zoneDistrictMapping`,

  _postProcedureURL: `${adminBaseUrl}labModule/createProcedureMaster`,
  _getProcedureListURL: `${adminBaseUrl}labModule/fetchProcedureMaster/`,
  _toggleProcedureURL: `${adminBaseUrl}labModule/updateProcedureStatus`,
  _updateProcedureURL: `${adminBaseUrl}labModule/updateProcedureMaster`,
  _iotProcedureURL: `${adminBaseUrl}diagnostics/getDiagnosticProcedure`,

  _getStateListBYServiceIDURL: `${adminBaseUrl}m/role/stateNew`,
  getDesignationsURL: `${adminBaseUrl}m/getDesignation`,
  getEmployeesURL: `${adminBaseUrl}parkingPlaceMaster/get/userParkingPlaces1`,
  deleteEmployeesURL: `${adminBaseUrl}parkingPlaceMaster/delete/userParkingPlaces1`,
  getUsernamesURL: `${adminBaseUrl}parkingPlaceMaster/get/unmappeduser`,
  saveEmployeeParkingPlaceMappingURL: `${adminBaseUrl}parkingPlaceMaster/save/userParkingPlaces`,
  updateEmployeeParkingPlaceMappingURL: `${adminBaseUrl}parkingPlaceMaster/edit/userParkingPlaces1`,
  userNameURL: '',
  getVansURL: `${adminBaseUrl}vanMaster/get/vanDetails`,
  getMappedVansListURL: `${adminBaseUrl}parkingPlaceMaster/get/mappedvan/`,
  removeMappedVanURL: `${adminBaseUrl}parkingPlaceMaster/delete/mappedvan`,

  /* user signature upload service */
  getUsernamesBasedDesigUrl: `${adminBaseUrl}m/getEmployeeByDesignation`,
  checkUsersignExistUrl: `${adminBaseUrl}signature1/signexist/`,
  uploadSignUrl: `${adminBaseUrl}signature1/upload`,
  downloadSignUrl: `${adminBaseUrl}signature1`,

  /* serviceline and state */
  getRolesUrl: `${adminBaseUrl}/m/role/search/active`,
  saveUrl: `${adminBaseUrl}/m/role/configWrap`,
};
