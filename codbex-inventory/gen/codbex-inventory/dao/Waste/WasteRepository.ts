import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface WasteEntity {
    readonly Id: number;
    Number?: string;
    Date: Date;
    Supplier: number;
    Product: number;
    Quantity: number;
    Store?: number;
    Reason?: string;
}

export interface WasteCreateEntity {
    readonly Date: Date;
    readonly Supplier: number;
    readonly Product: number;
    readonly Quantity: number;
    readonly Store?: number;
    readonly Reason?: string;
}

export interface WasteUpdateEntity extends WasteCreateEntity {
    readonly Id: number;
}

export interface WasteEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Date?: Date | Date[];
            Supplier?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            Store?: number | number[];
            Reason?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Date?: Date | Date[];
            Supplier?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            Store?: number | number[];
            Reason?: string | string[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            Product?: number;
            Quantity?: number;
            Store?: number;
            Reason?: string;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            Product?: number;
            Quantity?: number;
            Store?: number;
            Reason?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            Product?: number;
            Quantity?: number;
            Store?: number;
            Reason?: string;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            Product?: number;
            Quantity?: number;
            Store?: number;
            Reason?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Supplier?: number;
            Product?: number;
            Quantity?: number;
            Store?: number;
            Reason?: string;
        };
    },
    $select?: (keyof WasteEntity)[],
    $sort?: string | (keyof WasteEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface WasteEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<WasteEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface WasteUpdateEntityEvent extends WasteEntityEvent {
    readonly previousEntity: WasteEntity;
}

export class WasteRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_WASTE",
        properties: [
            {
                name: "Id",
                column: "WASTE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "WASTE_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "WASTE_DATE",
                type: "DATE",
                required: true
            },
            {
                name: "Supplier",
                column: "WASTE_SUPPLIER",
                type: "INTEGER",
                required: true
            },
            {
                name: "Product",
                column: "WASTE_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Quantity",
                column: "WASTE_QUANTITY",
                type: "DOUBLE",
                required: true
            },
            {
                name: "Store",
                column: "WASTE_STORE",
                type: "INTEGER",
            },
            {
                name: "Reason",
                column: "WASTE_REASON",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(WasteRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: WasteEntityOptions): WasteEntity[] {
        return this.dao.list(options).map((e: WasteEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): WasteEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: WasteCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as WasteEntity).Number = new NumberGeneratorService().generate(27);
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_WASTE",
            entity: entity,
            key: {
                name: "Id",
                column: "WASTE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: WasteUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_WASTE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "WASTE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: WasteCreateEntity | WasteUpdateEntity): number {
        const id = (entity as WasteUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as WasteUpdateEntity);
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
            table: "CODBEX_WASTE",
            entity: entity,
            key: {
                name: "Id",
                column: "WASTE_ID",
                value: id
            }
        });
    }

    public count(options?: WasteEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_WASTE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: WasteEntityEvent | WasteUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-Waste-Waste", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-Waste-Waste").send(JSON.stringify(data));
    }
}
