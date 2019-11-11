import { Component, EventEmitter, Input, OnInit, OnDestroy, AfterViewInit, Output } from '@angular/core';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { LanguageService } from 'src/app/core/language/language.service';
import { LocationService } from 'src/app/core/api/location.service';
import { Location } from 'src/app/models/location';
import { CustomModel } from 'src/app/models/custom-models/custom-model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-json-form',
  templateUrl: './json-form.component.html',
  styleUrls: ['./json-form.component.scss', '../modals/modal-fields/modal-fields.component.scss']
})
export class JsonFormComponent implements AfterViewInit, OnDestroy {

    @Input() form: FormGroup;
    @Output() changeData = new EventEmitter<any>();
    @Output() changeForm = new EventEmitter<any>();

    constructor(
        public languageService: LanguageService,
        public locationService: LocationService
    ) { }

    public language = this.languageService.selectedLanguage ? this.languageService.selectedLanguage : this.languageService.english ;

    ngAfterViewInit() {
    }

    ngOnDestroy() {
    }
}
