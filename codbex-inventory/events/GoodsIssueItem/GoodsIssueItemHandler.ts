import { GoodsIssueRepository } from "../../gen/dao/GoodsIssues/GoodsIssueRepository";
import { GoodsIssueItemRepository } from "../../gen/dao/GoodsIssues/GoodsIssueItemRepository";

export const trigger = (event) => {
    const GoodsIssueDao = new GoodsIssueRepository();
    const GoodsIssueItemDao = new GoodsIssueItemRepository();
    const item = event.entity;

    const items = GoodsIssueItemDao.findAll({
        $filter: {
            equals: {
                GoodsIssue: item.GoodsIssue
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

    const header = GoodsIssueDao.findById(item.GoodsIssue);
    header.Net = net;
    header.VAT = vat;
    header.Gross = gross;
    GoodsIssueDao.update(header);
}