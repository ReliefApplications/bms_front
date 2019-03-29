export const enum Role {
    fieldOfficer    = 'ROLE_FIELD_OFFICER',
    projectOfficer  = 'ROLE_PROJECT_OFFICER',
    projectManager  = 'ROLE_PROJECT_MANAGER',
    countryManager  = 'ROLE_COUNTRY_MANAGER',
    regionalManager = 'ROLE_REGIONAL_MANAGER',
    admin           = 'ROLE_ADMIN',
}

const nonAdminRightsHierarchy = {
    [Role.fieldOfficer]: [
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_READ',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
    ],
    [Role.projectOfficer]: [
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_REPORTING',
        'ROLE_BENEFICIARY_MANAGEMENT',
    ],
    [Role.projectManager]: [
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_REPORTING',
        'ROLE_BENEFICIARY_MANAGEMENT',
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_USER_MANAGEMENT',
    ],
    [Role.countryManager]: [
        'ROLE_USER_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_REPORTING',
        'ROLE_AUTHORISE_PAYMENT',
    ],
    [Role.regionalManager]: [
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_READ',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
    ],
    [Role.admin]: [
        'ROLE_ADMIN_SETTINGS',
    ]
};

// Admins have all the rights of other roles
const makeAdminRights = () => {
    let adminRights = Array<string>();
    for (const role of  Object.keys(nonAdminRightsHierarchy)) {
        adminRights = [...adminRights, ...nonAdminRightsHierarchy[role]];
    }
    return adminRights;
};

export const rightsHierarchy = {
    ...nonAdminRightsHierarchy,
    [Role.admin]: makeAdminRights()
};




