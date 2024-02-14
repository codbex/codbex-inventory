angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.Stores.Store';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/api/Stores/StoreService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'entityApi', function ($scope, messageHub, entityApi) {

		$scope.entity = {};
		$scope.formErrors = {};

		if (window != null && window.frameElement != null && window.frameElement.hasAttribute("data-parameters")) {
			let dataParameters = window.frameElement.getAttribute("data-parameters");
			if (dataParameters) {
				let params = JSON.parse(dataParameters);
				$scope.entity = params.entity ?? {};
				$scope.selectedMainEntityKey = params.selectedMainEntityKey;
				$scope.selectedMainEntityId = params.selectedMainEntityId;
				$scope.optionsCity = params.optionsCity;
				$scope.optionsCountry = params.optionsCountry;
				$scope.optionsStatus = params.optionsStatus;
				$scope.optionsCompany = params.optionsCompany;
			}
		}

		$scope.isValid = function (isValid, property) {
			$scope.formErrors[property] = !isValid ? true : undefined;
			for (let next in $scope.formErrors) {
				if ($scope.formErrors[next] === true) {
					$scope.isFormValid = false;
					return;
				}
			}
			$scope.isFormValid = true;
		};

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
			if (entity.Name) {
				filter.$filter.contains.Name = entity.Name;
			}
			if (entity.Email) {
				filter.$filter.contains.Email = entity.Email;
			}
			if (entity.Phone) {
				filter.$filter.contains.Phone = entity.Phone;
			}
			if (entity.Address) {
				filter.$filter.contains.Address = entity.Address;
			}
			if (entity.PostCode) {
				filter.$filter.contains.PostCode = entity.PostCode;
			}
			if (entity.City) {
				filter.$filter.equals.City = entity.City;
			}
			if (entity.Country) {
				filter.$filter.equals.Country = entity.Country;
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
			if (entity.Status) {
				filter.$filter.equals.Status = entity.Status;
			}
			if (entity.Company) {
				filter.$filter.equals.Company = entity.Company;
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
			messageHub.closeDialogWindow("Store-filter");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);