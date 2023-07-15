import { Location } from '@angular/common';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router, Routes, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { DynamicOutletsComponent } from './components/dynamic-outlets.component';
import { PlaceholderComponent } from './components/placeholder.component';

import { createRouteWithDynamicOutlets } from '../src';

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
  let location: Location;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes(routes)],
    });

    router = TestBed.get(Router);
    location = TestBed.get(Location);

    router.initialNavigation();
  });

  describe('navigate on abc', () => {
    it('/a(arbitraryName1:b(arbitraryName1:c))', fakeAsync(() => {
      void router.navigate([
        '/a',
        {
          outlets: {
            arbitraryName1: ['b', { outlets: { arbitraryName1: ['c'] } }],
          },
        },
      ]);
      tick();
      expect(location.path()).toBe('/a/(arbitraryName1:b/(arbitraryName1:c))');
    }));
    it('can delete outlet', fakeAsync(() => {
      void router.navigate([
        '/a',
        {
          outlets: {
            arbitraryName1: ['b', { outlets: { arbitraryName1: ['c'] } }],
          },
        },
      ]);
      tick();
      expect(location.path()).toBe('/a/(arbitraryName1:b/(arbitraryName1:c))');
      void router.navigate([
        '/a',
        {
          outlets: {
            arbitraryName1: ['b'],
          },
        },
      ]);
      tick();
      expect(location.path()).toBe('/a/(arbitraryName1:b)');
    }));
    it('can use custom matcher', fakeAsync(() => {
      void router.navigate(['/@username']);
      tick();
      expect(location.path()).toBe('/@username');
    }));
  });

  describe('navigate on loop', () => {});
});
