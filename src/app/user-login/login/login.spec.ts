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
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { of } from 'rxjs';
import { loginContentClassComponent } from './login.component';
import { ConfirmationDialogsService } from 'src/app/core/services/dialog/confirmation.service';
import { loginService } from '../loginService/login.service';
import { HttpServices } from 'src/app/core/services/http-services/http_services.service';
import { SessionStorageService } from 'Common-UI/src/registrar/services/session-storage.service';

let component: loginContentClassComponent;
let fixture: ComponentFixture<loginContentClassComponent>;

class FakeLoginService {
  logoutUserFromPreviousSessions$ = of(false);

  dologoutUsrFromPreSession(_flag: any) {}

  checkAuthorisedUser() {
    return of({});
  }

  superAdminAuthenticate(
    _userID: any,
    _password: any,
    _doLogout: any,
    _captchaToken?: any,
  ) {
    return of({
      data: {
        isAuthenticated: true,
        key: 1234567890,
        userID: 1,
        previlegeObj: [],
      },
    });
  }

  authenticateUser(
    _userID: any,
    _password: any,
    _doLogout: any,
    _captchaToken?: any,
  ) {
    return of({
      data: {
        isAuthenticated: true,
        Status: 'Active',
        key: 1234567890,
        userID: 1,
        userName: 'di242323',
        previlegeObj: [
          { serviceID: 1, providerServiceMapID: 'SP1', serviceDesc: 'other' },
        ],
        Previlege: [{ Role: 'ProviderAdmin' }],
      },
    });
  }

  getServiceProviderID(_serviceID: any) {
    return of({ data: { serviceProviderID: '007' } });
  }
}
const providerForFakeLoginService = {
  provide: loginService,
  useClass: FakeLoginService,
};

const sessionValues: Record<string, any> = {};
const FakeSessionStorageService = {
  getItem: (key: string) => sessionValues[key] ?? null,
  setItem: (key: string, value: any) => {
    sessionValues[key] = value;
  },
  removeItem: (key: string) => {
    delete sessionValues[key];
  },
};
const providerForFakeSessionStorage = {
  provide: SessionStorageService,
  useValue: FakeSessionStorageService,
};

const FakeConfirmationDialogsService = {
  alert: (_msg?: any, _type?: any) => undefined,
  confirm: (_title?: any, _msg?: any) => of(true),
};
const providerForFakeConfirmationDialogsService = {
  provide: ConfirmationDialogsService,
  useValue: FakeConfirmationDialogsService,
};

const FakeHttpServices = {
  getCommitDetails: (_url: any) => of({ version: '1.0.0' }),
};
const providerForFakeHttpServices = {
  provide: HttpServices,
  useValue: FakeHttpServices,
};

const providerForFakeCookieService = {
  provide: CookieService,
  useValue: {},
};

const fakeRouterService = {
  navigate: jasmine.createSpy('navigate'),
};
const providerForFakeRoutes = {
  provide: Router,
  useValue: fakeRouterService,
};

describe('loginContentClassComponent', () => {
  let loginServiceInstance: loginService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [loginContentClassComponent],
      imports: [FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        providerForFakeLoginService,
        providerForFakeSessionStorage,
        providerForFakeConfirmationDialogsService,
        providerForFakeHttpServices,
        providerForFakeCookieService,
        providerForFakeRoutes,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(loginContentClassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    loginServiceInstance = TestBed.inject(loginService);
    fakeRouterService.navigate.calls.reset();
  });

  afterEach(() => {
    // login() writes the real browser sessionStorage; clear it so a
    // successful login in one test doesn't leak into the next test's
    // ngOnInit (which checks sessionStorage.getItem('authToken')).
    sessionStorage.removeItem('authToken');
  });

  describe('When the Login component is getting loaded', () => {
    it('should be created', () => {
      expect(component).toBeTruthy();
    });

    it('should have password field encrypted by default', () => {
      expect(component.dynamictype).toEqual('password');
    });

    it('should show the password on icon mouse down by calling showPWD()', fakeAsync(() => {
      spyOn(component, 'showPWD').and.callThrough();
      const btn = fixture.debugElement.query(By.css('#eye'));
      btn.triggerEventHandler('mousedown', null);
      tick();
      expect(component.showPWD).toHaveBeenCalled();
    }));

    it('should show the password by setting the type of password field as "text"', fakeAsync(() => {
      component.showPWD();
      fixture.detectChanges();
      expect(component.dynamictype).toBe('text');
    }));

    it('should hide the password by setting the type of password field as "password"', fakeAsync(() => {
      component.dynamictype = 'text';
      component.hidePWD();
      fixture.detectChanges();
      expect(component.dynamictype).toBe('password');
    }));

    it('should authenticate SUPERADMIN on login, if username is SUPERADMIN (case insensitive)', () => {
      component.login('SUPERADMIN', '12345', false);
      expect(fakeRouterService.navigate).toHaveBeenCalledWith([
        '/MultiRoleScreenComponent',
      ]);
    });

    it('should authenticate on login with status Active and go inside the app', fakeAsync(() => {
      component.login('di242323', 'abcde', false);
      tick(1000);
      expect(fakeRouterService.navigate).toHaveBeenCalledWith([
        '/MultiRoleScreenComponent',
      ]);
    }));

    it('should authenticate on login with status New and go to SET SECURITY QUESTION page', () => {
      spyOn(loginServiceInstance, 'authenticateUser').and.returnValue(
        of({
          data: {
            isAuthenticated: true,
            Status: 'New',
            key: 1234567890,
            previlegeObj: [
              {
                serviceID: 1,
                providerServiceMapID: 'SP1',
                serviceDesc: 'other',
              },
            ],
            Previlege: [{ Role: 'ProviderAdmin' }],
          },
        }),
      );
      component.login('di242323', 'abcde', false);
      fixture.detectChanges();
      expect(component.status).toBe('new');
      expect(fakeRouterService.navigate).toHaveBeenCalledWith([
        '/setQuestions',
      ]);
    });

    it('should get Service Provider ID if authentication succeeds (except Superadmin login)', () => {
      component.login('di352929', '12345', false);
      fixture.detectChanges();
      expect(component.serviceProviderID).toBe('007');
    });
  });
});
