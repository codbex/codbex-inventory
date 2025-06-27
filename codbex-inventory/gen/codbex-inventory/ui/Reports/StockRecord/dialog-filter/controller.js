angular.module('page', ['blimpKit', 'platformView']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
	$scope.entity = {};
	$scope.forms = {
		details: {},
	};

	let params = ViewParameters.get();
	if (Object.keys(params).length) {
		$scope.entity = params.entity ?? {};
		$scope.selectedMainEntityKey = params.selectedMainEntityKey;
		$scope.selectedMainEntityId = params.selectedMainEntityId;
		$scope.optionsProduct = params.optionsProduct;
		$scope.optionsUoM = params.optionsUoM;
		$scope.optionsDirection = params.optionsDirection;
	}

	$scope.filter = () => {
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
		if (entity.Reference) {
			filter.$filter.contains.Reference = entity.Reference;
		}
		Dialogs.postMessage({ topic: 'codbex-inventory.StockRecords.StockRecord.entitySearch', data: {
			entity: entity,
			filter: filter
		} });
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'StockRecord-Report-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});