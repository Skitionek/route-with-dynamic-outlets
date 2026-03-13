# route-with-dynamic-outlets

[![Demo](https://img.shields.io/badge/demo-GitHub%20Pages-8a63f7?logo=github)](https://skitionek.github.io/route-with-dynamic-outlets/)

Some bigger web applications provide panels/tabs interfaces. So far the implementations which I have seen were based on singular route with implementations which comes on top of it. While this solution works for simple case it cripples all advanced features which angular router has to offer (especially nested routes). This library leverages angular router outlets to address previous drawbacks.
Currently it is rather proof of concept but it shows clean direction on how advanced panels/tabs interfaces can be implemented.

👉 **[View the interactive demo](https://skitionek.github.io/route-with-dynamic-outlets/)**

## Getting started

### Install

```bash
npm install route-with-dynamic-outlets
```

Local development and CI now target Node.js 22.14 or newer.

### Development container

This repository includes a dev container config in `.devcontainer/devcontainer.json`.

In VS Code, run:

```text
Dev Containers: Reopen in Container
```

The container uses Node.js 22, installs dependencies with `npm ci`, and forwards port `4173` for the local docs demo.

### Run demo locally

```bash
npm run demo
```

Then open:

```text
http://localhost:4173
```

This serves the interactive demo from the `docs/` directory.

### Debug in VS Code

The workspace includes launch configurations for debugging Jest and individual TypeScript files from VS Code.

```text
Debug Current TS File
Debug Jest Tests
Debug Jest Current File
```

Use Run and Debug in VS Code and pick the matching configuration for the file or test suite you want to inspect.

### Usage

````ts
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PlaceholderComponent } from './placeholder/placeholder.component';
import { createRouteWithDynamicOutlets } from '../route-with-dynamic-outlets/route-with-dynamic-outlets';
import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OutletsMap } from '../../src';

@Component({
  standalone: true,
  selector: 'app-dynamic-outlets',
  template: ```
  <a [routerLink]="[{ outlets: { A: [''], B: [''] } }]">Open A and B</a>
  <router-outlet *ngFor="let outlet of outlets$ | async" [name]="outlet">
    {{outlet}}
  </router-outlet>
  ```,
  imports: [RouterModule, CommonModule],
})
export class DynamicOutletsComponent {
  constructor(protected activatedRoute: ActivatedRoute) {}

  outlets$ = this.activatedRoute.data.pipe(
    switchMap(({ outlets$ }) => outlets$ as Observable<OutletsMap>),
    map(outlets => Object.keys(outlets ?? {}))
  );
}

const routes: Routes = [
  createRouteWithDynamicOutlets({
    path: '',
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
````

Routes with dynamic outlets still can be nested.

[build-img]: https://github.com/Skitionek/route-with-dynamic-outlets/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/Skitionek/route-with-dynamic-outlets/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/route-with-dynamic-outlets
[downloads-url]: https://www.npmtrends.com/route-with-dynamic-outlets
[npm-img]: https://img.shields.io/npm/v/route-with-dynamic-outlets
[npm-url]: https://www.npmjs.com/package/route-with-dynamic-outlets
[issues-img]: https://img.shields.io/github/issues/Skitionek/route-with-dynamic-outlets
[issues-url]: https://github.com/Skitionek/route-with-dynamic-outlets/issues
[codecov-img]: https://codecov.io/gh/Skitionek/route-with-dynamic-outlets/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/Skitionek/route-with-dynamic-outlets
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
