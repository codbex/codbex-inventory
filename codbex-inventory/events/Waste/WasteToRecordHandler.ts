import { WasteRepository } from "../../gen/codbex-inventory/dao/Waste/WasteRepository";
import { CatalogueRepository } from "codbex-products/gen/codbex-products/dao/Catalogues/CatalogueRepository";

export const trigger = (event) => {
    const WasteDao = new WasteRepository();
    const CatalogueDao = new CatalogueRepository();
    const item = event.entity;
    const operation = event.operation;

    if (operation === "create") {
        const catalogueRecords = CatalogueDao.findAll({
            $filter: {
                equals: {
                    Store: item.Store,
                    Product: item.Product,
                },
            },
        });

        if (catalogueRecords.length > 0) {
            const catalogueRecord = catalogueRecords[0];
            catalogueRecord.Quantity = (catalogueRecord.Quantity - item.Quantity) < 0 ? 0 : (catalogueRecord.Quantity - item.Quantity);
            CatalogueDao.update(catalogueRecord);
        } else {
            //No item has been found
            // const newCatalogueRecord = {
            //     Store: item.Store,
            //     Product: item.Product,
            //     Quantity: item.Quantity,
            // };
            // CatalogueDao.create(newCatalogueRecord);
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
