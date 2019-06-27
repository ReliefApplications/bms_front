export class StoredRequest {
    method: string;
    url: string;
    body?: any;
    options: any;
    date: Date;
}

export class FailedRequest {
    request: StoredRequest;
    error: any;
}
