import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { OutletsMap } from '../../src';

@Component({
  selector: 'app-dynamic-outlets',
  templateUrl: './dynamic-outlets.component.html',
  standalone: false,
})
export class DynamicOutletsComponent {
  constructor(protected activatedRoute: ActivatedRoute) {}

  outlets$ = this.activatedRoute.data.pipe(
    switchMap(({ outlets$ }) => outlets$ as Observable<OutletsMap>),
    map(outlets => Object.keys(outlets ?? {}))
  );
}
