import { CustomModelField } from './custom-model-field';

export class FileModelField extends CustomModelField<string> {
    kindOfField = 'File';

     /**
     * The path to upload the file
     * @type {string}
     */
    uploadPath: string;

    /**
     * The field containing the url of the uploaded file
     * @type {string}
     */
    fileUrlField: string;

    constructor(properties: any) {
        super(properties);
        this.uploadPath              = properties['uploadPath'];
        this.fileUrlField              = properties['fileUrlField'];
    }
}
