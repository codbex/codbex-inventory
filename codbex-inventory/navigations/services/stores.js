const navigationData = {
    id: 'stores-navigation',
    label: "Stores",
    view: "stores",
    group: "configurations",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/Stores/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }