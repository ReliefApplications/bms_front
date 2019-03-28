import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-icon-svg',
  templateUrl: './icon-svg.component.html',
  styleUrls: ['./icon-svg.component.scss']
})
export class IconSvgComponent implements OnInit {
  // TODO
  @Input() name = ''; // to delete
  @Input() menuHover = false;  // to delete
  @Input() isClicked = false;  // to delete
  @Input() imagePath = '';

  constructor() { }

  ngOnInit() {
  }

}
