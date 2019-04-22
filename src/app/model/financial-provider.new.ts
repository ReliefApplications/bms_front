import { GlobalText } from 'src/texts/global';
import { CustomModel } from './CustomModel/custom-model';
import { TextModelField } from './CustomModel/text-model-field';

export class ErrorInterface {
    message: string;
}

export class FinancialProvider extends CustomModel {

    public static rights = ['ROLE_ADMIN', 'ROLE_COUNTRY_MANAGER', 'ROLE_PROJECT_MANAGER'];

    title = GlobalText.TEXTS.settings_financial_provider;
    matSortActive = 'username';

    fields = {
        id: new TextModelField({
            // Not displayed anywhere
        }),
        username: new TextModelField({
            title: GlobalText.TEXTS.login_username,
            isDisplayedInTable: true,
            isDisplayedInModal: true,
            isEditable: true,
            isRequired: true,
        }),
        password: new TextModelField({
            title: GlobalText.TEXTS.model_password,
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
