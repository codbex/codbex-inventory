import { GoodsReceiptRepository } from "../../gen/dao/GoodsReceipts/GoodsReceiptRepository";
//import { GoodsReceiptItemRepository, GoodsReceiptItemEntity } from "../../gen/dao/GoodsReceipts/GoodsReceiptItemRepository";
import { StockRecordRepository } from "../../gen/dao/StockRecords/StockRecordRepository";

export const trigger = (event) => {
    const GoodsReceiptDao = new GoodsReceiptRepository();
    const StockRecordDao = new StockRecordRepository();
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
        console.log("RECORD" + JSON.stringify(record));
        StockRecordDao.create(record);
    } else if (operation === "update") {
        // TODO find by Item Id and update
    } else if (operation === "delete") {
        // TODO find by Item Id and mark as deleted
    } else {
        throw new Error("Unknown operation: " + operation);
    }
}