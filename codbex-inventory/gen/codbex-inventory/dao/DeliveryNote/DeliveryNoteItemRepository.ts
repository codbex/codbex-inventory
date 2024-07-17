import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface DeliveryNoteItemEntity {
    readonly Id: number;
    Quantity?: number;
    UoM?: number;
    Product?: number;
    DeliveryNote?: number;
}

export interface DeliveryNoteItemCreateEntity {
    readonly Quantity?: number;
    readonly UoM?: number;
    readonly Product?: number;
    readonly DeliveryNote?: number;
}

export interface DeliveryNoteItemUpdateEntity extends DeliveryNoteItemCreateEntity {
    readonly Id: number;
}

export interface DeliveryNoteItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Product?: number | number[];
            DeliveryNote?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Product?: number | number[];
            DeliveryNote?: number | number[];
        };
        contains?: {
            Id?: number;
            Quantity?: number;
            UoM?: number;
            Product?: number;
            DeliveryNote?: number;
        };
        greaterThan?: {
            Id?: number;
            Quantity?: number;
            UoM?: number;
            Product?: number;
            DeliveryNote?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Quantity?: number;
            UoM?: number;
            Product?: number;
            DeliveryNote?: number;
        };
        lessThan?: {
            Id?: number;
            Quantity?: number;
            UoM?: number;
            Product?: number;
            DeliveryNote?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Quantity?: number;
            UoM?: number;
            Product?: number;
            DeliveryNote?: number;
        };
    },
    $select?: (keyof DeliveryNoteItemEntity)[],
    $sort?: string | (keyof DeliveryNoteItemEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DeliveryNoteItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DeliveryNoteItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DeliveryNoteItemUpdateEntityEvent extends DeliveryNoteItemEntityEvent {
    readonly previousEntity: DeliveryNoteItemEntity;
}

export class DeliveryNoteItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DELIVERYNOTEITEM",
        properties: [
            {
                name: "Id",
                column: "DELIVERYNOTEITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Quantity",
                column: "DELIVERYNOTEITEM_QUANTITY",
                type: "DOUBLE",
            },
            {
                name: "UoM",
                column: "DELIVERYNOTEITEM_UOM",
                type: "INTEGER",
            },
            {
                name: "Product",
                column: "DELIVERYNOTEITEM_PRODUCT",
                type: "INTEGER",
            },
            {
                name: "DeliveryNote",
                column: "DELIVERYNOTEITEM_DELIVERYNOTE",
                type: "INTEGER",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DeliveryNoteItemRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DeliveryNoteItemEntityOptions): DeliveryNoteItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): DeliveryNoteItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: DeliveryNoteItemCreateEntity): number {
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DELIVERYNOTEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERYNOTEITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DeliveryNoteItemUpdateEntity): void {
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DELIVERYNOTEITEM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DELIVERYNOTEITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DeliveryNoteItemCreateEntity | DeliveryNoteItemUpdateEntity): number {
        const id = (entity as DeliveryNoteItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DeliveryNoteItemUpdateEntity);
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
            table: "CODBEX_DELIVERYNOTEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERYNOTEITEM_ID",
                value: id
            }
        });
    }

    public count(options?: DeliveryNoteItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DELIVERYNOTEITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DeliveryNoteItemEntityEvent | DeliveryNoteItemUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-DeliveryNote-DeliveryNoteItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-DeliveryNote-DeliveryNoteItem").send(JSON.stringify(data));
    }
}
