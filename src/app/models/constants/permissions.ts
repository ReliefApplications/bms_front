export const enum Role {
    fieldOfficer    = 'ROLE_FIELD_OFFICER',
    projectOfficer  = 'ROLE_PROJECT_OFFICER',
    projectManager  = 'ROLE_PROJECT_MANAGER',
    countryManager  = 'ROLE_COUNTRY_MANAGER',
    regionalManager = 'ROLE_REGIONAL_MANAGER',
    admin           = 'ROLE_ADMIN',
    enumerator      = 'ROLE_ENUMERATOR'
}

export const rightsHierarchy = {
    [Role.enumerator]: [
        'ROLE_ENUMERATOR',
        'ROLE_PROJECT_MANAGEMENT_ASSIGN'
    ],
    [Role.fieldOfficer]: [
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_DISTRIBUTIONS_MANAGEMENT',
        'ROLE_REPORTING_READ',
        'ROLE_PROJECT_MANAGEMENT_ASSIGN'
    ],
    [Role.projectOfficer]: [
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_BENEFICIARY_MANAGEMENT_WRITE',
        'ROLE_DISTRIBUTIONS_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_PROJECT_MANAGEMENT_ASSIGN'
    ],
    [Role.projectManager]: [
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_BENEFICIARY_MANAGEMENT_WRITE',
        'ROLE_DISTRIBUTIONS_MANAGEMENT',
        'ROLE_DISTRIBUTIONS_DIRECTOR',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT_ASSIGN',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_USER_MANAGEMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
    ],
    [Role.countryManager]: [
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT_ASSIGN',
        'ROLE_REPORTING',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_USER_MANAGEMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
        'ROLE_DONOR_MANAGEMENT'
    ],
    [Role.regionalManager]: [
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_REPORTING_READ',
        'ROLE_DONOR_MANAGEMENT',
    ],
    [Role.admin]: [
        // Not used, admin can do everything on the app
        // Admin only roles below
        // ROLE_ACCESS_ALL_COUNTRIES
    ]
};
