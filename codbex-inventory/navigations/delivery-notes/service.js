const navigationData = {
    id: 'delivery-note-navigation',
    label: "Delivery Note",
    group: "inventory",
    order: 300,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/DeliveryNote/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }