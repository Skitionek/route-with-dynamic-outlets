import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router, Routes, UrlSegment } from '@angular/router';
import { DynamicOutletsComponent } from './components/dynamic-outlets.component';
import { PlaceholderComponent } from './components/placeholder.component';

import { createRouteWithDynamicOutlets } from '../src';

@Component({
  selector: 'app-test-host',
  template: '<router-outlet></router-outlet>',
  standalone: false,
})
class TestHostComponent {}

const routes: Routes = [
  createRouteWithDynamicOutlets({
    path: 'a',
    component: DynamicOutletsComponent,
    dynamicOutletFactory: () =>
      createRouteWithDynamicOutlets({
        path: 'b',
        component: DynamicOutletsComponent,
        dynamicOutletFactory: () => ({
          path: 'c',
          component: PlaceholderComponent,
        }),
      }),
  }),
  createRouteWithDynamicOutlets({
    component: DynamicOutletsComponent,
    matcher: url => {
      if (url.length === 1 && url[0].path.match(/^@[\w]+$/gm)) {
        return {
          consumed: url,
          posParams: {
            username: new UrlSegment(url[0].path.slice(1), {}),
          },
        };
      }

      return null;
    },
    dynamicOutletFactory: () => ({
      path: '',
      component: PlaceholderComponent,
    }),
  }),
  createRouteWithDynamicOutlets({
    path: 'loop',
    component: DynamicOutletsComponent,
    dynamicOutletFactory: () => routes[1],
  }),
];

describe('Router: App', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let router: Router;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes), CommonModule],
      declarations: [TestHostComponent, DynamicOutletsComponent, PlaceholderComponent],
    });

    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
    router.initialNavigation();
    await fixture.whenStable();
  });

  describe('navigate on abc', () => {
    it('/a(arbitraryName1:b(arbitraryName1:c))', async () => {
      await fixture.ngZone!.run(() =>
        router.navigate([
          '/a',
          {
            outlets: {
              arbitraryName1: ['b', { outlets: { arbitraryName1: ['c'] } }],
            },
          },
        ])
      );
      fixture.detectChanges();
      expect(router.url).toBe('/a/(arbitraryName1:b/(arbitraryName1:c))');
    });
    it('can delete outlet', async () => {
      await fixture.ngZone!.run(() =>
        router.navigate([
          '/a',
          {
            outlets: {
              arbitraryName1: ['b', { outlets: { arbitraryName1: ['c'] } }],
            },
          },
        ])
      );
      fixture.detectChanges();
      expect(router.url).toBe('/a/(arbitraryName1:b/(arbitraryName1:c))');
      await fixture.ngZone!.run(() =>
        router.navigate([
          '/a',
          {
            outlets: {
              arbitraryName1: ['b'],
            },
          },
        ])
      );
      fixture.detectChanges();
      expect(router.url).toBe('/a/(arbitraryName1:b)');
    });
    it('can use custom matcher', async () => {
      await fixture.ngZone!.run(() => router.navigate(['/@username']));
      fixture.detectChanges();
      expect(router.url).toBe('/@username');
    });
  });

  describe('navigate on loop', () => {});
});
