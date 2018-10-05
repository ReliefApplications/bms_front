import { Component, OnInit } from '@angular/core';

import { GlobalText } from '../../../../texts/global';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

  public error = GlobalText.TEXTS;

  constructor() { }

  ngOnInit() {
  }

}
