import { DistributionData                                  } from "./distribution-data";
import { Donor                                             } from "./donor";
import { Project                                           } from "./project";
import { UserInterface                                     } from "./interfaces";

export class FieldMapper{
    distribution_data         = DistributionData.translator()
    donor                     = Donor.translator()
    project                   = Project.translator()
    user                      = UserInterface.translator()
}
