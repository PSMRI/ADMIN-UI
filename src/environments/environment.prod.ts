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
const FHIR_API = 'https://amritwprdev.piramalswasthya.org/';
const adminBaseUrl = `${ADMIN_API}admin-api/`;
const superadminBaseURL = `${ADMIN_API}admin-api/`;
const commonBaseURL = `${COMMON_API}common-api/`;
const fhirBaseUrl = `${FHIR_API}fhir-api/`;
const sessionStorageEncKey = '';

const siteKey = '';
const captchaChallengeURL = '';
const enableCaptcha = true;

export const environment = {
  production: false,
  encKey: sessionStorageEncKey,

  adminBaseUrl: adminBaseUrl,
  superadminBaseURL: superadminBaseURL,
  commonBaseURL: commonBaseURL,

  extendSessionUrl: `${COMMON_API}common/extend/redisSession`,

  //Role Master APIs
  get_State_Url: `${adminBaseUrl}m/role/state`,
  get_Service_Url: `${adminBaseUrl}m/role/serviceNew`,
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
  getAllParkingPlaceSubDistrictMapping_url: `${adminBaseUrl}parkingPlaceTalukMapping/getall/parkingPlacesTalukMapping`,
  _getDistrictListURL: `${adminBaseUrl}zonemaster/getdistrictMappedtoZone`,
  _getTalukListURL: `${commonBaseURL}location/taluks/`,
  filterMappedTaluks_url: `${adminBaseUrl}parkingPlaceTalukMapping/get/unmappedtaluk`,
  saveParkingPlaceSubDistrictMapping_url: `${adminBaseUrl}parkingPlaceTalukMapping/create/parkingPlacesTalukMapping`,
  updateTalukMapping_url: `${adminBaseUrl}parkingPlaceTalukMapping/update/parkingPlacesTalukMapping`,
  mappingActivationDeactivation_url: `${adminBaseUrl}parkingPlaceTalukMapping/activate/parkingPlacesTalukMapping`,
  _getServiceLineURL: `${adminBaseUrl}m/role/serviceNew`,
  _getStateListURL: `${adminBaseUrl}m/role/stateNew`,
  _getZonesURL: `${adminBaseUrl}zonemaster/get/zones`,
  _getDistrictZoneListURL: `${adminBaseUrl}zonemaster/getdistrictMappedtoZone`,
  getServicePointsURL: `${adminBaseUrl}servicePointMaster/get/servicePoints`,
  _getTalukZoneListURL: `${adminBaseUrl}parkingPlaceTalukMapping/getbyppidanddid/parkingPlacesTalukMapping`,
  saveServicePointsURL: `${adminBaseUrl}servicePointMaster/create/servicePoints`,
  updateServicePointStatusURL: `${adminBaseUrl}servicePointMaster/remove/servicePoint`,
  updateServicePointsURL: `${adminBaseUrl}servicePointMaster/edit/servicePoint`,
  _getTalukServiceListURL: `${adminBaseUrl}parkingPlaceTalukMapping/getbyppidanddid/parkingPlacesTalukMapping`,
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
  updateZoneMappingDataUrl: `${adminBaseUrl}zonemaster/edit/zoneDistrictMapping`,

  _postProcedureURL: `${adminBaseUrl}labModule/createProcedureMaster`,
  _getProcedureListURL: `${adminBaseUrl}labModule/fetchProcedureMaster/`,
  _toggleProcedureURL: `${adminBaseUrl}labModule/updateProcedureStatus`,
  _updateProcedureURL: `${adminBaseUrl}labModule/updateProcedureMaster`,
  _iotProcedureURL: `${adminBaseUrl}diagnostics/getDiagnosticProcedure`,
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
  downloadSignUrl: `${adminBaseUrl}signature1/`,

  /* serviceline and state */
  getRolesUrl: `${adminBaseUrl}m/role/search/active`,
  saveUrl: `${adminBaseUrl}m/role/configWrap`,
  getStatesUrl: `${adminBaseUrl}m/role/stateNew`,
  getServiceLinesUrl: `${adminBaseUrl}m/role/serviceNew`,
  get_State_new_Url: `${adminBaseUrl}m/role/stateNew`,
  get_Service_new_Url: `${adminBaseUrl}m/role/serviceNew`,
  get_facilities_Url: `${adminBaseUrl}getFacility`,
  save_facilities_Url: `${adminBaseUrl}addFacility`,
  update_facilities_Url: `${adminBaseUrl}editFacility`,
  delete_facilities_Url: `${adminBaseUrl}deleteFacility`,
  get_itemform_Url: `${adminBaseUrl}getItemForm`,
  save_itemform_Url: `${adminBaseUrl}createItemForms`,
  update_itemform_Url: `${adminBaseUrl}editItemForm`,
  delete_itemform_Url: `${adminBaseUrl}blockItemForm`,

  /* user-role-agentID */
  get_Roles_Url: `${adminBaseUrl}m/role/searchV1`,
  get_Campaigns_Url: `${adminBaseUrl}getAvailableCampaigns`,
  get_AgentIDs_Url: `${adminBaseUrl}getAvailableAgentIds`,
  getEmployeeUrl: `${adminBaseUrl}m/SearchEmployeeFilter`,
  mapAgentID_Url: `${adminBaseUrl}usrRoleAndCtiMapping`,
  getAllRolesForTMUrl: `${adminBaseUrl}searchRoleTM`,
  getAllMappedRolesForTmUrl: `${adminBaseUrl}getUserRoleTM`,

  get_SaveWorkLocationMappedDetails_Url: `${adminBaseUrl}userRoleMappings`,
  get_UpdateWorkLocationMappedDetails_Url: `${adminBaseUrl}updateUserRoleMapping`,
  get_DeleteWorkLocationMappedDetails_Url: `${adminBaseUrl}deleteUserRoleMapping`,
  get_DeleteWorkLocationMappedDetailsForTM_Url: `${adminBaseUrl}deleteUserRoleMappingTM`,

  /* agent-list-creation */
  get_Campaign_Names_Url: `${commonBaseURL}cti/getCampaignNames`,
  save_AgentListMapping_Url: `${adminBaseUrl}createUSRAgentMapping`,
  getAllAgents_Url: `${adminBaseUrl}getAllAgentIds`,
  edit_AgentListMapping_Url: `${adminBaseUrl}updateCTICampaignNameMapping`,

  getMappedUserDetails: `${adminBaseUrl}videoConsultation/getmappedUsers/`,
  getAllDesignationsUrl: `${adminBaseUrl}m/getDesignation`,
  getUserNameUrl: `${adminBaseUrl}videoConsultation/getunmappedUser/`,
  getVideoConsultationDomainUrl: `${adminBaseUrl}videoConsultation/getdomain/`,
  saveSwymedUserDetailsUrl: `${adminBaseUrl}videoConsultation/createUser`,
  updateUserDetailsUrl: `${adminBaseUrl}videoConsultation/editUser`,
  mappingActivationDeactivationUrl: `${adminBaseUrl}videoConsultation/deleteUser/`,
  saveDrugGroupsURL: `${adminBaseUrl}m/saveDrugGroup`,
  saveDrugsURL: `${adminBaseUrl}m/saveDrug`,
  mapDrugGroupURL: `${adminBaseUrl}m/mapDrugWithGroup`,
  getDrugsListURL: `${adminBaseUrl}m/getDrugData`,
  getDrugGroupsURL: `${adminBaseUrl}m/getDrugGroups`,
  updateDrugStatusURL: `${adminBaseUrl}m/updateDrugStatus`,
  updateDrugDataURL: `${adminBaseUrl}m/updateDrugMaster`,
  updateDrugGroupURL: `${adminBaseUrl}m/updateDrugGroup`,
  getDrugMappingsURL: `${adminBaseUrl}m/getDrugGroupMappings`,
  updateDrugMappingsURL: `${adminBaseUrl}m/updateDrugMapping`,
  getAllDrugStrengthsUrl: `${adminBaseUrl}getDrugStrangth`,
  getDrugStrengthUrl: `${adminBaseUrl}getDrugStrangth`,
  saveDrugStrengthUrl: `${adminBaseUrl}createDrugStrangth`,
  updateDrugStrengthUrl: `${adminBaseUrl}updateDrugStrangth`,
  drugStrengthActivationDeactivationUrl: `${adminBaseUrl}deleteDrugStrangth`,
  getRegistrationDataUrl: `${commonBaseURL}beneficiary/getRegistrationData`,
  checkUserAvailabilityUrl: `${adminBaseUrl}m/FindEmployeeByName`,
  getAllUsersUrl: `${adminBaseUrl}m/SearchEmployee4`,
  getAllMaritalStatusesUrl: `${commonBaseURL}beneficiary/getRegistrationDataV1`,
  getAllQualificationsUrl: `${adminBaseUrl}m/Qualification`,
  getAllCommunitiesUrl: `${adminBaseUrl}getCommunity`,
  getAllReligionsUrl: `${adminBaseUrl}getReligion`,
  getAllStatesUrl: `${commonBaseURL}location/states/`,
  getAllDistrictsUrl: `${commonBaseURL}location/districts/`,
  checkID: `${adminBaseUrl}m/FindEmployeeDetails`,
  createNewUserUrl: `${adminBaseUrl}createNewUser`,
  editUserDetailsUrl: `${adminBaseUrl}editUserDetails`,
  userActivationDeactivationUrl: `${adminBaseUrl}deletedUserDetails`,
  checkEmpIdAvailabilityUrl: `${adminBaseUrl}m/FindEmployeeDetails`,

  // User Account Lock Management APIs (Common-API)
  getUserLockStatusUrl: `${commonBaseURL}user/getUserLockStatus`,
  unlockUserAccountUrl: `${commonBaseURL}user/unlockUserAccount`,

  getStates_url: `${adminBaseUrl}m/role/state`,
  getDistricts_url: `${adminBaseUrl}m/location/findDistrict`,
  getServiceLines_url: `${adminBaseUrl}m/role/service`,
  getWorkLocations_url: `${adminBaseUrl}m/location/getAlllocation`,
  add_WorkLocation_url: `${adminBaseUrl}m/location/addLocation`,
  edit_WorkLocation_url: `${adminBaseUrl}m/location/editLocation`,
  delete_WorkLocation_url: `${adminBaseUrl}m/location/deleteLocation`,
  getWorkLocationsOnState_url: `${adminBaseUrl}/m/location/getLocationByStateId`,
  getOfficesUrl: `${adminBaseUrl}m/location/getOfficeNameByMapId`,

  get_ProviderName_Url: `${adminBaseUrl}m/SearchEmployee4`,
  get_LanguageList_Url: `${commonBaseURL}beneficiary/getLanguageList`,
  get_LanguageMappedDetails_Url: `${adminBaseUrl}getUserMappedLanguage`,
  get_WorkLocationMappedDetails_Url: `${adminBaseUrl}getUserRoleMapped`,

  get_SaveLanguageMappedDetails_Url: `${adminBaseUrl}userLanguageMapping`,
  get_UpdateLanguageMappedDetails_Url: `${adminBaseUrl}updateUserLanguageMapping`,
  get_DeleteLanguageMappedDetails_Url: `${adminBaseUrl}deleteUserLanguageMapping`,
  _getStatenewListURL: `${commonBaseURL}location/states/`,
  _getDistrictnewListURL: `${commonBaseURL}location/districts/`,
  _getTaluknewListURL: `${commonBaseURL}location/taluks/`,
  _getBlocknewListURL: `${commonBaseURL}location/districtblocks/`,
  _getBranchnewListURL: `${adminBaseUrl}villageMaster/get/Villages`,
  storeVillagesURL: `${adminBaseUrl}villageMaster/save/VillageDetails`,
  deleteVillageURL: `${adminBaseUrl}villageMaster/remove/village`,
  updateVillageDataURL: `${adminBaseUrl}villageMaster/update/villageData`,
  _saveUserSpecializationURL: `${adminBaseUrl}TM/saveUserSpecialization`,
  _getSpecializationURL: `${adminBaseUrl}TM/getSpecialization`,
  _getUserTMURL: `${adminBaseUrl}TM/getUser`,
  _getUserSpecializationURL: `${adminBaseUrl}TM/getUserSpecialization`,
  _activateUserSpecializationURL: `${adminBaseUrl}TM/activateUserSpecialization`,
  get_CallTypeSubType_Url: `${adminBaseUrl}m/getCalltypedata`,
  save_CallTypeSubType_Url: `${adminBaseUrl}m/createCalltypedata`,
  delete_SubCallType_Url: `${adminBaseUrl}m/deleteCalltype`,
  modify_CallTypeSubType_Url: `${adminBaseUrl}m/updateCalltypedata`,
  get_InstituteDirectory_Url: `${adminBaseUrl}m/getInstituteDirectory`,
  save_InstituteDirectory_Url: `${adminBaseUrl}m/createInstituteDirectory`,
  save_Cdss_Mapping: `${adminBaseUrl}uptsu/submit/cdss`,
  get_Cdss_Url: `${adminBaseUrl}uptsu/getCdssData`,
  edit_InstituteDirectory_Url: `${adminBaseUrl}m/editInstituteDirectory`,
  toggle_activate_InstituteDirectory_Url: `${adminBaseUrl}m/deleteInstituteDirectory`,
  getSubService_url: `${adminBaseUrl}m/getSubSerive`,
  getCategoryBySubService_url: `${adminBaseUrl}m/getCategoryBySubServiceID`,
  saveCategory_url: `${adminBaseUrl}m/createCategory`,
  deleteCategory_url: `${adminBaseUrl}m/deleteCategory1`,
  deleteSubCategory_url: `${adminBaseUrl}m/deleteSubCategory`,
  getCategory_url: `${adminBaseUrl}m/getCategory`,
  saveExistCategory_url: `${adminBaseUrl}m/createSubCategory`,
  editCategory_url: `${adminBaseUrl}m/updateCategory`,
  editSubCategory_url: `${adminBaseUrl}m/updateSubCategory`,
  get_InstituteSubDirectory_Url: `${adminBaseUrl}m/getInstutesubDirectory`,
  save_InstituteSubDirectory_Url: `${adminBaseUrl}m/createInstutesubDirectory`,
  edit_InstituteSubDirectory_Url: `${adminBaseUrl}m/editInstutesubDirectory`,
  toggle_activate_InstituteSubDirectory_Url: `${adminBaseUrl}m/deleteInstutesubDirectory`,
  getFeedbackTypes_url: `${adminBaseUrl}m/getFeedbackType`,
  deleteFeedback_url: `${adminBaseUrl}m/deleteFeedbackType`,
  saveFeedback_url: `${adminBaseUrl}m/saveFeedbackType`,
  editFeedback_url: `${adminBaseUrl}m/editFeedbackType`,
  getFeedbackNaturesTypes_url: `${adminBaseUrl}m/getFeedbackNatureType`,
  deleteFeedbackNatureType_url: `${adminBaseUrl}m/deleteFeedbackNatureType`,
  saveFeedbackNatureType_url: `${adminBaseUrl}m/createFeedbackNatureType`,
  editFeedbackNatureType_url: `${adminBaseUrl}m/editFeedbackNatureType`,
  getFeedbackTypes_Url: `${adminBaseUrl}m/getFeedbackType`,
  getFeedbackNatureTypes_url: `${adminBaseUrl}m/getFeedbackNatureType`,
  getMapping_url: `${adminBaseUrl}m/getmapedCategorytoFeedbackNatureWithFeedbackNatureID`,
  getCategoryID_url: `${adminBaseUrl}m/getCategoryByMapID`,
  saveComplaintToCategoryMapping_url: `${adminBaseUrl}m/mapCategorytoFeedbackNature`,
  updateComplaintCategoryMapping_url: `${adminBaseUrl}m/updateCategorytoFeedbackNature`,
  unmapCategory_url: `${adminBaseUrl}t/unmappCategoryforFeedbackNature`,
  filterMappedCategory_url: `${adminBaseUrl}m/getunmappedCategoryforFeedbackNature`,
  get_InstitutesType_Url: `${adminBaseUrl}m/getInstituteType`,
  save_InstituteType_Url: `${adminBaseUrl}m/createInstituteType`,
  edit_InstituteType_Url: `${adminBaseUrl}m/editInstituteType`,
  delete_InstituteType_Url: `${adminBaseUrl}m/deleteInstituteType`,
  get_District_Url: `${commonBaseURL}location/districts/`,
  get_Taluk_Url: `${commonBaseURL}location/taluks/`,
  get_Village_Url: `${commonBaseURL}location/village/`,

  get_Institution_Url: `${adminBaseUrl}m/getInstution`,
  create_Institution_Url: `${adminBaseUrl}m/createInstutionByVillage`,
  edit_Institution_Url: `${adminBaseUrl}m/editInstution`,
  delete_Institution_Url: `${adminBaseUrl}m/deleteInstution`,
  file_upload_url: `${adminBaseUrl}m/createInstitutionByFile`,
  get_Serverity_Url: `${adminBaseUrl}m/getServerity`,

  get_State_Url_new: `${adminBaseUrl}m/role/stateNew`,
  get_Service_Url_new: `${adminBaseUrl}m/role/serviceNew`,

  addSeverityUrl: `${adminBaseUrl}m/saveServerity `,
  deleteSeverityUrl: `${adminBaseUrl}m/deleteServerity`,
  modifySeverityUrl: `${adminBaseUrl}m/editServerity`,
  getStateUrl: `${adminBaseUrl}m/role/stateNew`,
  getServiceLineUrl: `${adminBaseUrl}m/role/serviceNew`,
  /**Device ID Master Urls */
  getFetosenseDeviceMasterUrl: `${adminBaseUrl}fetosense/fetch/fetosenseDeviceID`,
  fetosenseDeviceMasterServiceUrl: `${adminBaseUrl}fetosense/createFetosenseDeviceID`,
  editFetosenseDeviceIdUrl: `${adminBaseUrl}fetosense/update/fetosenseDeviceID`,
  deleteFetosenseDeviceMasterUrl: `${adminBaseUrl}fetosense/delete/fetosenseDeviceID`,

  /**Spoke Device ID Mapping Urls */
  getSpokeIdAndDeviceIdUrl: `${adminBaseUrl}fetosense/fetch/vanIDAndFetosenseDeviceID`,
  spokeDeviceIdMappingUrl: `${adminBaseUrl}fetosense/mapping/vanIDAndDeviceID`,
  getVanTypesURL: `${adminBaseUrl}vanMaster/get/vanTypes`,
  getVanDeviceIdMappingsURL: `${adminBaseUrl}fetosense/fetch/mappingWorklist`,
  deleteSpokeDeviceIdMappingUrl: `${adminBaseUrl}fetosense/delete/vanIDAndFetosenseDeviceIDMapping`,
  editSpokeDeviceIdMappingUrl: `${adminBaseUrl}fetosense/update/vanIDAndFetosenseDeviceIDMapping`,
  saveVansURL: `${adminBaseUrl}vanMaster/save/vanDetails`,
  updateVanURL: `${adminBaseUrl}vanMaster/update/vanDetails`,
  updateVanStatusURL: `${adminBaseUrl}vanMaster/remove/vanDetails`,
  getParkingNewPlacesURL: `${adminBaseUrl}parkingPlaceMaster/get/parkingPlaces`,

  // _getStateListBYServiceIDURL: `${adminBaseUrl}m/location/getStatesByServiceID`,
  _getStateNewListURL: `${commonBaseURL}location/states/`,
  _getServiceNewLineURL: `${adminBaseUrl}m/role/service`,
  _getTalukNewListURL: `${adminBaseUrl}/parkingPlaceTalukMapping/getbyppidanddid/parkingPlacesTalukMapping`,

  postComponentURL: `${adminBaseUrl}labModule/createComponentMaster`,
  updateComponentURL: `${adminBaseUrl}labModule/updateComponentMaster `,
  getComponentListURL: `${adminBaseUrl}labModule/fetchComponentMaster/`,
  getCurrentComponentURL: `${adminBaseUrl}labModule/fetchComponentDetailsForComponentID/`,
  toggleComponentURL: `${adminBaseUrl}labModule/updateComponentStatus`,
  iotComponentURL: `${adminBaseUrl}diagnostics/getDiagnosticProcedureComponent`,
  getLOINCRecord: `${commonBaseURL}lonic/getlonicRecordList`,

  _postComponentURL: `${adminBaseUrl}labModule/createComponentMaster`,
  _updateComponentURL: `${adminBaseUrl}labModule/updateComponentMaster `,
  _getComponentListURL: `${adminBaseUrl}labModule/fetchComponentMaster/`,
  _getCurrentComponentURL: `${adminBaseUrl}labModule/fetchComponentDetailsForComponentID/`,
  _toggleComponentURL: `${adminBaseUrl}labModule/updateComponentStatus`,
  _iotComponentURL: `${adminBaseUrl}diagnostics/getDiagnosticProcedureComponent`,
  getCalibrationMaster_Url: `${adminBaseUrl}fetchCalibrationStrips`,
  delete_CalibrationStrip_Url: `${adminBaseUrl}deleteCalibrationStrip`,
  save_Calibration_Url: `${adminBaseUrl}createCalibrationStrip`,
  update_Calibration_Url: `${adminBaseUrl}updateCalibrationStrip`,
  get_supplier_Url: `${adminBaseUrl}getSupplier`,
  getAll_Districts_Url: `${commonBaseURL}location/districts/`,
  delete_supplier_Url: `${adminBaseUrl}deleteSupplier`,
  save_supplier_Url: `${adminBaseUrl}createSupplier`,
  update_supplier_Url: `${adminBaseUrl}editSupplier`,
  getAll_State_Url: `${commonBaseURL}location/states/`,
  getAll_Country: `${commonBaseURL}location/getCountries`,
  get_manufacture_Url: `${adminBaseUrl}getManufacturer`,
  save_manufacture_Url: `${adminBaseUrl}createManufacturer`,
  update_manufacture_Url: `${adminBaseUrl}editManufacturer`,
  delete_manufacture_Url: `${adminBaseUrl}deleteManufacturer`,
  getPharmacologyListUrl: `${adminBaseUrl}getPharmacologicalcategory`,
  savePharmacologyUrl: `${adminBaseUrl}createPharmacologicalcategory`,
  updatePharmacologyUrl: `${adminBaseUrl}editPharmacologicalcategory`,
  deletePharmacologyUrl: `${adminBaseUrl}deletePharmacologicalcategory`,
  get_stores_Url: `${adminBaseUrl}getAllStore`,
  save_stores_Url: `${adminBaseUrl}createStore`,
  update_stores_Url: `${adminBaseUrl}editStore`,
  delete_stores_Url: `${adminBaseUrl}deleteStore`,
  get_itemCategory_Url: `${adminBaseUrl}getItemCategory`,
  save_itemCategory_Url: `${adminBaseUrl}configItemIssue`,
  save_expiryAlertConfig_Url: `${adminBaseUrl}configexpiryalert`,

  service_provider_setup_url: `${superadminBaseURL}providerCreationAndMapping`,
  getAllServiceLinesUrl: `${adminBaseUrl}getServiceline`,

  checkProviderNameAvailabilityUrl: `${adminBaseUrl}checkProvider`,
  getAllProviderUrl: `${adminBaseUrl}getAllProvider`,
  getProviderInfoUrl: `${adminBaseUrl}getProviderStatus1`,
  addProviderStateAndServiceLinesUrl: `${adminBaseUrl}addProviderStateAndServiceLines`,
  getAllStatus_URL: `${adminBaseUrl}getStatus`,

  /*
   * Creation of provider admin URL
   */
  getAllProviderAdmin_url: `${adminBaseUrl}completeUserDetails`,
  createProviderAdminUrl: `${adminBaseUrl}createProviderAdmin`,
  getAllGendersUrl: `${adminBaseUrl}m/AllGender`,
  getAllTitlesUrl: `${adminBaseUrl}m/AllTitle`,
  getAllMaritalStatusUrl: `${commonBaseURL}beneficiary/getRegistrationDataV1`,
  updateProviderAdminUrl: `${adminBaseUrl}editProviderAdmin`,
  delete_toggle_activationUrl: `${adminBaseUrl}deleteProviderAdmin`,
  /* Mapping Provider Admin */
  getAllStatesByProviderUrl: `${adminBaseUrl}/m/role/state`,
  getAllServiceLinesByProviderUrl: `${adminBaseUrl}/m/role/service`,
  getAllProviderAdminUrl: `${adminBaseUrl}getProviderAdmin`,
  getAllProviderAdminMappingsUrl: `${adminBaseUrl}getmappingProviderAdmintoProvider`,
  providerAdminActivateUrl: `${adminBaseUrl}deletemappingProviderAdmintoProvider`,
  providerAdminDeactivateUrl: `${adminBaseUrl}deletemappingProviderAdmintoProvider`,
  providerAdminUpdateUrl: `${adminBaseUrl}editmappingProviderAdmintoProvider`,
  MappingProviderAdminUrl: `${adminBaseUrl}mappingProviderAdmintoProvider`,
  getAllServicesByProviderUrl: `${superadminBaseURL}getServiceLinesUsingProvider`,
  getProvider_ServiceLineLevelStatus_Url: `${adminBaseUrl}getProviderStatusByProviderAndServiceId`,

  /* new APIs */
  createProviderUrl: `${superadminBaseURL}createProvider`,
  providerUpdateUrl: `${superadminBaseURL}providerUpdate`,
  providerDeleteUrl: `${superadminBaseURL}providerdelete`,

  getAllProviderMappingsUrl: `${superadminBaseURL}getMappedServiceLinesAndStatetoProvider`,
  mapProviderServiceStateUrl: `${superadminBaseURL}mapServiceLinesAndStatetoProvider`,
  editMappedProviderServiceStateUrl: `${superadminBaseURL}editMappedServiceLinesAndStatetoProvider`,
  deleteMappedProviderServiceStateUrl: `${superadminBaseURL}deleteMappedServiceLinesAndStatetoProvider`,
  getServicelinesFromProvider_url: `${superadminBaseURL}getServiceLinesUsingProvider`,
  getAllStatesOfProvider_Url: `${adminBaseUrl}m/role/state`,
  getAllServicesInStateOfProvider_Url: `${adminBaseUrl}m/role/service`,

  getAllServicesOfProvider_Url: `${adminBaseUrl}getServiceLinesUsingProvider`,
  getAllServicesOfProvider_CTI_Url: `${adminBaseUrl}m/role/serviceNew`,

  // get status of blocked/unblocked
  getProviderLevelStatus_Url: `${adminBaseUrl}getProviderStatus1`,
  getProvider_StateLevelStatus_Url: `${adminBaseUrl}getProviderStatusByState`,
  getProvider_State_ServiceLineLevelStatus_Url: `${adminBaseUrl}getProviderStatusByService`,

  // blocking apis
  block_unblock_provider_url: `${adminBaseUrl}blockProvider`,
  block_unblock_state_url: `${adminBaseUrl}blockProviderByState`,
  block_unblock_serviceline_url: `${adminBaseUrl}blockProviderByServiceId`,
  block_unblock_serviceOfState_url: `${adminBaseUrl}blockProviderByService`,
  saveSubService: `${adminBaseUrl}m/saveSubserviceData`,
  getAllSubService_URL: `${adminBaseUrl}m/FindSubSerive`,
  getSubServiceDetails_URL: `${adminBaseUrl}m/getSubSerive`,
  editProvider_URL: `${adminBaseUrl}updateProvider`,
  deleteSubserviceUrl: `${adminBaseUrl}m/deleteSubSerive`,
  _getCampaign: `${commonBaseURL}cti/getCampaignNames`,
  _addCampaign: `${adminBaseUrl}createCitMappingwithServiceLines`,
  _getCampaignList: `${adminBaseUrl}getMappedServiceLinesAndStatetoProvider`,
  getServicePointVillageMapsURL: `${adminBaseUrl}servicePointMaster/get/servicePointVillageMaps`,

  saveServicePointVillageMapsURL: `${adminBaseUrl}servicePointMaster/create/servicePointVillageMaps`,
  updateServicePointVillageMapsURL: `${adminBaseUrl}servicePointMaster/edit/servicePointVillageMap`,
  updateServicePointVillageMapStatusURL: `${adminBaseUrl}servicePointMaster/remove/servicePointVillageMap`,
  filterMappedVillages_url: `${adminBaseUrl}servicePointMaster/get/unmappedvillages`,
  saveVanServicePointMappingsURL: `${adminBaseUrl}vanMaster/save/vanServicePointMappings`,
  getVanServicePointMappingsURL: `${adminBaseUrl}vanMaster/get/vanServicePointMappingsV1`,
  updateVanServicePointMappingsURL: `${adminBaseUrl}vanMaster/remove/vanServicePointMapping`,
  _setProcedureComponentMapURL: `${adminBaseUrl}labModule/createProcedureComponentMapping`,
  getComponentNewListURL: `${adminBaseUrl}labModule/fetchComponentMasterDelFalse/`,
  getProcedureListURL: `${adminBaseUrl}labModule/fetchProcedureMasterDelFalse/`,
  zonesurl: `${adminBaseUrl}zonemaster/get/zones`,
  parkingPlaceUrl: `${adminBaseUrl}parkingPlaceMaster/get/parkingPlacesbyzoneid`,
  servicepointUrl: `${adminBaseUrl}servicePointMaster/get/servicePoints`,
  vanTypesURL: `${adminBaseUrl}vanMaster/get/vanTypes`,
  van_spoke_Url: `${adminBaseUrl}vanMaster/get/vanDetails`,
  saveMappingUrl: `${adminBaseUrl}mapping/save/vanSpokeMapping`,
  fetchUrl: `${adminBaseUrl}mapping/get/vanSpokeMapping`,
  activeMappingStatusUrl: `${adminBaseUrl}mapping/delete/vanSpokeMapping`,

  //project Master APIs
  getProjectNames: `${commonBaseURL}customization/get/projectNames/`,
  addProjectName: `${commonBaseURL}customization/addProject`,
  updateProjectName: `${commonBaseURL}customization/updateProject`,

  //Master Urls
  getServicelines: `${adminBaseUrl}m/role/serviceNew`,
  getStates: `${commonBaseURL}location/states/`,
  getDistricts: `${commonBaseURL}location/districts/`,
  getBranches: `${commonBaseURL}location/taluks/`,

  //project-serviceline mapping urls
  fetchMappedProjects: `${commonBaseURL}customization/fetchProjectServiceline`,
  saveProjectToServiceline: `${commonBaseURL}customization/saveProjectToServiceline`,
  updateProjectToServiceline: `${commonBaseURL}customization/updateProjectToServiceline`,

  //project-serviceline mapping urls
  getSectionMaster: `${commonBaseURL}customization/get/sections`,
  fetchMappedSections: `${commonBaseURL}customization/fetchMappedSectionsInProject`,
  mapSectionsToProject: `${commonBaseURL}customization/mapSectionToProject`,

  //fetch fields mapping
  fetchMappedFields: `${commonBaseURL}customization/fetchMappedFields`,
  saveSectionFields: `${commonBaseURL}customization/saveSectionAndFields`,
  updateSectionFields: `${commonBaseURL}customization/updateSectionAndFields`,
  getFieldTypes: `${commonBaseURL}customization/get/fileldType`,

  // Customization APIs
  getAllRegistrationData: `${commonBaseURL}customization/fetchAllData`,
  getBenIdForhealthID: `${fhirBaseUrl}healthID/getBenIdForhealthID`,

  //ABDM Facility
  getAbdmFacilities: `${fhirBaseUrl}facility/getAbdmRegisteredFacilities`,

  siteKey: siteKey,
  captchaChallengeURL: captchaChallengeURL,
  enableCaptcha: enableCaptcha,
};
