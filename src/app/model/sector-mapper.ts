export class SectorMapper{
    
    public static mapSector(name){

        switch(name.toLowerCase()){
            case 'camp coordination and management':
            name = "coordination_management"; break;

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

        default: return name; 
        }
        return name; 
    }
}
