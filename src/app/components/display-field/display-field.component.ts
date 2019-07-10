import { Component, Input, OnInit } from '@angular/core';
import { FormService } from 'src/app/core/utils/form.service';
import { TextModelField } from 'src/app/models/custom-models/text-model-field';
import { LanguageService } from 'src/app/core/language/language.service';

@Component({
  selector: 'app-display-field',
  templateUrl: './display-field.component.html',
  styleUrls: ['display-field.component.scss']
})
export class DisplayFieldComponent implements OnInit {

  @Input() field;
  @Input() element;
  public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;


  readonly MAX_PROP_LENGTH = 20;

  constructor(
    public formService: FormService,
    public languageService: LanguageService,
  ) { }

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

  makeList(array: Array<any>, field) {
    return array && array.length > 0 ? array.map(value => value.get(field.bindField)).join(', ') : '';
  }
}
