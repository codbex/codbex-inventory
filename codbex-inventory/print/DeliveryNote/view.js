const viewData = {
    id: 'delivery-note-print',
    label: 'Print',
    link: '/services/ts/codbex-templates/print/delivery-note-print-template.ts',
    perspective: 'DeliveryNote',
    view: 'DeliveryNote',
    type: 'entity',
    order: 30
};

if (typeof exports !== 'undefined') {
    exports.getDialogWindow = function () {
        return viewData;
    }
}