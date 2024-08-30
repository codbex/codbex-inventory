angular.module('page', ["ideUI", "ideView"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.Waste.Waste';
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', function ($scope, messageHub, ViewParameters) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			if (params?.entity?.DateFrom) {
				params.entity.DateFrom = new Date(params.entity.DateFrom);
			}
			if (params?.entity?.DateTo) {
				params.entity.DateTo = new Date(params.entity.DateTo);
			}
			$scope.entity = params.entity ?? {};
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsWasteType = params.optionsWasteType;
			$scope.optionsCustomer = params.optionsCustomer;
			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsSupplier = params.optionsSupplier;
			$scope.optionsStore = params.optionsStore;
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
			if (entity.Id !== undefined) {
				filter.$filter.equals.Id = entity.Id;
			}
			if (entity.Number) {
				filter.$filter.contains.Number = entity.Number;
			}
			if (entity.DateFrom) {
				filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
			}
			if (entity.DateTo) {
				filter.$filter.lessThanOrEqual.Date = entity.DateTo;
			}
			if (entity.WasteType !== undefined) {
				filter.$filter.equals.WasteType = entity.WasteType;
			}
			if (entity.Customer !== undefined) {
				filter.$filter.equals.Customer = entity.Customer;
			}
			if (entity.Product !== undefined) {
				filter.$filter.equals.Product = entity.Product;
			}
			if (entity.Quantity !== undefined) {
				filter.$filter.equals.Quantity = entity.Quantity;
			}
			if (entity.Supplier !== undefined) {
				filter.$filter.equals.Supplier = entity.Supplier;
			}
			if (entity.Store !== undefined) {
				filter.$filter.equals.Store = entity.Store;
			}
			if (entity.Reason) {
				filter.$filter.contains.Reason = entity.Reason;
			}
			messageHub.postMessage("entitySearch", {
				entity: entity,
				filter: filter
			});
			messageHub.postMessage("clearDetails");
			$scope.cancel();
		};

		$scope.resetFilter = function () {
			$scope.entity = {};
			$scope.filter();
		};

		$scope.cancel = function () {
			messageHub.closeDialogWindow("Waste-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);