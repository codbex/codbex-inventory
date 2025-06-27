const viewData = {
    id: 'goods-issue-print',
    label: 'Print',
    path: '/services/ts/codbex-templates/print/goods-issue-print-template.ts',
    perspective: 'GoodsIssues',
    view: 'GoodsIssue',
    type: 'entity',
    order: 30
};

if (typeof exports !== 'undefined') {
    exports.getView = () => viewData;
}