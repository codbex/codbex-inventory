const navigationData = {
    id: 'goods-receipts-navigation',
    label: "Goods Receipts",
    group: "inventory",
    order: 100,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/GoodsReceipts/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }