const viewData = {
    id: 'codbex-inventory-Reports-StockRecord-print',
    label: 'Print',
    link: '/services/web/codbex-inventory/gen/ui/Reports/StockRecord/dialog-print/index.html',
    perspective: 'Reports',
    view: 'StockRecord',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}