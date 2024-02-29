angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.StockRecords.StockRecord';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/api/StockRecords/StockRecordService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsProduct = params.optionsProduct;
				$scope.optionsUoM = params.optionsUoM;
				$scope.optionsDirection = params.optionsDirection;
			}
		}

		$scope.filter = function () {
			let entity = $scope.entity;
			const filter = {
				$filter: {
					equals: {
					},
					notEquals: {
					},
					contains: {
					},
					greaterThan: {
					},
					greaterThanOrEqual: {
					},
					lessThan: {
					},
					lessThanOrEqual: {
					}
				},
			};
			if (entity.Id) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Reference) {
				filter.$filter.contains.Reference = entity.Reference;
			}
			if (entity.Product) {
				filter.$filter.equals.Product = entity.Product;
			}
			if (entity.Quantity) {
				filter.$filter.equals.Quantity = entity.Quantity;
			}
			if (entity.UoM) {
				filter.$filter.equals.UoM = entity.UoM;
			}
			if (entity.Price) {
				filter.$filter.equals.Price = entity.Price;
			}
			if (entity.Net) {
				filter.$filter.equals.Net = entity.Net;
			}
			if (entity.VAT) {
				filter.$filter.equals.VAT = entity.VAT;
			}
			if (entity.Gross) {
				filter.$filter.equals.Gross = entity.Gross;
			}
			if (entity.Direction) {
				filter.$filter.equals.Direction = entity.Direction;
			}
			if (entity.ItemId) {
				filter.$filter.equals.ItemId = entity.ItemId;
			}
			if (entity.Deleted) {
				filter.$filter.equals.Deleted = entity.Deleted;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("StockRecord-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);