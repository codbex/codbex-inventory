import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator"

export interface DeliveryNoteEntity {
    readonly Id: number;
    Number?: string;
    Date: Date;
    Store: number;
    Employee?: number;
    Company?: number;
    Customer: number;
}

export interface DeliveryNoteCreateEntity {
    readonly Date: Date;
    readonly Store: number;
    readonly Employee?: number;
    readonly Company?: number;
    readonly Customer: number;
}

export interface DeliveryNoteUpdateEntity extends DeliveryNoteCreateEntity {
    readonly Id: number;
}

export interface DeliveryNoteEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Date?: Date | Date[];
            Store?: number | number[];
            Employee?: number | number[];
            Company?: number | number[];
            Customer?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Date?: Date | Date[];
            Store?: number | number[];
            Employee?: number | number[];
            Company?: number | number[];
            Customer?: number | number[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Store?: number;
            Employee?: number;
            Company?: number;
            Customer?: number;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Store?: number;
            Employee?: number;
            Company?: number;
            Customer?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Store?: number;
            Employee?: number;
            Company?: number;
            Customer?: number;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Store?: number;
            Employee?: number;
            Company?: number;
            Customer?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Date?: Date;
            Store?: number;
            Employee?: number;
            Company?: number;
            Customer?: number;
        };
    },
    $select?: (keyof DeliveryNoteEntity)[],
    $sort?: string | (keyof DeliveryNoteEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface DeliveryNoteEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<DeliveryNoteEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface DeliveryNoteUpdateEntityEvent extends DeliveryNoteEntityEvent {
    readonly previousEntity: DeliveryNoteEntity;
}

export class DeliveryNoteRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_DELIVERYNOTE",
        properties: [
            {
                name: "Id",
                column: "DELIVERYNOTE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "DELIVERYNOTE_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "DELIVERYNOTE_DATE",
                type: "DATE",
                required: true
            },
            {
                name: "Store",
                column: "DELIVERYNOTE_STORE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Employee",
                column: "DELIVERYNOTE_EMPLOYEE",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "DELIVERYNOTE_COMPANY",
                type: "INTEGER",
            },
            {
                name: "Customer",
                column: "DELIVERYNOTE_CUSTOMER",
                type: "INTEGER",
                required: true
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(DeliveryNoteRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: DeliveryNoteEntityOptions): DeliveryNoteEntity[] {
        return this.dao.list(options).map((e: DeliveryNoteEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): DeliveryNoteEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: DeliveryNoteCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as DeliveryNoteEntity).Number = new NumberGeneratorService().generate(26);
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_DELIVERYNOTE",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERYNOTE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: DeliveryNoteUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_DELIVERYNOTE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "DELIVERYNOTE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: DeliveryNoteCreateEntity | DeliveryNoteUpdateEntity): number {
        const id = (entity as DeliveryNoteUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as DeliveryNoteUpdateEntity);
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
            table: "CODBEX_DELIVERYNOTE",
            entity: entity,
            key: {
                name: "Id",
                column: "DELIVERYNOTE_ID",
                value: id
            }
        });
    }

    public count(options?: DeliveryNoteEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_DELIVERYNOTE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: DeliveryNoteEntityEvent | DeliveryNoteUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-DeliveryNote-DeliveryNote", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-DeliveryNote-DeliveryNote").send(JSON.stringify(data));
    }
}
