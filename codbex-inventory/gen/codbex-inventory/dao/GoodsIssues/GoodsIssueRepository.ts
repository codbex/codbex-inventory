import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";
import { EntityUtils } from "../utils/EntityUtils";
// custom imports
import { NumberGeneratorService } from "/codbex-number-generator/service/generator";

export interface GoodsIssueEntity {
    readonly Id: number;
    Date?: Date;
    Number?: string;
    Store?: number;
    Company?: number;
    Currency?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
    Name: string;
    UUID?: string;
    Reference?: string;
}

export interface GoodsIssueCreateEntity {
    readonly Date?: Date;
    readonly Store?: number;
    readonly Company?: number;
    readonly Currency?: number;
    readonly Net?: number;
    readonly VAT?: number;
    readonly Gross?: number;
    readonly Reference?: string;
}

export interface GoodsIssueUpdateEntity extends GoodsIssueCreateEntity {
    readonly Id: number;
}

export interface GoodsIssueEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Date?: Date | Date[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            Name?: string | string[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        contains?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThan?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThan?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Date?: Date;
            Number?: string;
            Store?: number;
            Company?: number;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            Name?: string;
            UUID?: string;
            Reference?: string;
        };
    },
    $select?: (keyof GoodsIssueEntity)[],
    $sort?: string | (keyof GoodsIssueEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface GoodsIssueEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GoodsIssueEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface GoodsIssueUpdateEntityEvent extends GoodsIssueEntityEvent {
    readonly previousEntity: GoodsIssueEntity;
}

export class GoodsIssueRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GOODSISSUE",
        properties: [
            {
                name: "Id",
                column: "GOODSISSUE_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "Date",
                column: "GOODSISSUE_DATE",
                type: "DATE",
            },
            {
                name: "Number",
                column: "GOODSISSUE_NUMBER",
                type: "VARCHAR",
            },
            {
                name: "Store",
                column: "GOODSISSUE_STORE",
                type: "INTEGER",
            },
            {
                name: "Company",
                column: "GOODSISSUE_COMPANY",
                type: "INTEGER",
            },
            {
                name: "Currency",
                column: "GOODSISSUE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "GOODSISSUE_NET",
                type: "DECIMAL",
            },
            {
                name: "VAT",
                column: "GOODSISSUE_VAT",
                type: "DECIMAL",
            },
            {
                name: "Gross",
                column: "GOODSISSUE_GROSS",
                type: "DECIMAL",
            },
            {
                name: "Name",
                column: "GOODSISSUE_NAME",
                type: "VARCHAR",
                required: true
            },
            {
                name: "UUID",
                column: "GOODSISSUE_UUID",
                type: "VARCHAR",
            },
            {
                name: "Reference",
                column: "GOODSISSUE_REFERENCE",
                type: "VARCHAR",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GoodsIssueRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: GoodsIssueEntityOptions = {}): GoodsIssueEntity[] {
        if (options.$sort === undefined && options.$order === undefined) {
            options.$sort = "Number";
            options.$order = "DESC";
        }
        return this.dao.list(options).map((e: GoodsIssueEntity) => {
            EntityUtils.setDate(e, "Date");
            return e;
        });
    }

    public findById(id: number): GoodsIssueEntity | undefined {
        const entity = this.dao.find(id);
        EntityUtils.setDate(entity, "Date");
        return entity ?? undefined;
    }

    public create(entity: GoodsIssueCreateEntity): number {
        EntityUtils.setLocalDate(entity, "Date");
        // @ts-ignore
        (entity as GoodsIssueEntity).Number = new NumberGeneratorService().generate(15);
        // @ts-ignore
        (entity as GoodsIssueEntity).Name = entity["Number"] + "/" + new Date(entity["Date"]).toISOString().slice(0, 10) + "/" + entity["Gross"];
        // @ts-ignore
        (entity as GoodsIssueEntity).UUID = require("sdk/utils/uuid").random();
        if (entity.Net === undefined || entity.Net === null) {
            (entity as GoodsIssueEntity).Net = 0;
        }
        if (entity.VAT === undefined || entity.VAT === null) {
            (entity as GoodsIssueEntity).VAT = 0;
        }
        if (entity.Gross === undefined || entity.Gross === null) {
            (entity as GoodsIssueEntity).Gross = 0;
        }
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GOODSISSUE",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSISSUE_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoodsIssueUpdateEntity): void {
        // EntityUtils.setLocalDate(entity, "Date");
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOODSISSUE",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "GOODSISSUE_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GoodsIssueCreateEntity | GoodsIssueUpdateEntity): number {
        const id = (entity as GoodsIssueUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GoodsIssueUpdateEntity);
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
            table: "CODBEX_GOODSISSUE",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSISSUE_ID",
                value: id
            }
        });
    }

    public count(options?: GoodsIssueEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOODSISSUE"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GoodsIssueEntityEvent | GoodsIssueUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-GoodsIssues-GoodsIssue", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-GoodsIssues-GoodsIssue").send(JSON.stringify(data));
    }
}
