import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GoodsIssueEntity {
    readonly Id: number;
    Number?: string;
    Store?: number;
    Company?: number;
    Name?: string;
    Currency?: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
    UUID?: string;
    Reference?: string;
}

export interface GoodsIssueCreateEntity {
    readonly Number?: string;
    readonly Store?: number;
    readonly Company?: number;
    readonly Name?: string;
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
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Name?: string | string[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        notEquals?: {
            Id?: number | number[];
            Number?: string | string[];
            Store?: number | number[];
            Company?: number | number[];
            Name?: string | string[];
            Currency?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
            UUID?: string | string[];
            Reference?: string | string[];
        };
        contains?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        greaterThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        greaterThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        lessThan?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
        lessThanOrEqual?: {
            Id?: number;
            Number?: string;
            Store?: number;
            Company?: number;
            Name?: string;
            Currency?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
            UUID?: string;
            Reference?: string;
        };
    },
    $select?: (keyof GoodsIssueEntity)[],
    $sort?: string | (keyof GoodsIssueEntity)[],
    $order?: 'asc' | 'desc',
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
                name: "Name",
                column: "GOODSISSUE_NAME",
                type: "VARCHAR",
            },
            {
                name: "Currency",
                column: "GOODSISSUE_CURRENCY",
                type: "INTEGER",
            },
            {
                name: "Net",
                column: "GOODSISSUE_NET",
                type: "DOUBLE",
            },
            {
                name: "VAT",
                column: "GOODSISSUE_VAT",
                type: "DOUBLE",
            },
            {
                name: "Gross",
                column: "GOODSISSUE_GROSS",
                type: "DOUBLE",
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

    constructor(dataSource?: string) {
        this.dao = daoApi.create(GoodsIssueRepository.DEFINITION, null, dataSource);
    }

    public findAll(options?: GoodsIssueEntityOptions): GoodsIssueEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GoodsIssueEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GoodsIssueCreateEntity): number {
        // @ts-ignore
        (entity as GoodsIssueEntity).UUID = require("sdk/utils/uuid").random();
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
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOODSISSUE",
            entity: entity,
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

    public customDataCount(options?: GoodsIssueEntityOptions): number {
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

    private async triggerEvent(data: GoodsIssueEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory/GoodsIssues/GoodsIssue", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory/GoodsIssues/GoodsIssue").send(JSON.stringify(data));
    }
}