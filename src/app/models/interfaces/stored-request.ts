export class StoredRequest {
    method: string;
    url: string;
    options: any;
    date: Date;
    body?: any;

    constructor(method: string, url: string, options: any, date: Date, body?: any) {
        this.method = method;
        this.url = url;
        this.options = options;
        this.date = date;
        if (body) {
            this.body = body;
        }
    }
}

export class FailedRequest {
    request: StoredRequest;
    error: any;

    constructor(request: StoredRequest, error: any) {
        this.request = request;
        this.error = error;
    }
}
