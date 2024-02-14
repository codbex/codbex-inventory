import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StockRecordDirectionEntity {
    readonly Id: number;
    Name?: string;
}

export interface StockRecordDirectionCreateEntity {
    readonly Name?: string;
}

export interface StockRecordDirectionUpdateEntity extends StockRecordDirectionCreateEntity {
    readonly Id: number;
}

export interface StockRecordDirectionEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
        };
        contains?: {
            Id?: number;
            Name?: string;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
        };
    },
    $select?: (keyof StockRecordDirectionEntity)[],
    $sort?: string | (keyof StockRecordDirectionEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StockRecordDirectionEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockRecordDirectionEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StockRecordDirectionRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKRECORDDIRECTION",
        properties: [
            {
                name: "Id",
                column: "STOCKRECORDDIRECTION_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STOCKRECORDDIRECTION_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(StockRecordDirectionRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StockRecordDirectionEntityOptions): StockRecordDirectionEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StockRecordDirectionEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StockRecordDirectionCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKRECORDDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORDDIRECTION_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockRecordDirectionUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKRECORDDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORDDIRECTION_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockRecordDirectionCreateEntity | StockRecordDirectionUpdateEntity): number {
        const id = (entity as StockRecordDirectionUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockRecordDirectionUpdateEntity);
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
            table: "CODBEX_STOCKRECORDDIRECTION",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKRECORDDIRECTION_ID",
                value: id
            }
        });
    }

    public count(options?: StockRecordDirectionEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: StockRecordDirectionEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKRECORDDIRECTION"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockRecordDirectionEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory/Settings/StockRecordDirection", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.queue("codbex-inventory/Settings/StockRecordDirection").send(JSON.stringify(data));
    }
}