import { Injectable                                 } from '@angular/core';
import { HttpService                                } from './http.service';
import { CustomModelService } from './custom-model.service';
import { Criteria, CriteriaCondition, CriteriaField } from 'src/app/model/criteria.new';

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
                    return CriteriaField.apiToModel(criterion);
                });
                criteria.setOptions('field', fields);
                return;
            });
    }

    fillConditionOptions(criteria: Criteria, fieldName: string) {
            const conditions = new Array<CriteriaCondition>();
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

            conditionNames.forEach((name, index) => {
                const condition = new CriteriaCondition(index.toString(), name);
                conditions.push(condition);
            });
            criteria.setOptions('condition', conditions);
    }
}

