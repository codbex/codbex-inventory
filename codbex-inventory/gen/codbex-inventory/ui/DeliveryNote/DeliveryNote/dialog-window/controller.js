angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/DeliveryNote/DeliveryNoteService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'DeliveryNote Details',
			create: 'Create DeliveryNote',
			update: 'Update DeliveryNote'
		};
		$scope.action = 'select';

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.Date) {
				params.entity.Date = new Date(params.entity.Date);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsStore = params.optionsStore;
			$scope.optionsEmployee = params.optionsEmployee;
			$scope.optionsCompany = params.optionsCompany;
			$scope.optionsCustomer = params.optionsCustomer;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entityCreated', data: response.data });
				Notifications.show({
					title: 'DeliveryNote',
					description: 'DeliveryNote successfully created',
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to create DeliveryNote: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: 'DeliveryNote',
					description: 'DeliveryNote successfully updated',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = `Unable to update DeliveryNote: '${message}'`;
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceStore = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts';
		
		$scope.optionsStore = [];
		
		$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts').then((response) => {
			$scope.optionsStore = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Store',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceEmployee = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';
		
		$scope.optionsEmployee = [];
		
		$http.get('/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts').then((response) => {
			$scope.optionsEmployee = response.data.map(e => ({
				value: e.Id,
				text: e.FirstName
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Employee',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceCompany = '/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts';
		
		$scope.optionsCompany = [];
		
		$http.get('/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts').then((response) => {
			$scope.optionsCompany = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Company',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.serviceCustomer = '/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts';
		
		$scope.optionsCustomer = [];
		
		$http.get('/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts').then((response) => {
			$scope.optionsCustomer = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Customer',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: 'Description',
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'DeliveryNote-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});