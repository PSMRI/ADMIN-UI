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
import {
  FormGroup,
  FormControl,
  FormArray,
  FormBuilder,
  AbstractControl,
} from '@angular/forms';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { EditQuestionnaireComponent } from '../edit-questionnaire/edit-questionnaire.component';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { AgentListCreationService } from '../../services/agent-list-creation-service.service';
import { QuestionnaireServiceService } from '../../services/questionnaire-service.service';
import { dataService } from 'src/app/core/services/dataService/data.service';

@Component({
  selector: 'app-add-questionnaire',
  templateUrl: './add-questionnaire.component.html',
  styleUrls: ['./add-questionnaire.component.css'],
})
export class AddQuestionnaireComponent implements OnInit, AfterViewInit {
  showAdd = false;
  // questionTypes:any=["Qualitative","Utility","Quantitative"];
  answerTypes: any = ['Radio', 'Dropdown', 'Free Text'];
  questionnaireForm!: FormGroup;
  questionArrayList: any;
  questionOptionList: any = [];
  questiontype: any = null;
  disabledFlag: any = true;
  saveDisabled = true;
  minwght = 0;
  maxwght = 100;
  questionsList: any;
  // questionrows: any = [];
  questionlists: any = [];
  providerServiceMapID: any;
  questionlistValue: any = [];
  rankArray: any = [];
  questionrowsfilter: any = [];
  services: any = [];
  state: any;
  states: any = [];
  userID: any;
  showtype = false;
  questionTypeArray: any = [];
  questiontypeID = 0;
  questionnaireType: any;
  service: any;
  // qindex:number=0
  // sum: number=0;
  delVar = false;
  enableOptionArray: any = [];
  displayedColumns = [
    'sno',
    'question',
    'questionWeightage',
    'answerType',
    'edit',
    'delete',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;
  dataSource = new MatTableDataSource<any>();

  constructor(
    private formBuilder: FormBuilder,
    public commonDialogService: ConfirmationDialogsService,
    public questionnaire_service: QuestionnaireServiceService,
    public data_service: dataService,
    public _getproviderService: AgentListCreationService,
    public dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.createQuestionnaireForm();
    this.userID = this.data_service.uid;
    this.getServices(this.userID);
    this.getQuestionType();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  getQuestionType() {
    this.questionnaire_service
      .getQuestionTypes()
      .subscribe((response: any) =>
        this.getQuestionTypeSuccessHandeler(response),
      );
  }
  getQuestionTypeSuccessHandeler(response: any) {
    console.log('*QUESTION TYPES*', response);
    this.questionTypeArray = response;
    console.log('*this.questionTypeArray*', this.questionTypeArray);
  }

  getServices(userID: any) {
    this.questionnaire_service.getServices(userID).subscribe(
      (response: any) => this.getServicesSuccessHandeler(response),
      (err) => console.log('Error', err),
    ); //
  }

  getServicesSuccessHandeler(response: any) {
    console.log('SERVICES', response);
    this.services = response;
  }
  getStates(serviceID: any, isNational: any) {
    this.state = '';
    this._getproviderService
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
  setProviderServiceMapID(providerServiceMapID: any) {
    console.log('providerServiceMapID', providerServiceMapID);
    this.providerServiceMapID = providerServiceMapID;
    this.showtype = true;
    this.createQuestionList(this.providerServiceMapID);
  }

  getNewQuestionsList(): AbstractControl[] | null {
    const newQuestionsControl = this.questionnaireForm.get('newQuestions');
    return newQuestionsControl instanceof FormArray
      ? newQuestionsControl.controls
      : null;
  }
  getAnswerOptionsList(newQuestion: any): AbstractControl[] | null {
    const answerOptionsControl = newQuestion.get('answerOptions');
    return answerOptionsControl instanceof FormArray
      ? answerOptionsControl.controls
      : null;
  }

  createQuestionList(providerServiceMapID: any) {
    this.questionnaire_service
      .fetchQuestionnaire({
        providerServiceMapID: providerServiceMapID,
      })
      .subscribe(
        (response: any) => {
          console.log('Hello', response);
          if (response.statusCode === 200) {
            this.questionlists = response.data;

            console.log('Successfull Message', this.questionlists);
          }
        },
        (error) => {
          console.log(error);
          // this.commonDialogService.alert(error.errorMessage, 'error');
        },
      );

    // this.questionrows = respObj.data.questions;
    // this.questionlists = respObj.data;
  }
  createQuestionnaireForm() {
    this.questionnaireForm = this.formBuilder.group({
      newQuestions: this.formBuilder.array([this.createQuestions()]),
    });
  }

  createQuestions(): FormGroup {
    return this.formBuilder.group({
      questionName: new FormControl(''),
      questionRank: new FormControl(''),
      questionWeight: new FormControl(''),
      answerType: new FormControl(''),
      answerOptions: this.formBuilder.array([this.createQuestionsOptions()]),
    });
  }
  createQuestionsOptions(): FormGroup {
    return this.formBuilder.group({
      option: new FormControl(''),
      optionWeightage: new FormControl(''),
      deleted: this.delVar,
    });
  }

  get answerOptions(): FormArray {
    return this.questionnaireForm.get('answerOptions') as FormArray;
  }
  get newQuestions(): FormArray {
    return this.questionnaireForm.get('newQuestions') as FormArray;
  }
  addOptionField(i: any) {
    this.questionOptionList = [];

    console.log('Ind', i);
    const questList = <FormArray>(
      this.questionnaireForm.controls['newQuestions']
    );
    console.log('questList1', questList);
    const questionList = <FormArray>questList.controls[i].get('answerOptions');

    console.log('questList', questionList);
    questionList.push(this.createItem());
    this.questionArrayList = questionList;
  }
  createItem(): FormGroup {
    return this.formBuilder.group({
      option: null,
      optionWeightage: null,
      deleted: this.delVar,
    });
  }
  deleteOptionField(i: any, idx: any) {
    const control = <FormArray>(
      this.questionnaireForm.get(['newQuestions', i, 'answerOptions'])
    );
    if (control.length !== 1) {
      control.removeAt(idx);
    }
  }

  onFormSubmit() {
    this.questionlistValue = [];
    let postQuestionList = [];
    console.log('FormValue', this.questionnaireForm.value);

    this.questionlistValue = this.questionnaireForm.value;

    postQuestionList = this.iterateArray(this.questionlistValue);

    //    for(let j=0;j<this.questionlistValue.newQuestions.length;j++) {
    //       this.sum=0;
    //       this.qindex++;
    //             for(let k=0;k<this.questionlistValue.newQuestions[j].answerOptions.length;k++)
    //             {
    //               console.log("Weightage",this.questionlistValue.newQuestions[j].answerOptions[k].optionWeightage);

    //                this.sum =  this.sum + parseInt(this.questionlistValue.newQuestions[j].answerOptions[k].optionWeightage);
    //             }
    //             if(this.sum!=100)
    //             {
    //               this.commonDialogService.alert("Sum of option  weightage of Question"+this.qindex+" should be 100", 'error');
    //              break;

    //             }

    //           }

    //           this.qindex=0;
    // console.log("Sum",this.sum)
    // if(this.sum==100)
    // {
    this.questionnaire_service.saveQuestionnaire(postQuestionList).subscribe(
      (resp: any) => {
        if (resp.statusCode === 200) {
          this.successhandler();
          this.navigateToPrev();
          this.commonDialogService.alert(resp.data.response, 'success');
          console.log('Successfull Message');
        }
      },
      (err) => {
        this.commonDialogService.alert(err.errorMessage, 'error');
        // this.successhandler();
      },
    );
  }
  // this.sum=0;
  // }
  iterateArray(questionlistValue: any) {
    console.log('QuestionTypeID', this.questiontypeID);
    const postQuestionList: any = [];
    const reqObj = {};

    questionlistValue.newQuestions.forEach((question: any) => {
      // question.answerOptions.deleted.patchValue({"deleted": false });
      // this.answerOptions[0].patchValue({"deleted": false });
      if (question.questionWeight === ' ') {
        question.questionWeight = null;
        console.log('question.answerOptions', question.answerOptions);
        // this.addOptionField(0);

        // answerList.push(this.createItem());
        console.log('question.answerOptions1', question.answerOptions);
        // question.answerOptions[0].patchValue({"option": null, "optionWeightage": null,"deleted": false });
      }
      for (let i = 0; i < question.answerOptions.length; i++) {
        // question.answerOptions[i].patchValue({"deleted": false});
        question.answerOptions[i].deleted = false;
      }
      const questionObj = {
        questionnaireDetail: {
          questionTypeID: this.questiontypeID,
          questionType: this.questiontype,
          question:
            question.questionName !== undefined &&
            question.questionName !== null
              ? question.questionName.trim()
              : null,
          questionRank: question.questionRank,
          questionWeightage: question.questionWeight,
          answerType: question.answerType,
          questionOptions: question.answerOptions,
          providerServiceMapID: this.providerServiceMapID,
          createdBy: this.data_service.uname,
          deleted: false,
        },
      };
      postQuestionList.push(questionObj);
    });

    return postQuestionList;
  }

  successhandler() {
    this.questionnaireForm.reset();

    this.createQuestionnaireForm();
    this.showAddForm();
  }
  showAddForm() {
    this.showAdd = true;
  }
  weightFlag = true;
  weightageInput(index: any) {
    const value = this.newQuestions.at(index).value.questionWeight;
    if (value >= 0 && value <= 100) {
      this.weightFlag = false;
      console.log('wght', this.weightFlag);
    } else {
      this.weightFlag = true;
      this.commonDialogService.alert(
        'Enter valid Weightage (between 0 and 100)',
        'error',
      );
      const questList = <FormArray>(
        this.questionnaireForm.controls['newQuestions']
      );
      questList.at(index).patchValue({ questionWeight: null });
    }
  }
  optionweightFlag = true;
  optionweightage(index: any, mainIndex: any) {
    console.log('Index', index);
    const questionvalue = this.newQuestions.at(mainIndex).value.answerOptions;
    console.log('ValueIndex', questionvalue);
    const value = questionvalue[index].optionWeightage;
    console.log('Valueee', value);
    if (value >= 0 && value <= 100) {
      this.optionweightFlag = false;
      console.log('wght', this.optionweightFlag);
    } else {
      this.optionweightFlag = true;
      this.commonDialogService.alert(
        'Enter valid Weightage (between 0 and 100)',
        'error',
      );
      const questList = <FormArray>(
        this.questionnaireForm.controls['newQuestions']
      );
      questList.at(index).patchValue({ questionWeight: null });
    }
  }
  setQuestionType(value: any) {
    this.questionlists = this.questionlists.sort((a: any, b: any) =>
      a.questionRank < b.questionRank ? -1 : 1,
    );
    console.log('questionrows', this.questionlists);
    console.log('questiontyepvalue', value);
    this.dataSource.data = [];
    this.dataSource.paginator = this.paginator;
    this.questionrowsfilter = [];
    for (let i = 0; i < this.questionlists.length; i++) {
      if (value === this.questionlists[i].questionType) {
        this.dataSource.data.push(this.questionlists[i]);
        this.questionrowsfilter.push(this.questionlists[i]);
      }
    }
    this.dataSource.paginator = this.paginator;
    console.log('questionrows1', this.dataSource.data);
    console.log('questionrows2', this.questionrowsfilter);

    if (value === null) {
      this.disabledFlag = true;
    } else {
      this.disabledFlag = false;
    }
    this.questiontype = value;
    console.log('questionTypeArray', this.questionTypeArray);
    for (let k = 0; k < this.questionTypeArray.length; k++) {
      if (this.questiontype === this.questionTypeArray[k].questionType) {
        this.questiontypeID = this.questionTypeArray[k].questionTypeID;
      }
    }
  }

  onAddRow() {
    this.questionsList = [];
    const questionList = <FormArray>(
      this.questionnaireForm.controls['newQuestions']
    );
    questionList.push(this.createQuestions());
    this.questionsList = questionList;
  }
  onDeleteRow(index: any) {
    const questionList = <FormArray>(
      this.questionnaireForm.controls['newQuestions']
    );
    console.log('questionList', questionList);
    console.log('questionList1', questionList.value[index].questionRank);
    if (questionList.length !== 1) {
      if (this.rankArray[index] === questionList.value[index].questionRank) {
        // this.rankArray.removeAt(index);
        this.rankArray[index] = '';
      }
      questionList.removeAt(index);
    }
  }
  navigateToPrev() {
    this.questionnaireForm.reset();
    const control = <FormArray>(
      this.questionnaireForm.get(['newQuestions', 0, 'answerOptions'])
    );
    for (let u = 0; u < control.length - 1; u++) {
      control.removeAt(0);
    }
    control.removeAt(control.length - 1);
    console.log('formValue', this.questionnaireForm.value);
    this.questionnaire_service
      .fetchQuestionnaire({
        providerServiceMapID: this.providerServiceMapID,
      })
      .subscribe(
        (respon: any) => {
          // this.listDisplay = true;
          this.questionlists = respon.data;
          this.setQuestionType(this.questiontype);
        },
        (error) => {
          console.log(error);
        },
      );

    this.showAdd = false;
  }

  onEditClick(row: any) {
    // EditQuestionnaireComponent
    // SurveyorQuestionnaireModelComponent
    console.log(row);
    const editDialog = this.dialog.open(EditQuestionnaireComponent, {
      disableClose: true,
      width: '700px',
      height: '700px',
      data: {
        selectedQuestion: row,
      },
    });
    editDialog.afterClosed().subscribe(
      (response) => {
        if (response) {
          // console.log(response);
          this.commonDialogService.alert(
            response.resp.data.response,
            'success',
          );

          this.questionnaire_service
            .fetchQuestionnaire({
              providerServiceMapID: this.providerServiceMapID,
            })
            .subscribe(
              (respon: any) => {
                // this.listDisplay = true;
                this.questionlists = respon.data;

                this.setQuestionType(response.questionType);
              },
              (error) => {
                console.log(error);
              },
            );
        } else {
          this.questionnaire_service
            .fetchQuestionnaire({
              providerServiceMapID: this.providerServiceMapID,
            })
            .subscribe(
              (respon: any) => {
                // this.listDisplay = true;
                this.questionlists = respon.data;

                this.setQuestionType(this.questiontype);
              },
              (error) => {
                console.log(error);
              },
            );
        }
      },
      (error) => {
        console.log(error);
      },
    );
  }

  onDeleteClick(row: any, event: any) {
    event.preventDefault();
    console.log(row);
    this.commonDialogService
      .confirm('', 'Are you sure you want to delete?')
      .subscribe((response) => {
        if (response) {
          this.questionnaire_service
            .deleteQuestionaire({
              providerServiceMapID: this.providerServiceMapID,
              questionID: row.questionID,
              deleted: true,
              questionRank: row.questionRank,
            })
            .subscribe(
              (response: any) => {
                console.log(response);
                if (response.statusCode === 200) {
                  console.log(response);
                  this.commonDialogService.alert(
                    response.data.response,
                    'success',
                  );

                  this.questionnaire_service
                    .fetchQuestionnaire({
                      providerServiceMapID: this.providerServiceMapID,
                    })
                    .subscribe(
                      (respon: any) => {
                        // this.listDisplay = true;
                        this.questionlists = respon.data;

                        this.setQuestionType(this.questiontype);
                      },
                      (error) => {
                        console.log(error);
                      },
                    );
                }
              },
              (error) => {
                this.commonDialogService.alert(error.errorMessage, 'error');
              },
            );
        }
      });
  }

  rankFlag = false;
  rankInput(index: any) {
    let setRank: any = false;
    const value = this.newQuestions.at(index).value.questionRank;
    if (this.rankArray[index] === value) {
      // this.rankArray.removeAt(index);
      this.rankArray[index] = '';
    }

    if (value > 0) {
      if (this.rankArray.length === 0) {
        this.rankFlag = false;
      } else {
        for (let j = 0; j < this.rankArray.length; j++) {
          if (value === this.rankArray[j]) {
            this.rankFlag = true;
            setRank = true;
            this.commonDialogService.alert(
              'Question with same rank is already adding',
              'error',
            );
            break;
          } else {
            this.rankFlag = false;
          }
        }
      }

      console.log('Rank', value);
      if (setRank === false) {
        for (let i = 0; i < this.questionlists.length; i++) {
          // console.log("qiestioList", this.questionlists[i].questionnaireDetail.questionRank);
          if (value === this.questionlists[i].questionRank) {
            // this.rankFlag = true;
            // setRank=true;
            // this.commonDialogService.alert("Question with same rank is already exist", 'error');

            this.commonDialogService
              .confirm(
                '',
                'Question with same rank is already exist.Are you sure want to proceed with the same rank?(Further higher rank questions will incremented by 1)',
              )
              .subscribe((response) => {
                if (response) {
                  this.rankFlag = false;
                } else {
                  // this.newQuestions.at(i).patchValue({ "questionRank": ""});
                  const questList = <FormArray>(
                    this.questionnaireForm.controls['newQuestions']
                  );
                  questList.at(index).patchValue({ questionRank: null });
                  this.rankFlag = true;
                }
              });

            break;
          }
        }
      }

      /* */

      if (this.rankFlag === false) {
        this.rankArray[index] = value;
      }
    } else {
      this.rankFlag = true;
      this.commonDialogService.alert(
        'Enter a valid Rank (It should greater than zero)',
        'error',
      );
    }
  }
  filterQuestionList(searchTerm: string) {
    if (!searchTerm) {
      this.dataSource.data = this.questionrowsfilter;
      this.dataSource.paginator = this.paginator;
    } else {
      this.dataSource.data = [];
      this.dataSource.paginator = this.paginator;
      console.log('questionrowsfilter', this.questionrowsfilter);
      this.questionrowsfilter.forEach((item: any) => {
        for (const key in item) {
          console.log('Key', key);
          if (key === 'questionRank') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          } else if (key === 'question') {
            const value: string = '' + item[key];
            if (value.toLowerCase().indexOf(searchTerm.toLowerCase()) >= 0) {
              this.dataSource.data.push(item);
              break;
            }
          }
          this.dataSource.paginator = this.paginator;
        }
      });
    }
  }
  enableoptionField(i: any) {
    const questList = <FormArray>(
      this.questionnaireForm.controls['newQuestions']
    );
    questList.at(i).patchValue({ questionWeight: ' ' });

    const questionList = <FormArray>questList.controls[i].get('answerOptions');

    for (let j = 0; j < questionList.length; j++) {
      questionList.removeAt(j);
    }
    questionList.removeAt(questionList.length - 1);
    console.log('controlList', questionList);

    const answerTypeValue = this.newQuestions.at(i).value.answerType;
    console.log('answerTypeValue', answerTypeValue);
    if (answerTypeValue === 'Radio' || answerTypeValue === 'Dropdown') {
      this.weightFlag = true;
      this.optionweightFlag = true;
      this.addOptionField(i);
      this.enableOptionArray[i] = true;
    } else {
      this.weightFlag = false;
      this.optionweightFlag = false;
      //  this.addOptionField(i);
      this.enableOptionArray[i] = false;
    }
  }
}
