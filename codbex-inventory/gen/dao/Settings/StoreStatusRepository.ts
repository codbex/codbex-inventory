import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StoreStatusEntity {
    readonly Id: number;
    Name?: string;
}

export interface StoreStatusCreateEntity {
    readonly Name?: string;
}

export interface StoreStatusUpdateEntity extends StoreStatusCreateEntity {
    readonly Id: number;
}

export interface StoreStatusEntityOptions {
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
    $select?: (keyof StoreStatusEntity)[],
    $sort?: string | (keyof StoreStatusEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreStatusEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreStatusEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StoreStatusRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORESTATUS",
        properties: [
            {
                name: "Id",
                column: "STORESTATUS_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STORESTATUS_NAME",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource?: string) {
        this.dao = daoApi.create(StoreStatusRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreStatusEntityOptions): StoreStatusEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StoreStatusEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StoreStatusCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STORESTATUS_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreStatusUpdateEntity): void {
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STORESTATUS_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreStatusCreateEntity | StoreStatusUpdateEntity): number {
        const id = (entity as StoreStatusUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreStatusUpdateEntity);
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
            table: "CODBEX_STORESTATUS",
            entity: entity,
            key: {
                name: "Id",
                column: "STORESTATUS_ID",
                value: id
            }
        });
    }

    public count(options?: StoreStatusEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(options?: StoreStatusEntityOptions): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORESTATUS"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreStatusEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory/Settings/StoreStatus", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory/Settings/StoreStatus").send(JSON.stringify(data));
    }
}