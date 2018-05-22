export interface CachedItemInterface {
    /**
     * Time out after which the cached item expires
     * @type {number}
     */
    limit?: number;

    /**
     * Creation date
     * @type {number}
     */
    storageTime?: number;

    /**
     * Value stored
     * @type {any}
     */
    value?: any;

    /**
     * option which prevent the deletion of this item
     * @type {boolean}
     */
    canBeDeleted?: boolean;
}
