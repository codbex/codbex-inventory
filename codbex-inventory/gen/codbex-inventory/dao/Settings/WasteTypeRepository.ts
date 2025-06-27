import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface WasteTypeEntity {
    readonly Id: number;
    Name?: string;
    Direction?: number;
}

export interface WasteTypeCreateEntity {
    readonly Name?: string;
    readonly Direction?: number;
}

export interface WasteTypeUpdateEntity extends WasteTypeCreateEntity {
    readonly Id: number;
}

export interface WasteTypeEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Direction?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Direction?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Direction?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Direction?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Direction?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Direction?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Direction?: number;
        };
    },
    $select?: (keyof WasteTypeEntity)[],
    $sort?: string | (keyof WasteTypeEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface WasteTypeEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<WasteTypeEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface WasteTypeUpdateEntityEvent extends WasteTypeEntityEvent {
    readonly previousEntity: WasteTypeEntity;
}

export class WasteTypeRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_WASTETYPE",
        properties: [
            {
                name: "Id",
                column: "WASTETYPE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "WASTETYPE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Direction",
                column: "WASTETYPE_DIRECTION",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(WasteTypeRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: WasteTypeEntityOptions = {}): WasteTypeEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): WasteTypeEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: WasteTypeCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_WASTETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "WASTETYPE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: WasteTypeUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_WASTETYPE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "WASTETYPE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: WasteTypeCreateEntity | WasteTypeUpdateEntity): number {
        const id = (entity as WasteTypeUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as WasteTypeUpdateEntity);
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
            table: "CODBEX_WASTETYPE",
            entity: entity,
            key: {
                name: "Id",
                column: "WASTETYPE_ID",
                value: id
            }
        });
    }

    public count(options?: WasteTypeEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_WASTETYPE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: WasteTypeEntityEvent | WasteTypeUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-Settings-WasteType", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-Settings-WasteType").send(JSON.stringify(data));
    }
}
