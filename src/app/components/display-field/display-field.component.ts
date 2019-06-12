import { Component, OnInit, Input } from '@angular/core';
import { FormService } from 'src/app/core/utils/form.service';
import { TextModelField } from 'src/app/models/custom-models/text-model-field';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['display-field.component.scss']
})
export class DisplayFieldComponent implements OnInit {

  @Input() field;
  @Input() element;
  readonly MAX_PROP_LENGTH = 20;

  constructor(public formService: FormService) { }

  ngOnInit() {

    if (this.field.kindOfField === 'Children') {
      this.field = this.element.get(this.field.childrenObject) ?
        this.element.get(this.field.childrenObject).fields[this.field.childrenFieldName] :
        new TextModelField({});
    }
  }

  isString(obj: any) {
    return (typeof (obj) === 'string');
  }

  // To see if a value is null, undefined, empty....
  isEmpty(field) {
    return this.formService.isEmpty(field, 'table');
  }
}
