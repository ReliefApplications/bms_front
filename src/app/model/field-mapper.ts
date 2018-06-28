import { DistributionData                                  } from "./distribution-data";
import { Donor                                             } from "./donor";
import { Project                                           } from "./project";

export class FieldMapper{
    distribution_data         = DistributionData.translator()
    donor                     = Donor.translator()
    project                   = Project.translator()
}
