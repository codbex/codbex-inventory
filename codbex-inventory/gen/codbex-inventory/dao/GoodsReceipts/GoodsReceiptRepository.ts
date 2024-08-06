import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface GoodsReceiptEntity {
    readonly Id: number;
    Date: Date;
    Number?: string;
    Store?: number;
    Company?: number;
    Currency?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
    Name: string;
    UUID?: string;
    Reference?: string;
}

export interface GoodsReceiptCreateEntity {
    readonly Date: Date;
    readonly Store?: number;
    readonly Company?: number;
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
            Date?: Date | Date[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
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

interface GoodsReceiptUpdateEntityEvent extends GoodsReceiptEntityEvent {
    readonly previousEntity: GoodsReceiptEntity;
}

export class GoodsReceiptRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PURCHASEORDER_NUMBER",
        properties: [
            {
                name: "Id",
                column: "GOODSRECEIPT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "GOODSRECEIPT_DATE",
                type: "DATE",
                required: true
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
                name: "Currency",
                column: "GOODSRECEIPT_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "GOODSRECEIPT_NET",
                type: "DECIMAL",
            },
            {
                name: "VAT",
                column: "GOODSRECEIPT_VAT",
                type: "DECIMAL",
            },
            {
                name: "Gross",
                column: "GOODSRECEIPT_GROSS",
                type: "DECIMAL",
            },
            {
                name: "Name",
                column: "GOODSRECEIPTS_NAME",
                type: "VARCHAR",
                required: true
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

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GoodsReceiptRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GoodsReceiptEntityOptions): GoodsReceiptEntity[] {
        // @ts-ignore
        if (options.$sort === undefined) {
            // @ts-ignore
            options.$sort = "";
        }
        // @ts-ignore
        options.$sort += "Number,";
        // @ts-ignore
        options.$order = "DESC";
        return this.dao.list(options).map((e: GoodsReceiptEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): GoodsReceiptEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: GoodsReceiptCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as GoodsReceiptEntity).Number = new NumberGeneratorService().generate(16);
        // @ts-ignore
        (entity as GoodsReceiptEntity).Name = entity["Number"] + "/" + new Date(entity["Date"]).toISOString().slice(0, 10) + "/" + entity["Gross"];
        // @ts-ignore
        (entity as GoodsReceiptEntity).UUID = require("sdk/utils/uuid").random();
        if (entity.Net === undefined || entity.Net === null) {
            (entity as GoodsReceiptEntity).Net = 0;
        }
        if (entity.VAT === undefined || entity.VAT === null) {
            (entity as GoodsReceiptEntity).VAT = 0;
        }
        if (entity.Gross === undefined || entity.Gross === null) {
            (entity as GoodsReceiptEntity).Gross = 0;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PURCHASEORDER_NUMBER",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoodsReceiptUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PURCHASEORDER_NUMBER",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "GOODSRECEIPT_ID",
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
            table: "CODBEX_PURCHASEORDER_NUMBER",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSRECEIPT_ID",
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

    private async triggerEvent(data: GoodsReceiptEntityEvent | GoodsReceiptUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-GoodsReceipts-GoodsReceipt", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-GoodsReceipts-GoodsReceipt").send(JSON.stringify(data));
    }
}
