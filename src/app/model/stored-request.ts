
export interface StoredRequestInterface {
    method: string,
    url: string;
    body?: any;
    options: any;
    date: Date;
}

export interface failedRequestInterface {
    fail: boolean,
    request: StoredRequestInterface,
    error: any,
}