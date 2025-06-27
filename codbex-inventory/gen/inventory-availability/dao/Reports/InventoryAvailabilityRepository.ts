import { Query, NamedQueryParameter } from "sdk/db";

export interface InventoryAvailability {
    readonly 'Product ID': number;
    readonly 'Product Number': string;
    readonly 'Product Name': string;
    readonly 'Quantity Available': number;
    readonly 'Store ': string;
    readonly 'Manufacturer': string;
}

export interface InventoryAvailabilityFilter {
    readonly 'Store?': string;
}

export interface InventoryAvailabilityPaginatedFilter extends InventoryAvailabilityFilter {
    readonly "$limit"?: number;
    readonly "$offset"?: number;
}

export class InventoryAvailabilityRepository {

    private readonly datasourceName?: string;

    constructor(datasourceName?: string) {
        this.datasourceName = datasourceName;
    }

    public findAll(filter: InventoryAvailabilityPaginatedFilter): InventoryAvailability[] {
        const sql = `
            SELECT Product.PRODUCT_ID as "Product ID", Product.PRODUCT_BATCH as "Product Number", Product.PRODUCT_NAME as "Product Name", Catalogue.CATALOGUE_QUANTITY as "Quantity Available", Store.STORE_NAME as "Store ", Manufacturer.MANUFACTURER_NAME as "Manufacturer"
            FROM CODBEX_PRODUCT as Product
              INNER JOIN CODBEX_CATALOGUE Catalogue ON Catalogue.CATALOGUE_PRODUCT = Product.PRODUCT_ID
              INNER JOIN CODBEX_STORE Store ON Store.STORE_ID=Catalogue.CATALOGUE_STORE
              INNER JOIN CODBEX_MANUFACTURER Manufacturer ON Manufacturer.MANUFACTURER_ID = Product.PRODUCT_MANUFACTURER
            WHERE Store.STORE_NAME = :Store
            ${Number.isInteger(filter.$limit) ? ` LIMIT ${filter.$limit}` : ''}
            ${Number.isInteger(filter.$offset) ? ` OFFSET ${filter.$offset}` : ''}
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `Store`,
            type: `VARCHAR`,
            value: filter['Store'] !== undefined ?  filter['Store'] : `'Mydeo'`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName);
    }

    public count(filter: InventoryAvailabilityFilter): number {
        const sql = `
            SELECT COUNT(*) as REPORT_COUNT FROM (
                SELECT Product.PRODUCT_ID as "Product ID", Product.PRODUCT_BATCH as "Product Number", Product.PRODUCT_NAME as "Product Name", Catalogue.CATALOGUE_QUANTITY as "Quantity Available", Store.STORE_NAME as "Store ", Manufacturer.MANUFACTURER_NAME as "Manufacturer"
                FROM CODBEX_PRODUCT as Product
                  INNER JOIN CODBEX_CATALOGUE Catalogue ON Catalogue.CATALOGUE_PRODUCT = Product.PRODUCT_ID
                  INNER JOIN CODBEX_STORE Store ON Store.STORE_ID=Catalogue.CATALOGUE_STORE
                  INNER JOIN CODBEX_MANUFACTURER Manufacturer ON Manufacturer.MANUFACTURER_ID = Product.PRODUCT_MANUFACTURER
                WHERE Store.STORE_NAME = :Store
            )
        `;

        const parameters: NamedQueryParameter[] = [];
        parameters.push({
            name: `Store`,
            type: `VARCHAR`,
            value: filter.Store !== undefined ?  filter.Store : `'Mydeo'`
        });

        return Query.executeNamed(sql, parameters, this.datasourceName)[0].REPORT_COUNT;
    }

}