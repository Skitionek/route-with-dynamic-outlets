import {
  defaultUrlMatcher,
  Route,
  Routes,
  UrlMatchResult,
  UrlSegment,
  UrlSegmentGroup,
} from '@angular/router';
import { difference, get, has, isEqual, isNil, partial, set } from 'lodash';
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
    .filter(outlet => !isNil(outlet)) as string[];
  if (!isEqual(existingOutlets, neededOutlets)) {
    difference(existingOutlets, neededOutlets).forEach(outlet => {
      existingRoutes.splice(
        existingRoutes.findIndex(route => route.outlet === outlet),
        1
      );
    });
    difference(neededOutlets, existingOutlets).forEach(outlet => {
      existingRoutes.push({
        ...dynamicOutletFactory(outlet),
        outlet,
      });
    });
  }
};

const updateOutlets = (route: Route, outlets: OutletsMap) => {
  if (has(route, 'data.outlets$')) {
    const outlets$ = get(route, 'data.outlets$') as BehaviorSubject<OutletsMap>;
    if (!isEqual(outlets$.value, outlets)) {
      outlets$.next(outlets);
    }
  } else {
    set(route, 'data.outlets$', new BehaviorSubject<OutletsMap>(outlets));
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
        partial(dynamicOutletFactory, segments, group, route)
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
