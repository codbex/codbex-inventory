import { StockAdjustmentRepository } from "../../gen/dao/StockAdjustments/StockAdjustmentRepository";
import { CatalogueRepository } from "codbex-products/gen/dao/Catalogues/CatalogueRepository";

export const trigger = (event) => {
    const StockAdjustmentDao = new StockAdjustmentRepository();
    const CatalogueDao = new CatalogueRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = StockAdjustmentDao.findById(item.StockAdjustment);

    if (!header || header.Store === undefined) {
        throw new Error("Store is undefined in StockAdjustment header");
    }

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
            catalogueRecord.Quantity = item.AdjustedQuantity;
            CatalogueDao.update(catalogueRecord);
        } else {
            const newCatalogueRecord = {
                Store: header.Store,
                Product: item.Product,
                Quantity: item.AdjustedQuantity,
            };
            CatalogueDao.create(newCatalogueRecord);
        }

    } else if (operation === "update") {
        // TODO: Implement update logic
    } else if (operation === "delete") {
        // TODO: Implement delete logic
    } else {
        throw new Error("Unknown operation: " + operation);
    }
};
