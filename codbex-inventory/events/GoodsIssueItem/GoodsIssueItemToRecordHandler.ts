import { GoodsIssueRepository } from "../../gen/dao/GoodsIssues/GoodsIssueRepository";
//import { GoodsIssueItemRepository, GoodsIssueItemEntity } from "../../gen/dao/GoodsIssues/GoodsIssueItemRepository";
import { StockRecordRepository } from "../../gen/dao/StockRecords/StockRecordRepository";
import { CatalogueRepository } from "codbex-products/gen/dao/Products/CatalogueRepository"

export const trigger = (event) => {
    const GoodsIssueDao = new GoodsIssueRepository();
    const StockRecordDao = new StockRecordRepository();
    const CatalogueDao = new CatalogueRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = GoodsIssueDao.findById(item.GoodsIssue);

    if (operation === "create") {
        const record = {
            Reference: header.UUID,
            Product: item.Product,
            Quantity: item.Quantity,
            UoM: item.UoM,
            Price: item.Price,
            Net: item.Net,
            VAT: item.VAT,
            Gross: item.Gross,
            ItemId: item.Id,
            Direction: -1,
            Deleted: false,
        }
        StockRecordDao.create(record);

        const catalogueRecords = await CatalogueDao.findAll({
            $filter: {
                equals: {
                    Store: event.Store,
                    Product: item.Product,
                },
            },
        });
        if (catalogueRecords.length > 0) {
            const catalogueRecord = catalogueRecords[0];
            catalogueRecord.Quantity += record.Direction * record.Quantity;
            CatalogueDao.update(catalogueRecord);
        } else {
            const catalogueRecord = {
                Store: event.Store,
                Product: record.Product,
                Quantity: record.Quantity * record.Direction
            }
            CatalogueDao.create(catalogueRecord);
        }

    } else if (operation === "update") {
        // TODO find by Item Id and update
    } else if (operation === "delete") {
        // TODO find by Item Id and mark as deleted
    } else {
        throw new Error("Unknown operation: " + operation);
    }
}