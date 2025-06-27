angular.module('page', ['blimpKit', 'platformView']).controller('PageController', ($scope, ViewParameters) => {
	const Dialogs = new DialogHub();
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
		$scope.optionsStore = params.optionsStore;
		$scope.optionsType = params.optionsType;
		$scope.optionsOperator = params.optionsOperator;
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
		if (entity.DateFrom) {
			filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
		}
		if (entity.DateTo) {
			filter.$filter.lessThanOrEqual.Date = entity.DateTo;
		}
		if (entity.Number) {
			filter.$filter.contains.Number = entity.Number;
		}
		if (entity.Store !== undefined) {
			filter.$filter.equals.Store = entity.Store;
		}
		if (entity.Purpose) {
			filter.$filter.contains.Purpose = entity.Purpose;
		}
		if (entity.Type !== undefined) {
			filter.$filter.equals.Type = entity.Type;
		}
		if (entity.Operator !== undefined) {
			filter.$filter.equals.Operator = entity.Operator;
		}
		if (entity.Description) {
			filter.$filter.contains.Description = entity.Description;
		}
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		if (entity.UUID) {
			filter.$filter.contains.UUID = entity.UUID;
		}
		if (entity.Reference) {
			filter.$filter.contains.Reference = entity.Reference;
		}
		Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-inventory.StockAdjustments.StockAdjustment.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'StockAdjustment-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});