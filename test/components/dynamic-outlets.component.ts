import { Component } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { map, Observable, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { OutletsMap } from '../../src';

@Component({
  standalone: true,
  selector: 'app-dynamic-outlets',
  templateUrl: './dynamic-outlets.component.html',
  imports: [RouterModule, CommonModule],
})
export class DynamicOutletsComponent {
  constructor(protected activatedRoute: ActivatedRoute) {}

  outlets$ = this.activatedRoute.data.pipe(
    switchMap(({ outlets$ }) => outlets$ as Observable<OutletsMap>),
    map(outlets => Object.keys(outlets ?? {}))
  );
}
