const navigationData = {
    id: 'goods-issues-navigation',
    label: "Goods Issues",
    view: "goods-issues",
    group: "inventory",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/GoodsIssues/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }