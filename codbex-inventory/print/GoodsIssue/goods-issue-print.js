const viewData = {
    id: 'goods-issue-print',
    label: 'Print',
    link: '/services/web/codbex-inventory/print/GoodsIssue/print-goods-issue.html',
    perspective: 'GoodsIssues',
    view: 'GoodsIssue',
    type: 'entity',
    order: 80
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}