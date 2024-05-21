import { GoodsReceiptRepository } from "../../gen/dao/GoodsReceipts/GoodsReceiptRepository";
//import { GoodsReceiptItemRepository, GoodsReceiptItemEntity } from "../../gen/dao/GoodsReceipts/GoodsReceiptItemRepository";
import { StockRecordRepository } from "../../gen/dao/StockRecords/StockRecordRepository";
import { CatalogueRepository } from "codbex-products/gen/dao/Products/CatalogueRepository"

export const trigger = (event) => {
    const GoodsReceiptDao = new GoodsReceiptRepository();
    const StockRecordDao = new StockRecordRepository();
    const CatalogueDao = new CatalogueRepository();
    const item = event.entity;
    const operation = event.operation;
    const header = GoodsReceiptDao.findById(item.GoodsReceipt);

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
            Direction: 1,
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
            if (header.Store === undefined) {
                throw new Error("Store is undefined in GoodsIssue header");
            }
            const catalogueRecord = {
                Store: header.Store,
                Product: record.Product,
                Quantity: record.Quantity * record.Direction,
                UoM: record.UoM
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