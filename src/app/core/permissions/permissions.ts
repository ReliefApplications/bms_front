export const enum Role {
    fieldOfficer    = 'ROLE_FIELD_OFFICER',
    projectOfficer  = 'ROLE_PROJECT_OFFICER',
    projectManager  = 'ROLE_PROJECT_MANAGER',
    countryManager  = 'ROLE_COUNTRY_MANAGER',
    regionalManager = 'ROLE_REGIONAL_MANAGER',
    admin           = 'ROLE_ADMIN',
}

export const rightsHierarchy = {
    [Role.fieldOfficer]: [
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_READ',
        'ROLE_SWITCH_COUNTRY',
    ],
    [Role.projectOfficer]: [
        'ROLE_BENEFICIARY_MANAGEMENT',
        'ROLE_DISTRIBUTIONS_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_SWITCH_COUNTRY',
    ],
    [Role.projectManager]: [
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT',
        'ROLE_DISTRIBUTIONS_MANAGEMENT',
        'ROLE_DISTRIBUTIONS_DIRECTOR',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_USER_MANAGEMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
        'ROLE_SWITCH_COUNTRY',
    ],
    [Role.countryManager]: [
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_REPORTING',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_USER_MANAGEMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
    ],
    [Role.regionalManager]: [
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_REPORTING_READ',
    ],
    [Role.admin]: [
        // Not used, admin can do everything on the app
        // Admin only roles below
        // ROLE_ACCESS_ALL_COUNTRIES
    ]
};


