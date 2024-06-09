angular.module('page', ["ideUI", "ideView", "entityApi"])
    .config(["messageHubProvider", function (messageHubProvider) {
        messageHubProvider.eventIdPrefix = 'codbex-inventory.Reports.StockRecord';
    }])
    .config(["entityApiProvider", function (entityApiProvider) {
        entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/api/StockRecords/StockRecordService.ts";
    }])
    .controller('PageController', ['$scope', 'messageHub', 'entityApi', 'ViewParameters', function ($scope, messageHub, entityApi, ViewParameters) {

		let params = ViewParameters.get();
		if (Object.keys(params).length) {         
            const filterEntity = params.filterEntity ?? {};

			const filter = {
				$filter: {
					equals: {},
					notEquals: {},
					contains: {},
					greaterThan: {},
					greaterThanOrEqual: {},
					lessThan: {},
					lessThanOrEqual: {}
				},
			};
			if (filterEntity.Id) {
				filter.$filter.equals.Id = filterEntity.Id;
			}
			if (filterEntity.Product) {
				filter.$filter.equals.Product = filterEntity.Product;
			}
			if (filterEntity.Quantity) {
				filter.$filter.equals.Quantity = filterEntity.Quantity;
			}
			if (filterEntity.UoM) {
				filter.$filter.equals.UoM = filterEntity.UoM;
			}
			if (filterEntity.Price) {
				filter.$filter.equals.Price = filterEntity.Price;
			}
			if (filterEntity.Net) {
				filter.$filter.equals.Net = filterEntity.Net;
			}
			if (filterEntity.VAT) {
				filter.$filter.equals.VAT = filterEntity.VAT;
			}
			if (filterEntity.Gross) {
				filter.$filter.equals.Gross = filterEntity.Gross;
			}
			if (filterEntity.Direction) {
				filter.$filter.equals.Direction = filterEntity.Direction;
			}
			if (filterEntity.ItemId) {
				filter.$filter.equals.ItemId = filterEntity.ItemId;
			}
			if (filterEntity.Deleted) {
				filter.$filter.equals.Deleted = filterEntity.Deleted;
			}
			if (filterEntity.Reference) {
				filter.$filter.contains.Reference = filterEntity.Reference;
			}

            $scope.filter = filter;

			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsUoM = params.optionsUoM;
			$scope.optionsDirection = params.optionsDirection;
		}

        $scope.loadPage = function (filter) {
            if (!filter && $scope.filter) {
                filter = $scope.filter;
            }
            let request;
            if (filter) {
                request = entityApi.search(filter);
            } else {
                request = entityApi.list();
            }
            request.then(function (response) {
                if (response.status != 200) {
                    messageHub.showAlertError("StockRecord", `Unable to list/filter StockRecord: '${response.message}'`);
                    return;
                }
                $scope.data = response.data;
                setTimeout(() => {
                    window.print();

                }, 250);
            });
        };
        $scope.loadPage($scope.filter);

		$scope.optionsProductValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		$scope.optionsUoMValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUoM.length; i++) {
				if ($scope.optionsUoM[i].value === optionKey) {
					return $scope.optionsUoM[i].text;
				}
			}
			return null;
		};
		$scope.optionsDirectionValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsDirection.length; i++) {
				if ($scope.optionsDirection[i].value === optionKey) {
					return $scope.optionsDirection[i].text;
				}
			}
			return null;
		};
        window.onafterprint = () => {
            messageHub.closeDialogWindow("codbex-inventory-Reports-StockRecord-print");
        }

    }]);
