import { Component, OnInit } from '@angular/core';

import { GlobalText } from '../../../../texts/global';

@Component({
  selector: 'app-forbidden',
  templateUrl: './forbidden.component.html',
  styleUrls: ['./forbidden.component.scss']
})
export class ForbiddenComponent implements OnInit {

  public error = GlobalText.TEXTS;

  constructor() { }

  ngOnInit() {
  }

}
