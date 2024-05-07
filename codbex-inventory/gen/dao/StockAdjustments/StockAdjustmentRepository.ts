import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface StockAdjustmentEntity {
    readonly Id: number;
    Number?: string;
    Purpose?: string;
    Date: Date;
    StockAdjustmentType?: number;
    Store?: number;
    Operator: number;
    Description?: string;
    Name?: string;
    UUID?: string;
    Reference?: string;
}

export interface StockAdjustmentCreateEntity {
    readonly Purpose?: string;
    readonly Date: Date;
    readonly StockAdjustmentType?: number;
    readonly Store?: number;
    readonly Operator: number;
    readonly Description?: string;
    readonly Reference?: string;
}

export interface StockAdjustmentUpdateEntity extends StockAdjustmentCreateEntity {
    readonly Id: number;
}

export interface StockAdjustmentEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Number?: string | string[];
            Purpose?: string | string[];
            Date?: Date | Date[];
            StockAdjustmentType?: number | number[];
            Store?: number | number[];
            Operator?: number | number[];
            Description?: string | string[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Purpose?: string | string[];
            Date?: Date | Date[];
            StockAdjustmentType?: number | number[];
            Store?: number | number[];
            Operator?: number | number[];
            Description?: string | string[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Purpose?: string;
            Date?: Date;
            StockAdjustmentType?: number;
            Store?: number;
            Operator?: number;
            Description?: string;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Purpose?: string;
            Date?: Date;
            StockAdjustmentType?: number;
            Store?: number;
            Operator?: number;
            Description?: string;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Purpose?: string;
            Date?: Date;
            StockAdjustmentType?: number;
            Store?: number;
            Operator?: number;
            Description?: string;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Purpose?: string;
            Date?: Date;
            StockAdjustmentType?: number;
            Store?: number;
            Operator?: number;
            Description?: string;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Purpose?: string;
            Date?: Date;
            StockAdjustmentType?: number;
            Store?: number;
            Operator?: number;
            Description?: string;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
    },
    $select?: (keyof StockAdjustmentEntity)[],
    $sort?: string | (keyof StockAdjustmentEntity)[],
    $order?: 'asc' | 'desc',
    $offset?: number,
    $limit?: number,
}

interface StockAdjustmentEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<StockAdjustmentEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

export class StockAdjustmentRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_STOCKADJUSTMENT",
        properties: [
            {
                name: "Id",
                column: "STOCKADJUSTMENT_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Number",
                column: "STOCKADJUSTMENT_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Purpose",
                column: "STOCKADJUSTMENT_PURPOSE",
                type: "VARCHAR",
            },
            {
                name: "Date",
                column: "STOCKADJUSTMENT_DATE",
                type: "DATE",
                required: true
            },
            {
                name: "StockAdjustmentType",
                column: "STOCKADJUSTMENT_STOCKADJUSTMENTTYPE",
                type: "INTEGER",
            },
            {
                name: "Store",
                column: "STOCKADJUSTMENT_STORE",
                type: "INTEGER",
            },
            {
                name: "Operator",
                column: "STOCKADJUSTMENT_OPERATOR",
                type: "INTEGER",
                required: true
            },
            {
                name: "Description",
                column: "STOCKADJUSTMENT_DESCRIPTION",
                type: "VARCHAR",
            },
            {
                name: "Name",
                column: "STOCKADJUSTMENT_NAME",
                type: "VARCHAR",
            },
            {
                name: "UUID",
                column: "STOCKADJUSTMENT_UUID",
                type: "VARCHAR",
            },
            {
                name: "Reference",
                column: "STOCKADJUSTMENT_REFERENCE",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(StockAdjustmentRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: StockAdjustmentEntityOptions): StockAdjustmentEntity[] {
        return this.dao.list(options).map((e: StockAdjustmentEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): StockAdjustmentEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: StockAdjustmentCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as StockAdjustmentEntity).Number = new NumberGeneratorService().generate(23);
        // @ts-ignore
        (entity as StockAdjustmentEntity).UUID = require("sdk/utils/uuid").random();
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_STOCKADJUSTMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENT_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: StockAdjustmentUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_STOCKADJUSTMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENT_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: StockAdjustmentCreateEntity | StockAdjustmentUpdateEntity): number {
        const id = (entity as StockAdjustmentUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as StockAdjustmentUpdateEntity);
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
            table: "CODBEX_STOCKADJUSTMENT",
            entity: entity,
            key: {
                name: "Id",
                column: "STOCKADJUSTMENT_ID",
                value: id
            }
        });
    }

    public count(options?: StockAdjustmentEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_STOCKADJUSTMENT"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: StockAdjustmentEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-StockAdjustments-StockAdjustment", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-StockAdjustments-StockAdjustment").send(JSON.stringify(data));
    }
}