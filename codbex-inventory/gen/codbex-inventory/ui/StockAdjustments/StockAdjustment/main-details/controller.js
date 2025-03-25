angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.StockAdjustments.StockAdjustment';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentService.ts";
	}])
	.controller('PageController', ['$scope',  '$http', 'Extensions', 'messageHub', 'entityApi', function ($scope,  $http, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "StockAdjustment Details",
			create: "Create StockAdjustment",
			update: "Update StockAdjustment"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-inventory-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "StockAdjustments" && e.view === "StockAdjustment" && e.type === "entity");
		});

		$scope.triggerEntityAction = function (action) {
			messageHub.showDialogWindow(
				action.id,
				{
					id: $scope.entity.Id
				},
				null,
				true,
				action
			);
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		messageHub.onDidReceiveMessage("clearDetails", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsType = [];
				$scope.optionsOperator = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsType = msg.data.optionsType;
				$scope.optionsOperator = msg.data.optionsOperator;
				$scope.action = 'update';
			});
		});

		$scope.serviceStore = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";
		$scope.serviceType = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockAdjustmentTypeService.ts";
		$scope.serviceOperator = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("StockAdjustment", `Unable to create StockAdjustment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("StockAdjustment", "StockAdjustment successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("StockAdjustment", `Unable to update StockAdjustment: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("StockAdjustment", "StockAdjustment successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};
		
		//-----------------Dialogs-------------------//
		
		$scope.createStore = function () {
			messageHub.showDialogWindow("Store-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createType = function () {
			messageHub.showDialogWindow("StockAdjustmentType-details", {
				action: "create",
				entity: {},
			}, null, false);
		};
		$scope.createOperator = function () {
			messageHub.showDialogWindow("Employee-details", {
				action: "create",
				entity: {},
			}, null, false);
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshStore = function () {
			$scope.optionsStore = [];
			$http.get("/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts").then(function (response) {
				$scope.optionsStore = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshType = function () {
			$scope.optionsType = [];
			$http.get("/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockAdjustmentTypeService.ts").then(function (response) {
				$scope.optionsType = response.data.map(e => {
					return {
						value: e.Id,
						text: e.Name
					}
				});
			});
		};
		$scope.refreshOperator = function () {
			$scope.optionsOperator = [];
			$http.get("/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts").then(function (response) {
				$scope.optionsOperator = response.data.map(e => {
					return {
						value: e.Id,
						text: e.FirstName
					}
				});
			});
		};

		//----------------Dropdowns-----------------//	
		

	}]);