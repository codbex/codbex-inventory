angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.Waste.Waste';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "Waste Details",
			create: "Create Waste",
			update: "Update Waste"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-inventory-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "Waste" && e.view === "Waste" && e.type === "entity");
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
				$scope.optionsWasteType = [];
				$scope.optionsCustomer = [];
				$scope.optionsProduct = [];
				$scope.optionsSupplier = [];
				$scope.optionsStore = [];
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("entitySelected", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsWasteType = msg.data.optionsWasteType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsWasteType = msg.data.optionsWasteType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.action = 'create';
			});
		});

		messageHub.onDidReceiveMessage("updateEntity", function (msg) {
			$scope.$apply(function () {
				if (msg.data.entity.Date) {
					msg.data.entity.Date = new Date(msg.data.entity.Date);
				}
				$scope.entity = msg.data.entity;
				$scope.optionsWasteType = msg.data.optionsWasteType;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.optionsProduct = msg.data.optionsProduct;
				$scope.optionsSupplier = msg.data.optionsSupplier;
				$scope.optionsStore = msg.data.optionsStore;
				$scope.action = 'update';
			});
		});

		$scope.serviceWasteType = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteTypeService.ts";
		$scope.serviceCustomer = "/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts";
		$scope.serviceProduct = "/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts";
		$scope.serviceSupplier = "/services/ts/codbex-partners/gen/codbex-partners/api/Suppliers/SupplierService.ts";
		$scope.serviceStore = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("Waste", `Unable to create Waste: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Waste", "Waste successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("Waste", `Unable to update Waste: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("Waste", "Waste successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);