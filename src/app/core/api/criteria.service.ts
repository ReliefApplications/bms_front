import { Injectable                                 } from '@angular/core';
import { HttpService                                } from './http.service';
import { CustomModelService } from './custom-model.service';
import { Criteria } from 'src/app/model/criteria.new';
import { ConditionCriteria } from 'src/app/model/condition-criteria';

@Injectable({
    providedIn: 'root'
})
export class CriteriaService extends CustomModelService {

    customModelPath = 'distributions/criteria';
    constructor(
        protected http: HttpService
    ) {
        super(http);
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

    fillFieldOptions(criteria: Criteria) {
        this.get()
            .subscribe((options) => {
                const fields = options.map(criterion => {
                    return Criteria.apiToModel(criterion);
                });
                criteria.setOptions('fields', fields);
                return;
            });
    }

    fillConditionOptions(criteria: Criteria, fieldName: string) {
            const conditions = new Array<ConditionCriteria>();
            let conditionNames = [];

            if ((fieldName === 'dateOfBirth')) {
                conditionNames = ['>', '<', '>=', '<=', '=', '!='];
            }  else if ((fieldName === 'gender') || (fieldName === 'equityCardNo')) {
                conditionNames = ['=', '!='];
            } else if (fieldName === 'IDPoor') {
                conditionNames = ['='];
            } else {
                conditionNames = ['true', 'false'];
            }

            conditionNames.forEach(name => {
                const condition = new ConditionCriteria();
                condition.set('name', name);
                conditions.push(condition);
            });
            criteria.setOptions('condition', conditions);
    }
}

