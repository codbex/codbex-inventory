import { GoodsReceiptRepository } from "../../gen/codbex-inventory/dao/GoodsReceipts/GoodsReceiptRepository";
import { GoodsReceiptItemRepository } from "../../gen/codbex-inventory/dao/GoodsReceipts/GoodsReceiptItemRepository";

export const trigger = (event) => {
    const GoodsReceiptDao = new GoodsReceiptRepository();
    const GoodsReceiptItemDao = new GoodsReceiptItemRepository();
    const item = event.entity;

    const items = GoodsReceiptItemDao.findAll({
        $filter: {
            equals: {
                GoodsReceipt: item.GoodsReceipt
            }
        }
    });

    let net = 0;
    let vat = 0;
    let gross = 0;
    for (let i = 0; i < items.length; i++) {
        if (items[i].Net) {
            net += items[i].Net;
            vat += items[i].VAT;
            gross += items[i].Gross;
        }
    }

    const header = GoodsReceiptDao.findById(item.GoodsReceipt);
    header.Net = net;
    header.VAT = vat;
    header.Gross = gross;
    GoodsReceiptDao.update(header);
}