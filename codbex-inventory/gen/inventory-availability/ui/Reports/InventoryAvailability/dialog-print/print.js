const viewData = {
    id: 'codbex-inventory-Reports-InventoryAvailability-print',
    label: 'Print',
    link: '/services/web/codbex-inventory/gen/inventory-availability/ui/Reports/InventoryAvailability/dialog-print/index.html',
    perspective: 'Reports',
    view: 'InventoryAvailability',
    type: 'page',
    order: 10
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}