import { Component, OnInit, Input } from '@angular/core';
import { FieldService } from 'src/app/core/api/field.service';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['display-field.component.scss']
})
export class DisplayFieldComponent implements OnInit {

  @Input() field;
  @Input() element;

  constructor(public fieldService: FieldService) { }

  ngOnInit() {

    if (this.field.kindOfField === 'Children') {
      this.field = this.element.get(this.field.childrenObject).fields[this.field.childrenFieldName];
    }
  }

  isString(obj: any) {
    return (typeof (obj) === 'string');
  }

  // To see if a value is null, undefined, empty....
  isEmpty(field) {
    return this.fieldService.isEmpty(field, 'table');
  }
}
