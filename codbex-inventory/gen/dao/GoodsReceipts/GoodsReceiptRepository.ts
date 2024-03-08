import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface GoodsReceiptEntity {
    readonly Id: number;
    Number?: string;
    Store?: number;
    Company?: number;
    Name?: string;
    Currency?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
    UUID?: string;
    Reference?: string;
}

export interface GoodsReceiptCreateEntity {
    readonly Store?: number;
    readonly Company?: number;
    readonly Name?: string;
    readonly Currency?: number;
    readonly Net?: number;
    readonly VAT?: number;
    readonly Gross?: number;
    readonly Reference?: string;
}

export interface GoodsReceiptUpdateEntity extends GoodsReceiptCreateEntity {
    readonly Id: number;
}

export interface GoodsReceiptEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Name?: string | string[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Name?: string | string[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
    },
    $select?: (keyof GoodsReceiptEntity)[],
    $sort?: string | (keyof GoodsReceiptEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface GoodsReceiptEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GoodsReceiptEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class GoodsReceiptRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GOODSRECEIPT",
        properties: [
            {
                name: "Id",
                column: "GOODSRECEIPTS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "GOODSRECEIPTS_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Store",
                column: "GOODSRECEIPTS_STORE",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "GOODSRECEIPTS_COMPANY",
                type: "INTEGER",
            },
            {
                name: "Name",
                column: "GOODSRECEIPTS_NAME",
                type: "VARCHAR",
            },
            {
                name: "Currency",
                column: "GOODSRECEIPT_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "GOODSRECEIPT_NET",
                type: "DOUBLE",
            },
            {
                name: "VAT",
                column: "GOODSRECEIPT_VAT",
                type: "DOUBLE",
            },
            {
                name: "Gross",
                column: "GOODSRECEIPT_GROSS",
                type: "DOUBLE",
            },
            {
                name: "UUID",
                column: "GOODSRECEIPTS_UUID",
                type: "VARCHAR",
            },
            {
                name: "Reference",
                column: "GOODSRECEIPTS_REFERENCE",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(GoodsReceiptRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GoodsReceiptEntityOptions): GoodsReceiptEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GoodsReceiptEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GoodsReceiptCreateEntity): number {
        // @ts-ignore
        (entity as GoodsReceiptEntity).Number = new NumberGeneratorService().generate(16);
        // @ts-ignore
        (entity as GoodsReceiptEntity).UUID = require("sdk/utils/uuid").random();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GOODSRECEIPT",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoodsReceiptUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOODSRECEIPT",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GoodsReceiptCreateEntity | GoodsReceiptUpdateEntity): number {
        const id = (entity as GoodsReceiptUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GoodsReceiptUpdateEntity);
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
            table: "CODBEX_GOODSRECEIPT",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPTS_ID",
                value: id
            }
        });
    }

    public count(options?: GoodsReceiptEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOODSRECEIPT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GoodsReceiptEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-GoodsReceipts-GoodsReceipt", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory/GoodsReceipts/GoodsReceipt").send(JSON.stringify(data));
    }
}