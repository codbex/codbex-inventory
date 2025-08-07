angular.module('page', ['blimpKit', 'platformView', 'platformLocale']).controller('PageController', ($scope, ViewParameters) => {
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
		$scope.optionsCountry = params.optionsCountry;
		$scope.optionsCity = params.optionsCity;
		$scope.optionsStatus = params.optionsStatus;
		$scope.optionsCompany = params.optionsCompany;
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
		if (entity.Name) {
			filter.$filter.contains.Name = entity.Name;
		}
		if (entity.Email) {
			filter.$filter.contains.Email = entity.Email;
		}
		if (entity.Phone) {
			filter.$filter.contains.Phone = entity.Phone;
		}
		if (entity.Country !== undefined) {
			filter.$filter.equals.Country = entity.Country;
		}
		if (entity.City !== undefined) {
			filter.$filter.equals.City = entity.City;
		}
		if (entity.Address) {
			filter.$filter.contains.Address = entity.Address;
		}
		if (entity.PostCode) {
			filter.$filter.contains.PostCode = entity.PostCode;
		}
		if (entity.Location) {
			filter.$filter.contains.Location = entity.Location;
		}
		if (entity.Contact) {
			filter.$filter.contains.Contact = entity.Contact;
		}
		if (entity.Manager) {
			filter.$filter.contains.Manager = entity.Manager;
		}
		if (entity.Status !== undefined) {
			filter.$filter.equals.Status = entity.Status;
		}
		if (entity.Company !== undefined) {
			filter.$filter.equals.Company = entity.Company;
		}
		Dialogs.postMessage({ topic: 'codbex-inventory.Stores.Store.entitySearch', data: {
			entity: entity,
			filter: filter
		}});
		Dialogs.triggerEvent('codbex-inventory.Stores.Store.clearDetails');
		$scope.cancel();
	};

	$scope.resetFilter = () => {
		$scope.entity = {};
		$scope.filter();
	};

	$scope.cancel = () => {
		Dialogs.closeWindow({ id: 'Store-filter' });
	};

	$scope.clearErrorMessage = () => {
		$scope.errorMessage = null;
	};
});