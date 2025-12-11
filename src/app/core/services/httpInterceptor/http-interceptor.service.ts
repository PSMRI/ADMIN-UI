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
import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
  HttpClient,
  HttpErrorResponse,
} from '@angular/common/http';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { BehaviorSubject, EMPTY, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { throwError } from 'rxjs/internal/observable/throwError';
import { ConfirmationDialogsService } from '../dialog/confirmation.service';
import { SpinnerService } from '../spinnerService/spinner.service';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

@Injectable({
  providedIn: 'root',
})
export class HttpInterceptorService implements HttpInterceptor {
  timerRef: any;
  currentLanguageSet: any;
  constructor(
    private spinnerService: SpinnerService,
    private router: Router,
    private confirmationService: ConfirmationDialogsService,
    private http: HttpClient,
    private cookieService: CookieService,
    readonly sessionstorage: SessionStorageService,
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const key: any = sessionStorage['authToken'];
    let modifiedReq = null;
    if (key !== undefined && key !== null) {
      modifiedReq = req.clone({
        headers: req.headers.set('Authorization', key),
      });
    } else {
      modifiedReq = req.clone({
        headers: req.headers.set('Authorization', ''),
      });
    }
    return next.handle(modifiedReq).pipe(
      tap((event: HttpEvent<any>) => {
        if (req.url !== undefined && !req.url.includes('cti/getAgentState'))
          this.spinnerService.setLoading(true);
        if (event instanceof HttpResponse) {
          console.log(event.body);
          this.onSuccess(req.url, event.body);
          this.spinnerService.setLoading(false);
          return event.body;
        }
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(error);
        if (error.status === 401) {
          this.confirmationService.alert(
            this.currentLanguageSet.sessionExpiredPleaseLogin || 'Your session has expired. Please login again.',
          );
        } else if (error.status === 403) {
          this.confirmationService.alert(
            this.currentLanguageSet.accessDenied || 'You do not have permission to access this resource.',
            'error',
          );
        } else if (error.status === 500) {
          this.confirmationService.alert(
            this.currentLanguageSet.internaleServerError ||  'Internal server error occurred. Please try again later.',
            'error',
          );
        } else {
          this.confirmationService.alert(
            error.message || this.currentLanguageSet.somethingWentWrong || 'Something went wrong. Please try again later.',
            'error',
          );
        }
        this.spinnerService.setLoading(false);
        return throwError(error.error);
      }),
    );
  }

  private onSuccess(url: string, response: any): void {
    if (this.timerRef) clearTimeout(this.timerRef);

    if (
      response.statusCode === 5002 &&
      url.indexOf('user/userAuthenticate') < 0
    ) {
      this.sessionstorage.clear();
      localStorage.clear();
      setTimeout(() => this.router.navigate(['/']), 0);
      // this.confirmationService.alert('error', response.errorMessage);
    } else {
      this.startTimer();
    }
  }
  startTimer() {
    this.timerRef = setTimeout(
      () => {
        console.log('there', Date());

        if (
          sessionStorage.getItem('isAuthenticated')
        ) {
          this.confirmationService
            .alert(
              'Your session is about to Expire. Do you need more time ? ',
              'sessionTimeOut',
            )
            .afterClosed()
            .subscribe((result: any) => {
              if (result.action === 'continue') {
                this.http.post(environment.extendSessionUrl, {}).subscribe(
                  (res: any) => {},
                  (err: any) => {},
                );
              } else if (result.action === 'timeout') {
                clearTimeout(this.timerRef);
                this.sessionstorage.clear();
                localStorage.clear();
                this.confirmationService.alert(
                  this.currentLanguageSet.sessionExpired || 'Your session has expired. Please login again.',
                  'error',
                );
                this.router.navigate(['/login']);
              } else if (result.action === 'cancel') {
                setTimeout(() => {
                  clearTimeout(this.timerRef);
                  this.sessionstorage.clear();
                  localStorage.clear();
                  this.confirmationService.alert(
                    this.currentLanguageSet.sessionExpired || 'Your session has expired. Please login again.',
                    'error',
                  );
                  this.router.navigate(['/login']);
                }, result.remainingTime * 1000);
              }
            });
        }
      },
      27 * 60 * 1000,
    );
  }
}
