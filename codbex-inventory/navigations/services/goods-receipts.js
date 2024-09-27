const navigationData = {
    id: 'goods-receipts-navigation',
    label: "Goods Receipts",
    view: "goods-receipts",
    group: "inventory",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/GoodsReceipts/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }