const navigationData = {
    id: 'stock-adjustments-navigation',
    label: "Stock Adjustments",
    group: "inventory",
    order: 400,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/StockAdjustments/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }