import { query } from "sdk/db";
import { producer } from "sdk/messaging";
import { extensions } from "sdk/extensions";
import { dao as daoApi } from "sdk/db";

export interface GoodsIssueItemEntity {
    readonly Id: number;
    GoodsIssue: number;
    Product: number;
    Quantity: number;
    UoM: number;
    Price: number;
    Net?: number;
    VAT?: number;
    Gross?: number;
}

export interface GoodsIssueItemCreateEntity {
    readonly GoodsIssue: number;
    readonly Product: number;
    readonly Quantity: number;
    readonly UoM: number;
    readonly Price: number;
}

export interface GoodsIssueItemUpdateEntity extends GoodsIssueItemCreateEntity {
    readonly Id: number;
}

export interface GoodsIssueItemEntityOptions {
    $filter?: {
        equals?: {
            Id?: number | number[];
            GoodsIssue?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
        };
        notEquals?: {
            Id?: number | number[];
            GoodsIssue?: number | number[];
            Product?: number | number[];
            Quantity?: number | number[];
            UoM?: number | number[];
            Price?: number | number[];
            Net?: number | number[];
            VAT?: number | number[];
            Gross?: number | number[];
        };
        contains?: {
            Id?: number;
            GoodsIssue?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        greaterThan?: {
            Id?: number;
            GoodsIssue?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        greaterThanOrEqual?: {
            Id?: number;
            GoodsIssue?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        lessThan?: {
            Id?: number;
            GoodsIssue?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
        lessThanOrEqual?: {
            Id?: number;
            GoodsIssue?: number;
            Product?: number;
            Quantity?: number;
            UoM?: number;
            Price?: number;
            Net?: number;
            VAT?: number;
            Gross?: number;
        };
    },
    $select?: (keyof GoodsIssueItemEntity)[],
    $sort?: string | (keyof GoodsIssueItemEntity)[],
    $order?: 'ASC' | 'DESC',
    $offset?: number,
    $limit?: number,
}

interface GoodsIssueItemEntityEvent {
    readonly operation: 'create' | 'update' | 'delete';
    readonly table: string;
    readonly entity: Partial<GoodsIssueItemEntity>;
    readonly key: {
        name: string;
        column: string;
        value: number;
    }
}

interface GoodsIssueItemUpdateEntityEvent extends GoodsIssueItemEntityEvent {
    readonly previousEntity: GoodsIssueItemEntity;
}

export class GoodsIssueItemRepository {

    private static readonly DEFINITION = {
        table: "CODBEX_GOODSISSUEITEM",
        properties: [
            {
                name: "Id",
                column: "GOODSISSUEITEM_ID",
                type: "INTEGER",
                id: true,
                autoIncrement: true,
            },
            {
                name: "GoodsIssue",
                column: "GOODSISSUEITEM_GOODSISSUE",
                type: "INTEGER",
                required: true
            },
            {
                name: "Product",
                column: "GOODSISSUEITEM_PRODUCT",
                type: "INTEGER",
                required: true
            },
            {
                name: "Quantity",
                column: "GOODSISSUEITEM_QUANTITY",
                type: "DOUBLE",
                required: true
            },
            {
                name: "UoM",
                column: "GOODSISSUEITEM_UOM",
                type: "INTEGER",
                required: true
            },
            {
                name: "Price",
                column: "GOODSISSUEITEM_PRICE",
                type: "DECIMAL",
                required: true
            },
            {
                name: "Net",
                column: "GOODSISSUEITEM_NET",
                type: "DECIMAL",
            },
            {
                name: "VAT",
                column: "GOODSISSUEITEM_VAT",
                type: "DECIMAL",
            },
            {
                name: "Gross",
                column: "GOODSISSUEITEM_GROSS",
                type: "DECIMAL",
            }
        ]
    };

    private readonly dao;

    constructor(dataSource = "DefaultDB") {
        this.dao = daoApi.create(GoodsIssueItemRepository.DEFINITION, undefined, dataSource);
    }

    public findAll(options: GoodsIssueItemEntityOptions = {}): GoodsIssueItemEntity[] {
        return this.dao.list(options);
    }

    public findById(id: number): GoodsIssueItemEntity | undefined {
        const entity = this.dao.find(id);
        return entity ?? undefined;
    }

    public create(entity: GoodsIssueItemCreateEntity): number {
        // @ts-ignore
        (entity as GoodsIssueItemEntity).Net = entity["Quantity"] * entity["Price"];
        // @ts-ignore
        (entity as GoodsIssueItemEntity).VAT = entity["Net"] * 0.2;
        // @ts-ignore
        (entity as GoodsIssueItemEntity).Gross = entity["Net"] + entity["VAT"];
        const id = this.dao.insert(entity);
        this.triggerEvent({
            operation: "create",
            table: "CODBEX_GOODSISSUEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSISSUEITEM_ID",
                value: id
            }
        });
        return id;
    }

    public update(entity: GoodsIssueItemUpdateEntity): void {
        // @ts-ignore
        (entity as GoodsIssueItemEntity).Net = entity["Quantity"] * entity["Price"];
        // @ts-ignore
        (entity as GoodsIssueItemEntity).VAT = entity["Net"] * 0.2;
        // @ts-ignore
        (entity as GoodsIssueItemEntity).Gross = entity["Net"] + entity["VAT"];
        const previousEntity = this.findById(entity.Id);
        this.dao.update(entity);
        this.triggerEvent({
            operation: "update",
            table: "CODBEX_GOODSISSUEITEM",
            entity: entity,
            previousEntity: previousEntity,
            key: {
                name: "Id",
                column: "GOODSISSUEITEM_ID",
                value: entity.Id
            }
        });
    }

    public upsert(entity: GoodsIssueItemCreateEntity | GoodsIssueItemUpdateEntity): number {
        const id = (entity as GoodsIssueItemUpdateEntity).Id;
        if (!id) {
            return this.create(entity);
        }

        const existingEntity = this.findById(id);
        if (existingEntity) {
            this.update(entity as GoodsIssueItemUpdateEntity);
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
            table: "CODBEX_GOODSISSUEITEM",
            entity: entity,
            key: {
                name: "Id",
                column: "GOODSISSUEITEM_ID",
                value: id
            }
        });
    }

    public count(options?: GoodsIssueItemEntityOptions): number {
        return this.dao.count(options);
    }

    public customDataCount(): number {
        const resultSet = query.execute('SELECT COUNT(*) AS COUNT FROM "CODBEX_GOODSISSUEITEM"');
        if (resultSet !== null && resultSet[0] !== null) {
            if (resultSet[0].COUNT !== undefined && resultSet[0].COUNT !== null) {
                return resultSet[0].COUNT;
            } else if (resultSet[0].count !== undefined && resultSet[0].count !== null) {
                return resultSet[0].count;
            }
        }
        return 0;
    }

    private async triggerEvent(data: GoodsIssueItemEntityEvent | GoodsIssueItemUpdateEntityEvent) {
        const triggerExtensions = await extensions.loadExtensionModules("codbex-inventory-GoodsIssues-GoodsIssueItem", ["trigger"]);
        triggerExtensions.forEach(triggerExtension => {
            try {
                triggerExtension.trigger(data);
            } catch (error) {
                console.error(error);
            }            
        });
        producer.topic("codbex-inventory-GoodsIssues-GoodsIssueItem").send(JSON.stringify(data));
    }
}
