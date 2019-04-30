import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-icon-svg',
  templateUrl: './icon-svg.component.html',
  styleUrls: ['./icon-svg.component.scss']
})
export class IconSvgComponent implements OnInit {
  @Input() imagePath = '';
  @Input() tooltip = '';

  constructor() { }

  ngOnInit() {
  }

}
