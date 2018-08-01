export class Indicator {
    static __classname__ = 'Indicator';
    /**
     * id of indicator to display
     * @type {number}
     */
    id: number;
    /**
     * Indicator's full name
     * @type {string}
     */
    full_name: string;
    /**
     * Indicator's graphique
     * @type {string}
     */
    type_graph: string;
    /**
     * Indicator's type
     * Here : Country, project or distribution
     * @type {string}
     */
    type: string
    /**
     * Indicator's filter
     * @type {Array}
     */
    filter: Array<string> = [];

    constructor(instance?){
        if(instance !== undefined){
            this.id = instance.id;
            this.full_name = instance.full_name;
            this.type_graph = instance.type_graph;
            this.type = instance.type;
            this.filter = instance.filter;
        }
    }

    public static FormatArray(instance: any): Indicator[] {
        let indicators: Indicator[] = [];
        instance.forEach(element => {
            indicators.push(this.formatIndicator(element));
        });
        return indicators;
    }
    
    public static formatIndicator(element: any): Indicator{
        let indicator = new Indicator;
        indicator.id = element.id;
        indicator.full_name = element.full_name;
        indicator.type_graph = element.type_graph;
        indicator.type = element.type;
        indicator.filter = element.filter;
        return indicator;
    }
}
