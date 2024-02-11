import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GoodsReceiptItemEntity {
    readonly Id: number;
    GoodsReceipt?: number;
}

export interface GoodsReceiptItemCreateEntity {
    readonly GoodsReceipt?: number;
}

export interface GoodsReceiptItemUpdateEntity extends GoodsReceiptItemCreateEntity {
    readonly Id: number;
}

export interface GoodsReceiptItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            GoodsReceipt?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            GoodsReceipt?: number | number[];
        };
        contains?: {
            Id?: number;
            GoodsReceipt?: number;
        };
        greaterThan?: {
            Id?: number;
            GoodsReceipt?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            GoodsReceipt?: number;
        };
        lessThan?: {
            Id?: number;
            GoodsReceipt?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            GoodsReceipt?: number;
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



    public count(GoodsReceipt: number): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOODSRECEIPTITEM" WHERE "GOODSRECEIPTITEM_GOODSRECEIPT" = ?', [GoodsReceipt]);
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    public customDataCount(): number {
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
        producer.queue("codbex-inventory/GoodsReceipts/GoodsReceiptItem").send(JSON.stringify(data));
    }
}