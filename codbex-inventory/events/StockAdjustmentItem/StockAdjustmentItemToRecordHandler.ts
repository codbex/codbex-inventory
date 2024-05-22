import { StockAdjustmentRepository } from "../../gen/dao/StockAdjustments/StockAdjustmentRepository";
//import { GoodsIssueItemRepository, GoodsIssueItemEntity } from "../../gen/dao/GoodsIssues/GoodsIssueItemRepository";
import { CatalogueRepository } from "codbex-products/gen/dao/Catalogues/CatalogueRepository";

export const trigger = (event) => {
    const StockAdjustmentDao = new StockAdjustmentRepository();
    const CatalogueDao = new CatalogueRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = StockAdjustmentDao.findById(item.StockAdjustment);

    if (operation === "create") {
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
            catalogueRecord.Quantity = item.Quantity;
            CatalogueDao.update(catalogueRecord);
        } else {
            if (header.Store === undefined) {
                throw new Error("Store is undefined in GoodsIssue header");
            }
            const catalogueRecord = {
                Store: header.Store,
                Product: item.Product,
                Quantity: item.Quantity,
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