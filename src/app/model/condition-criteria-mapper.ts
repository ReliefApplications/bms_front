import { ConditionCriteria } from "./condition-criteria";

export class ConditionCriteriaMapper {

    /**
    * mapping between type and conditions
    */
    public static mapConditionCriteria(type: string): ConditionCriteria[] {
        if ((type == 'number') || (type == 'date')) {
            return [
                new ConditionCriteria('>'), 
                new ConditionCriteria('<'), 
                new ConditionCriteria('>='),
                new ConditionCriteria('<='), 
                new ConditionCriteria('='),
                new ConditionCriteria('!=')
            ];
        } else {
            return [
                new ConditionCriteria('='),
                new ConditionCriteria('!=')
            ];
        }
    }
}
