angular.module('page', ["ideUI", "ideView", "entityApi"])
	.config(["messageHubProvider", function (messageHubProvider) {
		messageHubProvider.eventIdPrefix = 'codbex-inventory.DeliveryNote.DeliveryNote';
	}])
	.config(["entityApiProvider", function (entityApiProvider) {
		entityApiProvider.baseUrl = "/services/ts/codbex-inventory/gen/codbex-inventory/api/DeliveryNote/DeliveryNoteService.ts";
	}])
	.controller('PageController', ['$scope', 'Extensions', 'messageHub', 'entityApi', function ($scope, Extensions, messageHub, entityApi) {

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: "DeliveryNote Details",
			create: "Create DeliveryNote",
			update: "Update DeliveryNote"
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.get('dialogWindow', 'codbex-inventory-custom-action').then(function (response) {
			$scope.entityActions = response.filter(e => e.perspective === "DeliveryNote" && e.view === "DeliveryNote" && e.type === "entity");
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
				$scope.optionsEmployee = [];
				$scope.optionsCompany = [];
				$scope.optionsCustomer = [];
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
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.action = 'select';
			});
		});

		messageHub.onDidReceiveMessage("createEntity", function (msg) {
			$scope.$apply(function () {
				$scope.entity = {};
				$scope.optionsStore = msg.data.optionsStore;
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsCustomer = msg.data.optionsCustomer;
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
				$scope.optionsEmployee = msg.data.optionsEmployee;
				$scope.optionsCompany = msg.data.optionsCompany;
				$scope.optionsCustomer = msg.data.optionsCustomer;
				$scope.action = 'update';
			});
		});

		$scope.serviceStore = "/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts";
		$scope.serviceEmployee = "/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts";
		$scope.serviceCompany = "/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts";
		$scope.serviceCustomer = "/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts";

		//-----------------Events-------------------//

		$scope.create = function () {
			entityApi.create($scope.entity).then(function (response) {
				if (response.status != 201) {
					messageHub.showAlertError("DeliveryNote", `Unable to create DeliveryNote: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityCreated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("DeliveryNote", "DeliveryNote successfully created");
			});
		};

		$scope.update = function () {
			entityApi.update($scope.entity.Id, $scope.entity).then(function (response) {
				if (response.status != 200) {
					messageHub.showAlertError("DeliveryNote", `Unable to update DeliveryNote: '${response.message}'`);
					return;
				}
				messageHub.postMessage("entityUpdated", response.data);
				messageHub.postMessage("clearDetails", response.data);
				messageHub.showAlertSuccess("DeliveryNote", "DeliveryNote successfully updated");
			});
		};

		$scope.cancel = function () {
			messageHub.postMessage("clearDetails");
		};

	}]);