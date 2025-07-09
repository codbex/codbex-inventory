import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StockAdjustmentItemEntity {
    readonly Id: number;
    StockAdjustment?: number;
    Product: number;
    UoM?: number;
    AdjustedQuantity: number;
    Batch?: string;
    Serial?: string;
    Description?: string;
}

export interface StockAdjustmentItemCreateEntity {
    readonly StockAdjustment?: number;
    readonly Product: number;
    readonly UoM?: number;
    readonly AdjustedQuantity: number;
    readonly Batch?: string;
    readonly Serial?: string;
    readonly Description?: string;
}

export interface StockAdjustmentItemUpdateEntity extends StockAdjustmentItemCreateEntity {
    readonly Id: number;
}

export interface StockAdjustmentItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            StockAdjustment?: number | number[];
            Product?: number | number[];
            UoM?: number | number[];
            AdjustedQuantity?: number | number[];
            Batch?: string | string[];
            Serial?: string | string[];
            Description?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            StockAdjustment?: number | number[];
            Product?: number | number[];
            UoM?: number | number[];
            AdjustedQuantity?: number | number[];
            Batch?: string | string[];
            Serial?: string | string[];
            Description?: string | string[];
        };
        contains?: {
            Id?: number;
            StockAdjustment?: number;
            Product?: number;
            UoM?: number;
            AdjustedQuantity?: number;
            Batch?: string;
            Serial?: string;
            Description?: string;
        };
        greaterThan?: {
            Id?: number;
            StockAdjustment?: number;
            Product?: number;
            UoM?: number;
            AdjustedQuantity?: number;
            Batch?: string;
            Serial?: string;
            Description?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            StockAdjustment?: number;
            Product?: number;
            UoM?: number;
            AdjustedQuantity?: number;
            Batch?: string;
            Serial?: string;
            Description?: string;
        };
        lessThan?: {
            Id?: number;
            StockAdjustment?: number;
            Product?: number;
            UoM?: number;
            AdjustedQuantity?: number;
            Batch?: string;
            Serial?: string;
            Description?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            StockAdjustment?: number;
            Product?: number;
            UoM?: number;
            AdjustedQuantity?: number;
            Batch?: string;
            Serial?: string;
            Description?: string;
        };
    },
    $select?: (keyof StockAdjustmentItemEntity)[],
    $sort?: string | (keyof StockAdjustmentItemEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface StockAdjustmentItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockAdjustmentItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StockAdjustmentItemUpdateEntityEvent extends StockAdjustmentItemEntityEvent {
    readonly previousEntity: StockAdjustmentItemEntity;
}

export class StockAdjustmentItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKADJUSTMENTITEM",
        properties: [
            {
                name: "Id",
                column: "STOCKADJUSTMENTITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "StockAdjustment",
                column: "STOCKADJUSTMENTITEM_STOCKADJUSTMENT",
                type: "INTEGER",
            },
            {
                name: "Product",
                column: "STOCKADJUSTMENTITEM_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "UoM",
                column: "STOCKADJUSTMENTITEM_UOM",
                type: "INTEGER",
            },
            {
                name: "AdjustedQuantity",
                column: "STOCKADJUSTMENTITEM_ADJUSTEDQUANTITY",
                type: "INTEGER",
                required: true
            },
            {
                name: "Batch",
                column: "STOCKADJUSTMENTITEM_BATCH",
                type: "VARCHAR",
            },
            {
                name: "Serial",
                column: "STOCKADJUSTMENTITEM_SERIAL",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "STOCKADJUSTMENTITEM_DESCRIPTION",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StockAdjustmentItemRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: StockAdjustmentItemEntityOptions = {}): StockAdjustmentItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StockAdjustmentItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StockAdjustmentItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKADJUSTMENTITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockAdjustmentItemUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKADJUSTMENTITEM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockAdjustmentItemCreateEntity | StockAdjustmentItemUpdateEntity): number {
        const id = (entity as StockAdjustmentItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockAdjustmentItemUpdateEntity);
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
            table: "CODBEX_STOCKADJUSTMENTITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTITEM_ID",
                value: id
            }
        });
    }

    public count(options?: StockAdjustmentItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKADJUSTMENTITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockAdjustmentItemEntityEvent | StockAdjustmentItemUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-StockAdjustments-StockAdjustmentItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-StockAdjustments-StockAdjustmentItem").send(JSON.stringify(data));
    }
}
