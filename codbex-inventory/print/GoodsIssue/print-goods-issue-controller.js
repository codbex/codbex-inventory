const app = angular.module('templateApp', ['ideUI', 'ideView']);
app.controller('templateController', ['$scope', '$http', 'ViewParameters', function ($scope, $http, ViewParameters) {
    const params = ViewParameters.get();

    const printGoodsIssueUrl = "/services/ts/codbex-inventory/print/GoodsIssue/api/GoodsIssueService.ts/" + params.id;

    $http.get(printGoodsIssueUrl)
        .then(function (response) {
            $scope.GoodsIssue = response.data.goodsIssue;
            $scope.GoodsIssueItems = response.data.goodsIssueItems;
            $scope.Store = response.data.store;
            $scope.Company = response.data.company;
        });
}]);
