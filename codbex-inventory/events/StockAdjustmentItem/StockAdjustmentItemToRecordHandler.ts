import { StockAdjustmentRepository } from "../../gen/codbex-inventory/dao/StockAdjustments/StockAdjustmentRepository";
import { ProductAvailabilityRepository } from "codbex-inventory/gen/codbex-inventory/dao/Products/ProductAvailabilityRepository";

export const trigger = (event) => {
    const StockAdjustmentDao = new StockAdjustmentRepository();
    const ProductAvailabilityDao = new ProductAvailabilityRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = StockAdjustmentDao.findById(item.StockAdjustment);

    if (!header || header.Store === undefined) {
        throw new Error("Store is undefined in StockAdjustment header");
    }

    if (operation === "create") {
        const catalogueRecords = ProductAvailabilityDao.findAll({
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
            ProductAvailabilityDao.update(catalogueRecord);
        } else {
            const newCatalogueRecord = {
                Store: header.Store,
                Product: item.Product,
                Quantity: item.AdjustedQuantity,
            };
            ProductAvailabilityDao.create(newCatalogueRecord);
        }

    } else if (operation === "update") {
    } else if (operation === "delete") {
    } else {
        throw new Error("Unknown operation: " + operation);
    }
};
