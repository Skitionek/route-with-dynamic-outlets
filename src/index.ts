import {
  defaultUrlMatcher,
  Route,
  Routes,
  UrlMatchResult,
  UrlSegment,
  UrlSegmentGroup,
} from '@angular/router';
import lodash from 'lodash';
import { BehaviorSubject } from 'rxjs';

export type OutletsMap = UrlSegmentGroup['children'];
type DynamicOutletRouteFactory = (
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
  outlet: string
) => Omit<Route, 'outlet'>;
export type RouteWithDynamicOutlets = Route & {
  dynamicOutletFactory: DynamicOutletRouteFactory;
};

const updateRoutes = (
  existingRoutes: Routes,
  neededOutlets: string[],
  dynamicOutletFactory: (outlet: string) => Omit<Route, 'outlet'>
) => {
  const existingOutlets = existingRoutes
    .map(route => route.outlet)
    .filter(outlet => !lodash.isNil(outlet));
  if (!lodash.isEqual(existingOutlets, neededOutlets)) {
    lodash.difference(existingOutlets, neededOutlets).forEach(outlet => {
      existingRoutes.splice(
        existingRoutes.findIndex(route => route.outlet === outlet),
        1
      );
    });
    lodash.difference(neededOutlets, existingOutlets).forEach(outlet => {
      existingRoutes.push({
        ...dynamicOutletFactory(outlet),
        outlet,
      });
    });
  }
};

const updateOutlets = (route: Route, outlets: OutletsMap) => {
  if (lodash.has(route, 'data.outlets$')) {
    const outlets$ = lodash.get(
      route,
      'data.outlets$'
    ) as BehaviorSubject<OutletsMap>;
    if (!lodash.isEqual(outlets$.value, outlets)) {
      outlets$.next(outlets);
    }
  } else {
    lodash.set(
      route,
      'data.outlets$',
      new BehaviorSubject<OutletsMap>(outlets)
    );
  }
};

const dynamicOutletMatcherFactory =
  (
    {
      matcher = defaultUrlMatcher,
      ...routePath
    }: Pick<Route, 'path' | 'matcher'>,
    dynamicOutletFactory: DynamicOutletRouteFactory
  ) =>
  (
    segments: UrlSegment[],
    group: UrlSegmentGroup,
    route: Route
  ): UrlMatchResult | null => {
    const matchResult = matcher(segments, group, {
      ...route,
      ...routePath,
    });
    if (matchResult) {
      const outlets = group?.children ?? {};
      updateOutlets(route, outlets);
      route.children = route.children ?? [];
      updateRoutes(
        route.children,
        Object.keys(outlets),
        lodash.partial(dynamicOutletFactory, segments, group, route)
      );
    }
    return matchResult;
  };

export const createRouteWithDynamicOutlets = ({
  path,
  matcher = defaultUrlMatcher,
  dynamicOutletFactory,
  ...route
}: RouteWithDynamicOutlets): Route => ({
  ...route,
  matcher: dynamicOutletMatcherFactory({ path, matcher }, dynamicOutletFactory),
});
