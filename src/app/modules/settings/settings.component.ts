import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  selectedTitle = "";

  constructor() { }

  ngOnInit() {
  }

  selectTitle(title){
    console.log(title);
    this.selectedTitle = title;
  }
}
