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
		$scope.optionsEmployee = params.optionsEmployee;
		$scope.optionsCompany = params.optionsCompany;
		$scope.optionsCustomer = params.optionsCustomer;
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
		if (entity.Number) {
			filter.$filter.contains.Number = entity.Number;
		}
		if (entity.DateFrom) {
			filter.$filter.greaterThanOrEqual.Date = entity.DateFrom;
		}
		if (entity.DateTo) {
			filter.$filter.lessThanOrEqual.Date = entity.DateTo;
		}
		if (entity.Store !== undefined) {
			filter.$filter.equals.Store = entity.Store;
		}
		if (entity.Employee !== undefined) {
			filter.$filter.equals.Employee = entity.Employee;
		}
		if (entity.Company !== undefined) {
			filter.$filter.equals.Company = entity.Company;
		}
		if (entity.Customer !== undefined) {
			filter.$filter.equals.Customer = entity.Customer;
		}
		Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-inventory.DeliveryNote.DeliveryNote.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'DeliveryNote-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});