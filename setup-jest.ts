import 'zone.js';
import 'zone.js/testing';

import * as angularCore from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ng = angularCore as any;
// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
const major = parseInt(ng.VERSION.major as string, 10);

if (major >= 21) {
  // Angular 21+: provideZoneChangeDetection must be registered via NgModule so that
  // Angular's scheduler picks it up before the platform injector is created.
  class TestZoneModule {}
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  ng.NgModule({ providers: [ng.provideZoneChangeDetection()] })(TestZoneModule);

  getTestBed().initTestEnvironment(
    [BrowserTestingModule, TestZoneModule],
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    platformBrowserTesting([{ provide: ng.COMPILER_OPTIONS, useValue: {}, multi: true }])
  );
} else if (major >= 20) {
  // Angular 20: switched to BrowserTestingModule / platformBrowserTesting.
  getTestBed().initTestEnvironment(
    BrowserTestingModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    platformBrowserTesting([{ provide: ng.COMPILER_OPTIONS, useValue: {}, multi: true }])
  );
} else {
  // Angular 9–19: classic BrowserDynamic setup.
  getTestBed().initTestEnvironment(
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
  );
}
