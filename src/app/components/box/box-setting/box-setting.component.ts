import { Component, OnInit, Input } from '@angular/core';
import { BoxComponent } from '../box.component';

@Component({
  selector: 'app-box-setting',
  templateUrl: './box-setting.component.html',
  styleUrls: ['./box-setting.component.scss']
})
export class BoxSettingComponent extends BoxComponent {
  @Input() selectedTitle;

  ngOnInit() {
    if(this.info.ref === "users") {
      this.selectedTitle = "users";
    }
  }
}
