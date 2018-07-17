export class SectorMapper{
    
    /**
    * mapping between sectors names and svg names
    */
    public static mapSectors(names: string[]): string[]{
       let svg_name = [];
        names.forEach(name => {
            svg_name.push(this.mapSector(name));
        });
        
        return svg_name;
    }

    /**
    * mapping for one sector
    */
    public static mapSector(name: string): string{
        if(!name){
            return "";
        }
        switch(name.toLowerCase()){
            case 'camp coordination and management':
            name = "cccm"; break;

            case 'early recovery':
            name = "early_recovery"; break;

            case 'education':
            name = "education"; break;

            case 'emergency telecommunications':
            name = "emergency_telecommunications"; break;

            case 'food security':
            name = "food_security"; break;

            case 'health':
            name = "health"; break;

            case 'logistics':
            name = "logistics"; break;

            case 'nutrition':
            name = "nutrition"; break;

            case 'protection':
            name = "protection"; break;

            case 'shelter':
            name = "shelter"; break;

            case 'water sanitation':
            name = "water_sanitation"; break;

        default: return name; 
        }
        return name; 
    }
}
