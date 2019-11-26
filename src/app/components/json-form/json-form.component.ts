import { Component, EventEmitter, Input, AfterViewInit, Output } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { LocationService } from 'src/app/core/api/location.service';

@Component({
    selector: 'app-json-form',
    templateUrl: './json-form.component.html',
    styleUrls: ['./json-form.component.scss', '../modals/modal-fields/modal-fields.component.scss']
})
export class JsonFormComponent implements AfterViewInit {

    @Input() form: FormGroup;
    @Input() initialValues: any;
    @Input() schema: Object;
    @Output() changeData = new EventEmitter<any>();
    @Output() changeForm = new EventEmitter<any>();
    formStructure = [];
    constructor(
        public languageService: LanguageService,
        public locationService: LocationService
    ) { }

    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english;

    ngAfterViewInit() {
        // Get the name of the parameters associated with the service and the initial values to fill the form
        Object.keys(this.schema).forEach(parameter => {
            this.schema[parameter]['name'] = parameter;
            this.formStructure.push(this.schema[parameter]);
            this.form.addControl(parameter,
                new FormControl(this.initialValues && this.initialValues[parameter] ? this.initialValues[parameter] : null));
        });
        this.changeForm.emit();
    }
}
