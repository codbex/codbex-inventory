const viewData = {
    id: 'codbex-inventory-Reports-StockRecord-print',
    label: 'Print',
    path: '/services/web/codbex-inventory/gen/codbex-inventory/ui/Reports/StockRecord/dialog-print/index.html',
    perspective: 'Reports',
    view: 'StockRecord',
    type: 'page',
    order: 10
};
if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}