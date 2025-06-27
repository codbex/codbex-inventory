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
		if (entity.Id !== undefined) {
			filter.$filter.equals.Id = entity.Id;
		}
		if (entity.StockAdjustment !== undefined) {
			filter.$filter.equals.StockAdjustment = entity.StockAdjustment;
		}
		if (entity.Product !== undefined) {
			filter.$filter.equals.Product = entity.Product;
		}
		if (entity.AdjustedQuantity !== undefined) {
			filter.$filter.equals.AdjustedQuantity = entity.AdjustedQuantity;
		}
		if (entity.UoM !== undefined) {
			filter.$filter.equals.UoM = entity.UoM;
		}
		if (entity.Batch) {
			filter.$filter.contains.Batch = entity.Batch;
		}
		if (entity.Serial) {
			filter.$filter.contains.Serial = entity.Serial;
		}
		if (entity.Description) {
			filter.$filter.contains.Description = entity.Description;
		}
		Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'StockAdjustmentItem-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});