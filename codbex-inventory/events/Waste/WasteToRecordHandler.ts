import { WasteTypeRepository } from "../../gen/codbex-inventory/dao/Settings/WasteTypeRepository";
import { ProductAvailabilityRepository } from "codbex-inventory/gen/codbex-inventory/dao/Products/ProductAvailabilityRepository";


export const trigger = (event) => {
    const WasteTypeDao = new WasteTypeRepository();
    const ProductAvailabilityDao = new ProductAvailabilityRepository();
    const item = event.entity;
    const operation = event.operation;

    if (operation === "create") {
        const catalogueRecords = ProductAvailabilityDao.findAll({
            $filter: {
                equals: {
                    Store: item.Store,
                    Product: item.Product,
                },
            },
        });

        const wasteType = WasteTypeDao.findById(item.WasteType);
        if (catalogueRecords.length > 0) {
            const catalogueRecord = catalogueRecords[0];
            catalogueRecord.Quantity = (catalogueRecord.Quantity -
                (item.Quantity) * (wasteType.Direction)) < 0
                ? 0
                : (catalogueRecord.Quantity - (item.Quantity) * (wasteType.Direction));
            ProductAvailabilityDao.update(catalogueRecord);
        } else {
            const newCatalogueRecord = {
                Store: item.Store,
                Product: item.Product,
                Quantity: 0,
            };
            ProductAvailabilityDao.create(newCatalogueRecord);
        }

    } else if (operation === "update") {
        // TODO: Implement update logic 
        // the idea is to be able to get the enity before the update to get the Quantity and then to make
        // an equation that looks like that:  catalogueRecord.Quantity -= (oldQuanity - item.Quantity)
    } else if (operation === "delete") {
        // TODO: Implement delete logic
        // the same with update but like this: catalogueRecord.Quantity += oldQuanity
    } else {
        throw new Error("Unknown operation: " + operation);
    }
};
