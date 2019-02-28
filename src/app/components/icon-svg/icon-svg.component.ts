import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-icon-svg',
  templateUrl: './icon-svg.component.html',
  styleUrls: ['./icon-svg.component.scss']
})
export class IconSvgComponent implements OnInit {
  @Input() name = "";
  @Input() menuHover = false;
  @Input() isClicked = false;

  constructor() { }

  ngOnInit() {
  }

}
