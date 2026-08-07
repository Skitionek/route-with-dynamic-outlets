# route-with-dynamic-outlets

[![Build Status][build-img]][build-url]
[![npm version][npm-img]][npm-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Demo](https://img.shields.io/badge/demo-GitHub%20Pages-8a63f7?logo=github)](https://skitionek.github.io/route-with-dynamic-outlets/)

Larger Angular applications often need panels or tabs interfaces where each panel is driven by the URL. Most existing implementations use a single route and manage panel state on top of it — this works for simple cases but loses all the advanced features the Angular Router offers (lazy loading, guards, nested routes, etc.).

`route-with-dynamic-outlets` solves this by dynamically registering named `<router-outlet>` children at match time, so every panel is a first-class Angular route. The library is a focused proof of concept that shows a clean, router-native direction for advanced panel/tab UIs.

👉 **[View the interactive demo](https://skitionek.github.io/route-with-dynamic-outlets/)**

## Getting started

### Install

```bash
npm install @skitionek/route-with-dynamic-outlets
```

Local development and CI target Node.js 22.22.3 or newer.

### Development container

This repository includes a dev container configuration in `.devcontainer/devcontainer.json`.

In VS Code, open the command palette and run:

```text
Dev Containers: Reopen in Container
```

The container installs and uses Node.js 22.22.3, then installs dependencies with `npm ci`, and forwards port `4173` for the local docs demo.

### Run demo locally

```bash
npm run demo
```

Then open <http://localhost:4173>. This serves the interactive demo from the `docs/` directory.

### Debug in VS Code

The workspace includes launch configurations for debugging Jest and individual TypeScript files:

```text
Debug Current TS File
Debug Jest Tests
Debug Jest Current File
```

Open the **Run and Debug** panel in VS Code and pick the configuration that matches the file or test suite you want to inspect.

## Usage

### 1. Create a component that renders outlets dynamically

```ts
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OutletsMap } from '@skitionek/route-with-dynamic-outlets';

@Component({
  standalone: true,
  selector: 'app-dynamic-outlets',
  template: `
    <a [routerLink]="[{ outlets: { A: [''], B: [''] } }]">Open A and B</a>
    <router-outlet
      *ngFor="let outlet of outlets$ | async"
      [name]="outlet"
    ></router-outlet>
  `,
  imports: [RouterModule, CommonModule],
})
export class DynamicOutletsComponent {
  constructor(protected activatedRoute: ActivatedRoute) {}

  outlets$ = this.activatedRoute.data.pipe(
    switchMap(({ outlets$ }) => outlets$ as Observable<OutletsMap>),
    map(outlets => Object.keys(outlets ?? {}))
  );
}
```

### 2. Define routes with `createRouteWithDynamicOutlets`

```ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { createRouteWithDynamicOutlets } from '@skitionek/route-with-dynamic-outlets';
import { DynamicOutletsComponent } from './dynamic-outlets.component';
import { PlaceholderComponent } from './placeholder/placeholder.component';

const routes: Routes = [
  createRouteWithDynamicOutlets({
    path: 'workspace',
    component: DynamicOutletsComponent,
    dynamicOutletFactory: () => ({
      path: '',
      component: PlaceholderComponent,
    }),
  }),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppWorkspaceRoutingModule {}
```

### Nesting

Routes with dynamic outlets can be nested arbitrarily. Pass the result of an inner `createRouteWithDynamicOutlets` call as the return value of `dynamicOutletFactory`:

```ts
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
});
```

### Custom matcher

Supply a `matcher` function instead of (or in addition to) a `path` to match non-standard URL patterns:

```ts
createRouteWithDynamicOutlets({
  component: DynamicOutletsComponent,
  matcher: url => {
    if (url.length === 1 && url[0].path.match(/^@[\w]+$/)) {
      return {
        consumed: url,
        posParams: { username: new UrlSegment(url[0].path.slice(1), {}) },
      };
    }
    return null;
  },
  dynamicOutletFactory: () => ({
    path: '',
    component: PlaceholderComponent,
  }),
});
```

## How it works

`createRouteWithDynamicOutlets` wraps the Angular `Route` object with a custom `matcher`. Each time the router evaluates the route, the matcher:

1. Runs the underlying path/matcher check (using Angular's built-in `defaultUrlMatcher` algorithm by default).
2. Reads the current named-outlet children from the `UrlSegmentGroup`.
3. Calls `dynamicOutletFactory` for any new outlets and removes routes for outlets that are no longer present.
4. Pushes the updated `OutletsMap` into a `BehaviorSubject` stored on `route.data.outlets$`.

Your component subscribes to `activatedRoute.data.outlets$` and renders a `<router-outlet>` for each key, giving every outlet a full, independent router lifecycle.

## API

### `createRouteWithDynamicOutlets(route: RouteWithDynamicOutlets): Route`

Creates an Angular `Route` with a custom matcher that dynamically manages child outlet routes.

| Parameter | Type                      | Description                                                                                                                                |
| --------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `route`   | `RouteWithDynamicOutlets` | Angular `Route` extended with `dynamicOutletFactory`. `path` and `matcher` are both optional and behave the same as in a standard `Route`. |

### `RouteWithDynamicOutlets`

Extends Angular's `Route` with one additional field:

| Field                  | Type                        | Description                                                                          |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------ |
| `dynamicOutletFactory` | `DynamicOutletRouteFactory` | Called once per new outlet name to build the child route definition for that outlet. |

### `DynamicOutletRouteFactory`

```ts
type DynamicOutletRouteFactory = (
  segments: UrlSegment[],
  group: UrlSegmentGroup,
  route: Route,
  outlet: string
) => Omit<Route, 'outlet'>;
```

Receives the current URL segments, segment group, parent route, and the outlet name. Returns a partial `Route` (the `outlet` field is set automatically).

### `OutletsMap`

```ts
type OutletsMap = UrlSegmentGroup['children'];
```

A map of outlet name → `UrlSegmentGroup` reflecting the currently active named outlets. Emitted by the `outlets$` observable on `activatedRoute.data`.

[build-img]: https://github.com/Skitionek/route-with-dynamic-outlets/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/Skitionek/route-with-dynamic-outlets/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/@skitionek/route-with-dynamic-outlets
[downloads-url]: https://www.npmtrends.com/@skitionek/route-with-dynamic-outlets
[npm-img]: https://img.shields.io/npm/v/@skitionek/route-with-dynamic-outlets
[npm-url]: https://www.npmjs.com/package/@skitionek/route-with-dynamic-outlets
[issues-img]: https://img.shields.io/github/issues/Skitionek/route-with-dynamic-outlets
[issues-url]: https://github.com/Skitionek/route-with-dynamic-outlets/issues
[codecov-img]: https://codecov.io/gh/Skitionek/route-with-dynamic-outlets/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Skitionek/route-with-dynamic-outlets
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
