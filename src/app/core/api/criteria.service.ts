import { Injectable } from '@angular/core';
import { LanguageService } from 'src/app/core/language/language.service';
import { Criteria, CriteriaCondition } from 'src/app/models/criteria';
import { CustomModelService } from '../utils/custom-model.service';
import { HttpService } from '../network/http.service';

@Injectable({
    providedIn: 'root'
})
export class CriteriaService extends CustomModelService {

    customModelPath = 'distributions/criteria';
    constructor(
        protected http: HttpService,
        protected languageService: LanguageService,
    ) {
        super(http, languageService);
    }

    public getBeneficiariesNumber(distributionType: string, criteriaArray: Criteria[], threshold: number, project: string) {
        const criteriaArrayForApi = [];
        criteriaArray.forEach(criterion => {
            criteriaArrayForApi.push(criterion.modelToApi());
        });
        const body = { 'distribution_type' : distributionType, 'criteria' : criteriaArrayForApi, 'threshold': threshold };
        const url = this.apiBase + '/distributions/criteria/project/' + project + '/number';
        return this.http.post(url, body);
    }

    /**
     * get the lit of vulnerability criteria
     */
    public getVulnerabilityCriteria() {
        const url = this.apiBase + '/vulnerability_criteria';
        return this.http.get(url);
    }

    fillConditionOptions(criteria: Criteria, fieldName: string) {
            const conditions = new Array<CriteriaCondition>();
            let conditionNames = [];

            if ((fieldName === 'dateOfBirth') || (fieldName === 'headOfHouseholdDateOfBirth') || fieldName === 'numberDependents') {
                conditionNames = ['>', '<', '>=', '<=', '=', '!='];
            }  else if (fieldName === 'gender' || fieldName === 'equityCardNo' ||
                fieldName === 'headOfHouseholdGender' || fieldName === 'residencyStatus') {
                conditionNames = ['=', '!='];
            } else if (fieldName === 'IDPoor' || fieldName === 'livelihood' || fieldName === 'foodConsumptionScore' ||
                fieldName === 'copingStrategiesIndex' || fieldName === 'incomeLevel') {
                conditionNames = ['='];
            } else {
                conditionNames = ['true', 'false'];
            }

            conditionNames.forEach((name, index) => {
                const condition = new CriteriaCondition(index.toString(), name);
                conditions.push(condition);
            });
            criteria.setOptions('condition', conditions);
    }
}

