const navigationData = {
    id: 'delivery-note-navigation',
    label: "Delivery Note",
    view: "delivery-note",
    group: "inventory",
    orderNumber: 1000,
    lazyLoad: true,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/DeliveryNote/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }