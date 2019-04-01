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
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_READ',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
    ],
    [Role.projectOfficer]: [
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_BENEFICIARY_MANAGEMENT',
    ],
    [Role.projectManager]: [
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_REPORTING',
        'ROLE_REPORTING_PROJECT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT',
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_USER_MANAGEMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
    ],
    [Role.countryManager]: [
        'ROLE_USER_MANAGEMENT',
        'ROLE_PROJECT_MANAGEMENT',
        'ROLE_BENEFICIARY_EXPORT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
        'ROLE_REPORTING',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_AUTHORISE_PAYMENT',
        'ROLE_VIEW_ADMIN_SETTINGS',
    ],
    [Role.regionalManager]: [
        'ROLE_PROJECT_MANAGEMENT_READ',
        'ROLE_REPORTING_READ',
        'ROLE_REPORTING_COUNTRY',
        'ROLE_REPORTING_PROJECT',
        'ROLE_BENEFICIARY_MANAGEMENT_READ',
    ],
    [Role.admin]: [
        // Not used, admin can do everything on the app
    ]
};



