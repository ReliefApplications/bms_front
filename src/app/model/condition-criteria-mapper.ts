import { ConditionCriteria } from './condition-criteria';

export class ConditionCriteriaMapper {

    /**
    * mapping between type and conditions
    */
    public static mapConditionCriteria(type: string): ConditionCriteria[] {
        if ((type === 'number') || (type === 'date')) {
            return [
                new ConditionCriteria('>'),
                new ConditionCriteria('<'),
                new ConditionCriteria('>='),
                new ConditionCriteria('<='),
                new ConditionCriteria('='),
                new ConditionCriteria('!=')
            ];
        } else if (type == null) {
            return [
                new ConditionCriteria('true'),
                new ConditionCriteria('false')
            ];
        } else {
            return [
                new ConditionCriteria('='),
                new ConditionCriteria('!=')
            ];
        }
    }
}
