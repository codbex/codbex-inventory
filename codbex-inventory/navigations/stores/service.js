const navigationData = {
    id: 'stores-navigation',
    label: "Stores",
    group: "inventory",
    order: 600,
    link: "/services/web/codbex-inventory/gen/codbex-inventory/ui/Stores/index.html?embedded"
};

function getNavigation() {
    return navigationData;
}

if (typeof exports !== 'undefined') {
    exports.getNavigation = getNavigation;
}

export { getNavigation }