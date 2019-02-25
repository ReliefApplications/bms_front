import { Component, OnInit } from '@angular/core';
import { GlobalText } from '../../../../../texts/global';

@Component({
  selector: 'app-general-relief',
  templateUrl: './general-relief.component.html',
  styleUrls: ['./general-relief.component.scss']
})
export class GeneralReliefComponent implements OnInit {
  TEXT = GlobalText.TEXTS;

  constructor() { }

  ngOnInit() {
  }

}
