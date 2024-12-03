const navigationData = {
    id: 'goods-issues-navigation',
    label: "Goods Issues",
    group: "inventory",
    order: 200,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/GoodsIssues/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }