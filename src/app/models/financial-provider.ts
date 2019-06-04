import { CustomModel } from './custom-models/custom-model';
import { TextModelField } from './custom-models/text-model-field';

export class FinancialProvider extends CustomModel {

    public static rights = ['ROLE_ADMIN', 'ROLE_COUNTRY_MANAGER', 'ROLE_PROJECT_MANAGER'];

    title = this.language.settings_financial_provider;
    matSortActive = 'username';

    fields = {
        id: new TextModelField({
            // Not displayed anywhere
        }),
        username: new TextModelField({
            title: this.language.login_username,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isRequired: true,
        }),
        password: new TextModelField({
            title: this.language.password,
            isDisplayedInModal: true,
            isEditable: true,
            isPassword: true,
            pattern:  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
        }),
        // saltedPassword: new TextModelField({}),
    };

    public static apiToModel(financialProviderFromApi: any): FinancialProvider {
        const newFinancialProvider = new FinancialProvider();

        newFinancialProvider.set('id', financialProviderFromApi.id);
        newFinancialProvider.set('username', financialProviderFromApi.username);
        newFinancialProvider.set('password', '');

        return newFinancialProvider;
    }
}
