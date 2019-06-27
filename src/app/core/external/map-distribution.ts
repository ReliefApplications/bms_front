export class MapCodeDistribution {
    adm_level: string;
    code_location: string;
    distribution: Array<MapDistribution>;
}

class MapDistribution {
    date: string;
    location_name: string;
    name: string;
    project_name: string;
}
