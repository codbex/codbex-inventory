angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.Stores.Store';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";
	}])
	.controller('PageController', ['$scope', 'messageHub', 'ViewParameters', 'entityApi', function ($scope, messageHub, ViewParameters, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Store Details",
			create: "Create Store",
			update: "Update Store"
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsCountry = params.optionsCountry;
			$scope.optionsCity = params.optionsCity;
			$scope.optionsStatus = params.optionsStatus;
			$scope.optionsCompany = params.optionsCompany;
		}

		$scope.create = function () {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.create(entity).then(function (response) {
				if (response.status != 201) {
					$scope.errorMessage = `Unable to create Store: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Store", "Store successfully created");
			});
		};

		$scope.update = function () {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			entityApi.update(id, entity).then(function (response) {
				if (response.status != 200) {
					$scope.errorMessage = `Unable to update Store: '${response.message}'`;
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				$scope.cancel();
				messageHub.showAlertSuccess("Store", "Store successfully updated");
			});
		};

		$scope.$watch('entity.Country', function (newValue, oldValue) {
			if (newValue !== undefined && newValue !== null) {
				entityApi.$http.post("/services/ts/codbex-cities/gen/codbex-cities/api/Cities/CityService.ts/search", {
					$filter: {
						equals: {
							Country: newValue
						}
					}
				}).then(function (response) {
					$scope.optionsCity = response.data.map(e => {
						return {
							value: e.Id,
							text: e.Name
						}
					});
					if ($scope.action !== 'select' && newValue !== oldValue) {
						$scope.entity.City = undefined;
					}
				});
			}
		});

		$scope.cancel = function () {
			$scope.entity = {};
			$scope.action = 'select';
			messageHub.closeDialogWindow("Store-details");
		};

		$scope.clearErrorMessage = function () {
			$scope.errorMessage = null;
		};

	}]);