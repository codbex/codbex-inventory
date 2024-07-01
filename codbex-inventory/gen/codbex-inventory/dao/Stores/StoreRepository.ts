import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface StoreEntity {
    readonly Id: number;
    Name?: string;
    Email?: string;
    Phone?: string;
    Address?: string;
    PostCode?: string;
    City?: number;
    Country?: number;
    Location?: string;
    Contact?: string;
    Manager?: string;
    Status?: number;
    Company?: number;
}

export interface StoreCreateEntity {
    readonly Name?: string;
    readonly Email?: string;
    readonly Phone?: string;
    readonly Address?: string;
    readonly PostCode?: string;
    readonly City?: number;
    readonly Country?: number;
    readonly Location?: string;
    readonly Contact?: string;
    readonly Manager?: string;
    readonly Status?: number;
    readonly Company?: number;
}

export interface StoreUpdateEntity extends StoreCreateEntity {
    readonly Id: number;
}

export interface StoreEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: number | number[];
            Country?: number | number[];
            Location?: string | string[];
            Contact?: string | string[];
            Manager?: string | string[];
            Status?: number | number[];
            Company?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Name?: string | string[];
            Email?: string | string[];
            Phone?: string | string[];
            Address?: string | string[];
            PostCode?: string | string[];
            City?: number | number[];
            Country?: number | number[];
            Location?: string | string[];
            Contact?: string | string[];
            Manager?: string | string[];
            Status?: number | number[];
            Company?: number | number[];
        };
        contains?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: number;
            Country?: number;
            Location?: string;
            Contact?: string;
            Manager?: string;
            Status?: number;
            Company?: number;
        };
        greaterThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: number;
            Country?: number;
            Location?: string;
            Contact?: string;
            Manager?: string;
            Status?: number;
            Company?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: number;
            Country?: number;
            Location?: string;
            Contact?: string;
            Manager?: string;
            Status?: number;
            Company?: number;
        };
        lessThan?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: number;
            Country?: number;
            Location?: string;
            Contact?: string;
            Manager?: string;
            Status?: number;
            Company?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Name?: string;
            Email?: string;
            Phone?: string;
            Address?: string;
            PostCode?: string;
            City?: number;
            Country?: number;
            Location?: string;
            Contact?: string;
            Manager?: string;
            Status?: number;
            Company?: number;
        };
    },
    $select?: (keyof StoreEntity)[],
    $sort?: string | (keyof StoreEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StoreEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StoreEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface StoreUpdateEntityEvent extends StoreEntityEvent {
    readonly previousEntity: StoreEntity;
}

export class StoreRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STORE",
        properties: [
            {
                name: "Id",
                column: "STORE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Name",
                column: "STORE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Email",
                column: "STORE_EMAIL",
                type: "VARCHAR",
            },
            {
                name: "Phone",
                column: "STORE_PHONE",
                type: "VARCHAR",
            },
            {
                name: "Address",
                column: "STORE_ADDRESS",
                type: "VARCHAR",
            },
            {
                name: "PostCode",
                column: "STORE_POSTCODE",
                type: "VARCHAR",
            },
            {
                name: "City",
                column: "STORE_CITY",
                type: "INTEGER",
            },
            {
                name: "Country",
                column: "STORE_COUNTRY",
                type: "INTEGER",
            },
            {
                name: "Location",
                column: "STORE_LOCATION",
                type: "VARCHAR",
            },
            {
                name: "Contact",
                column: "STORE_CONTACT",
                type: "VARCHAR",
            },
            {
                name: "Manager",
                column: "STORE_MANAGER",
                type: "VARCHAR",
            },
            {
                name: "Status",
                column: "STORE_STORESTATUSID",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "STORE_COMPANY",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StoreRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StoreEntityOptions): StoreEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): StoreEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: StoreCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STORE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StoreUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STORE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StoreCreateEntity | StoreUpdateEntity): number {
        const id = (entity as StoreUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StoreUpdateEntity);
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
            table: "CODBEX_STORE",
            entity: entity,
            key: {
                name: "Id",
                column: "STORE_ID",
                value: id
            }
        });
    }

    public count(options?: StoreEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STORE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StoreEntityEvent | StoreUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-Stores-Store", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-Stores-Store").send(JSON.stringify(data));
    }
}
