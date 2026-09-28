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
import { StringValidatorDirective } from './stringValidator.directive';

describe('StringValidatorDirective', () => {
  let directive: StringValidatorDirective;

  beforeEach(() => {
    directive = new StringValidatorDirective({} as any);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should validate alphabet-only strings correctly', () => {
    directive.allowText = 'alphabet';
    expect(directive.validate('abcXYZ')).toBe(true);
    expect(directive.validate('abc123')).toBe(false);
  });

  it('should validate decimal strings correctly', () => {
    directive.allowText = 'decimal';
    expect(directive.validate('12.34')).toBe(true);
    expect(directive.validate('12.345')).toBe(false);
    expect(directive.validate('12')).toBe(true);
  });

  it('should validate numeric strings correctly', () => {
    directive.allowText = 'number';
    expect(directive.validate('12345')).toBe(true);
    expect(directive.validate('12a45')).toBe(false);
  });

  it('should return false for null or empty input', () => {
    directive.allowText = 'alphabet';
    expect(directive.validate(null)).toBe(false);
    expect(directive.validate('')).toBe(false);
  });

  it('should return false for an unrecognized pattern code', () => {
    directive.allowText = 'unknownPattern';
    expect(directive.validate('anything')).toBe(false);
  });
});
