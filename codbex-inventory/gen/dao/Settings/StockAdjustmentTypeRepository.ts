import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StockAdjustmentTypeEntity {
    readonly Id: number;
    Name?: string;
    Description?: string;
}

export interface StockAdjustmentTypeCreateEntity {
    readonly Name?: string;
    readonly Description?: string;
}

export interface StockAdjustmentTypeUpdateEntity extends StockAdjustmentTypeCreateEntity {
    readonly Id: number;
}

export interface StockAdjustmentTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Description?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Description?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Description?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Description?: string;
        };
    },
    $select?: (keyof StockAdjustmentTypeEntity)[],
    $sort?: string | (keyof StockAdjustmentTypeEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StockAdjustmentTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockAdjustmentTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StockAdjustmentTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKADJUSTMENTTYPE",
        properties: [
            {
                name: "Id",
                column: "STOCKADJUSTMENTTYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STOCKADJUSTMENTTYPE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Description",
                column: "STOCKADJUSTMENTTYPE_DESCRIPTION",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StockAdjustmentTypeRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StockAdjustmentTypeEntityOptions): StockAdjustmentTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StockAdjustmentTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StockAdjustmentTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKADJUSTMENTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTTYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockAdjustmentTypeUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKADJUSTMENTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTTYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockAdjustmentTypeCreateEntity | StockAdjustmentTypeUpdateEntity): number {
        const id = (entity as StockAdjustmentTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockAdjustmentTypeUpdateEntity);
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
            table: "CODBEX_STOCKADJUSTMENTTYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENTTYPE_ID",
                value: id
            }
        });
    }

    public count(options?: StockAdjustmentTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKADJUSTMENTTYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockAdjustmentTypeEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-Settings-StockAdjustmentType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-Settings-StockAdjustmentType").send(JSON.stringify(data));
    }
}
