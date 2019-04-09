import { Component, OnInit, Input } from '@angular/core';
import { Beneficiary } from 'src/app/model/beneficiary.new';
import { FormGroup } from '@angular/forms';
import { GlobalText } from 'src/texts/global';
import { Criteria } from 'src/app/model/criteria.new';

@Component({
  selector: 'app-beneficiary-form',
  templateUrl: './beneficiary-form.component.html',
  styleUrls: ['./beneficiary-form.component.scss', '../update-beneficiary.component.scss']
})
export class BeneficiaryFormComponent implements OnInit {

  @Input() form: FormGroup;
  @Input() options: Object;

  public Text = GlobalText.TEXTS;

  constructor() { }

  ngOnInit() {
  }

}
