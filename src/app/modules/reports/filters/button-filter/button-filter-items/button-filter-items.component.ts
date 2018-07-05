import { Component, Input         } from '@angular/core';
import { ButtonFilterComponent } from '../button-filter.component';


@Component({
  selector   : 'button-filter-items',
  templateUrl: './button-filter-items.component.html',
  styleUrls  : ['./button-filter-items.component.scss']
})


export class ButtonFilterItemsComponent extends ButtonFilterComponent {
}