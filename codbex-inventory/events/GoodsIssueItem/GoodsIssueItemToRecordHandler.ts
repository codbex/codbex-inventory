import { GoodsIssueRepository } from "../../gen/codbex-inventory/dao/GoodsIssues/GoodsIssueRepository";
import { StockRecordRepository } from "../../gen/codbex-inventory/dao/StockRecords/StockRecordRepository";
import { ProductAvailabilityRepository } from "codbex-inventory/gen/codbex-inventory/dao/Products/ProductAvailabilityRepository"

export const trigger = (event) => {
    const GoodsIssueDao = new GoodsIssueRepository();
    const StockRecordDao = new StockRecordRepository();
    const CatalogueDao = new ProductAvailabilityRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = GoodsIssueDao.findById(item.GoodsIssue);

    if (!header || header.Store === undefined) {
        throw new Error("Store is undefined in GoodsIssue header");
    }

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

        const catalogueRecords = CatalogueDao.findAll({
            $filter: {
                equals: {
                    Store: header.Store,
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
                Store: header.Store,
                Product: record.Product,
                Quantity: record.Quantity * record.Direction,
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