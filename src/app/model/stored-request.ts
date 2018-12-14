
export interface storedRequestInterface {
    url: string;
    body?: any;
    options: any;
    date: Date;
}

export class StoredRequests {
    PUT: Array<storedRequestInterface>;
    POST: Array<storedRequestInterface>;
    DELETE: Array<storedRequestInterface>;

    constructor(instance?) {
        this.PUT = instance? instance.PUT : [];
        this.POST = instance? instance.POST : [];
        this.DELETE = instance? instance.DELETE : [];
    }

    public containsRequest() : boolean {
        if(this.PUT && this.PUT.length > 0) {
            return true;
        } else if(this.POST && this.POST.length > 0) {
            return true;
        } else if(this.DELETE && this.DELETE.length > 0) {
            return true;
        } else {
            return false;
        }
    }
}