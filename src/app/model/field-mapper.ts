import { DistributionData                                  } from "./distribution-data";
import { Donor                                             } from "./donor";

export class FieldMapper{
    distribution_data         = DistributionData.translator()
    donor                     = Donor.translator()
}
