import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";

export interface StockRecordEntity {
    readonly Id: number;
    Reference?: string;
    Product?: number;
    Quantity?: number;
    UoM: number;
    Price?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
    Direction?: number;
    ItemId?: number;
    Deleted?: boolean;
}

export interface StockRecordCreateEntity {
    readonly Reference?: string;
    readonly Product?: number;
    readonly Quantity?: number;
    readonly UoM: number;
    readonly Price?: number;
    readonly Net?: number;
    readonly VAT?: number;
    readonly Gross?: number;
    readonly Direction?: number;
    readonly ItemId?: number;
    readonly Deleted?: boolean;
}

export interface StockRecordUpdateEntity extends StockRecordCreateEntity {
    readonly Id: number;
}

export interface StockRecordEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Reference?: string | string[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Direction?: number | number[];
            ItemId?: number | number[];
            Deleted?: boolean | boolean[];
        };
        notEquals?: {
            Id?: number | number[];
            Reference?: string | string[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Direction?: number | number[];
            ItemId?: number | number[];
            Deleted?: boolean | boolean[];
        };
        contains?: {
            Id?: number;
            Reference?: string;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Direction?: number;
            ItemId?: number;
            Deleted?: boolean;
        };
        greaterThan?: {
            Id?: number;
            Reference?: string;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Direction?: number;
            ItemId?: number;
            Deleted?: boolean;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Reference?: string;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Direction?: number;
            ItemId?: number;
            Deleted?: boolean;
        };
        lessThan?: {
            Id?: number;
            Reference?: string;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Direction?: number;
            ItemId?: number;
            Deleted?: boolean;
        };
        lessThanOrEqual?: {
            Id?: number;
            Reference?: string;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Direction?: number;
            ItemId?: number;
            Deleted?: boolean;
        };
    },
    $select?: (keyof StockRecordEntity)[],
    $sort?: string | (keyof StockRecordEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StockRecordEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockRecordEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StockRecordRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKRECORD",
        properties: [
            {
                name: "Id",
                column: "STOCKRECORD_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Reference",
                column: "STOCKRECORD_REFERENCE",
                type: "VARCHAR",
            },
            {
                name: "Product",
                column: "STOCKRECORD_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "STOCKRECORD_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "UoM",
                column: "STOCKRECORD_UOM",
                type: "INTEGER",
                required: true
            },
            {
                name: "Price",
                column: "STOCKRECORD_PRICE",
                type: "DECIMAL",
            },
            {
                name: "Net",
                column: "STOCKRECORD_NET",
                type: "DECIMAL",
            },
            {
                name: "VAT",
                column: "STOCKRECORD_VAT",
                type: "DECIMAL",
            },
            {
                name: "Gross",
                column: "STOCKRECORD_GROSS",
                type: "DECIMAL",
            },
            {
                name: "Direction",
                column: "STOCKRECORD_DIRECTION",
                type: "INTEGER",
            },
            {
                name: "ItemId",
                column: "STOCKRECORD_ITEMID",
                type: "INTEGER",
            },
            {
                name: "Deleted",
                column: "STOCKRECORD_DELETED",
                type: "BOOLEAN",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StockRecordRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StockRecordEntityOptions): StockRecordEntity[] {
        return this.dao.list(options).map((e: StockRecordEntity) => {
            EntityUtils.setBoolean(e, "Deleted");
            return e;
        });
    }

    public findById(id: number): StockRecordEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setBoolean(entity, "Deleted");
        return entity ?? undefined;
    }

    public create(entity: StockRecordCreateEntity): number {
        EntityUtils.setBoolean(entity, "Deleted");
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKRECORD",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORD_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockRecordUpdateEntity): void {
        EntityUtils.setBoolean(entity, "Deleted");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKRECORD",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORD_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockRecordCreateEntity | StockRecordUpdateEntity): number {
        const id = (entity as StockRecordUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockRecordUpdateEntity);
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
            table: "CODBEX_STOCKRECORD",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORD_ID",
                value: id
            }
        });
    }

    public count(options?: StockRecordEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKRECORD"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockRecordEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-StockRecords-StockRecord", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-StockRecords-StockRecord").send(JSON.stringify(data));
    }
}
