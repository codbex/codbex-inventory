import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GoodsReceiptItemEntity {
    readonly Id: number;
    GoodsReceipt?: number;
    Product?: number;
    Quantity?: number;
    UoM?: number;
    Price?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
}

export interface GoodsReceiptItemCreateEntity {
    readonly GoodsReceipt?: number;
    readonly Product?: number;
    readonly Quantity?: number;
    readonly UoM?: number;
    readonly Price?: number;
}

export interface GoodsReceiptItemUpdateEntity extends GoodsReceiptItemCreateEntity {
    readonly Id: number;
}

export interface GoodsReceiptItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            GoodsReceipt?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            GoodsReceipt?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
        };
        contains?: {
            Id?: number;
            GoodsReceipt?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        greaterThan?: {
            Id?: number;
            GoodsReceipt?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            GoodsReceipt?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        lessThan?: {
            Id?: number;
            GoodsReceipt?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            GoodsReceipt?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
    },
    $select?: (keyof GoodsReceiptItemEntity)[],
    $sort?: string | (keyof GoodsReceiptItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GoodsReceiptItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GoodsReceiptItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class GoodsReceiptItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GOODSRECEIPTITEM",
        properties: [
            {
                name: "Id",
                column: "GOODSRECEIPTITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "GoodsReceipt",
                column: "GOODSRECEIPTITEM_GOODSRECEIPT",
                type: "INTEGER",
            },
            {
                name: "Product",
                column: "GOODSRECEIPTITEM_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "GOODSRECEIPTITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "UoM",
                column: "GOODSRECEIPTITEM_UOM",
                type: "INTEGER",
            },
            {
                name: "Price",
                column: "GOODSRECEIPTITEM_PRICE",
                type: "DOUBLE",
            },
            {
                name: "Net",
                column: "GOODSRECEIPTITEM_NET",
                type: "DOUBLE",
            },
            {
                name: "VAT",
                column: "GOODSRECEIPTITEM_VAT",
                type: "DOUBLE",
            },
            {
                name: "Gross",
                column: "GOODSRECEIPTITEM_GROSS",
                type: "DOUBLE",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(GoodsReceiptItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GoodsReceiptItemEntityOptions): GoodsReceiptItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GoodsReceiptItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GoodsReceiptItemCreateEntity): number {
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).Net = entity["Quantity"] * entity["Price"];
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).VAT = entity["Net"] * 0.2;
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).Gross = entity["Net"] + entity["VAT"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GOODSRECEIPTITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoodsReceiptItemUpdateEntity): void {
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).Net = entity["Quantity"] * entity["Price"];
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).VAT = entity["Net"] * 0.2;
        // @ts-ignore
        (entity as GoodsReceiptItemEntity).Gross = entity["Net"] + entity["VAT"];
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOODSRECEIPTITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GoodsReceiptItemCreateEntity | GoodsReceiptItemUpdateEntity): number {
        const id = (entity as GoodsReceiptItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GoodsReceiptItemUpdateEntity);
            return id;
        } else {
            return this.create(entity);
        }
    }

    public deleteById(id: number): void {
        const entity = this.dao.find(id);
        this.dao.remove(id);
        this.triggerEvent({
            operation: "delete",
            table: "CODBEX_GOODSRECEIPTITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTITEM_ID",
                value: id
            }
        });
    }

    public count(options?: GoodsReceiptItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: GoodsReceiptItemEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOODSRECEIPTITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GoodsReceiptItemEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory/GoodsReceipts/GoodsReceiptItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory/GoodsReceipts/GoodsReceiptItem").send(JSON.stringify(data));
    }
}