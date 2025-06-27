import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface ProductAvailabilityEntity {
    readonly Id: number;
    Product?: number;
    Store?: number;
    Quantity?: number;
    BaseUnit?: number;
}

export interface ProductAvailabilityCreateEntity {
    readonly Product?: number;
    readonly Store?: number;
    readonly Quantity?: number;
    readonly BaseUnit?: number;
}

export interface ProductAvailabilityUpdateEntity extends ProductAvailabilityCreateEntity {
    readonly Id: number;
}

export interface ProductAvailabilityEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
            BaseUnit?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Product?: number | number[];
            Store?: number | number[];
            Quantity?: number | number[];
            BaseUnit?: number | number[];
        };
        contains?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        greaterThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        lessThan?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Product?: number;
            Store?: number;
            Quantity?: number;
            BaseUnit?: number;
        };
    },
    $select?: (keyof ProductAvailabilityEntity)[],
    $sort?: string | (keyof ProductAvailabilityEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface ProductAvailabilityEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<ProductAvailabilityEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface ProductAvailabilityUpdateEntityEvent extends ProductAvailabilityEntityEvent {
    readonly previousEntity: ProductAvailabilityEntity;
}

export class ProductAvailabilityRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_PRODUCTAVAILABILITY",
        properties: [
            {
                name: "Id",
                column: "PRODUCTAVAILABILITY_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Product",
                column: "PRODUCTAVAILABILITY_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "Store",
                column: "PRODUCTAVAILABILITY_STORE",
                type: "INTEGER",
            },
            {
                name: "Quantity",
                column: "PRODUCTAVAILABILITY_QUANTITY",
                type: "INTEGER",
            },
            {
                name: "BaseUnit",
                column: "PRODUCTAVAILABILITY_BASEUNIT",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(ProductAvailabilityRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: ProductAvailabilityEntityOptions = {}): ProductAvailabilityEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): ProductAvailabilityEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: ProductAvailabilityCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_PRODUCTAVAILABILITY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTAVAILABILITY_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: ProductAvailabilityUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_PRODUCTAVAILABILITY",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "PRODUCTAVAILABILITY_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: ProductAvailabilityCreateEntity | ProductAvailabilityUpdateEntity): number {
        const id = (entity as ProductAvailabilityUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as ProductAvailabilityUpdateEntity);
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
            table: "CODBEX_PRODUCTAVAILABILITY",
            entity: entity,
            key: {
                name: "Id",
                column: "PRODUCTAVAILABILITY_ID",
                value: id
            }
        });
    }

    public count(options?: ProductAvailabilityEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_PRODUCTAVAILABILITY"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: ProductAvailabilityEntityEvent | ProductAvailabilityUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-ProductAvailability-ProductAvailability", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-ProductAvailability-ProductAvailability").send(JSON.stringify(data));
    }
}
