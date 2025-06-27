angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'StockAdjustment Details',
			create: 'Create StockAdjustment',
			update: 'Update StockAdjustment'
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'StockAdjustments' && e.view === 'StockAdjustment' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsType = [];
				$scope.optionsOperator = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsType = data.optionsType;
				$scope.optionsOperator = data.optionsOperator;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = data.optionsStore;
				$scope.optionsType = data.optionsType;
				$scope.optionsOperator = data.optionsOperator;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsType = data.optionsType;
				$scope.optionsOperator = data.optionsOperator;
				$scope.action = 'update';
			});
		}});

		$scope.serviceStore = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts';
		$scope.serviceType = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockAdjustmentTypeService.ts';
		$scope.serviceOperator = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.clearDetails' , data: response.data });
				Notifications.show({
					title: 'StockAdjustment',
					description: 'StockAdjustment successfully created',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockAdjustment',
					message: `Unable to create StockAdjustment: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.clearDetails', data: response.data });
				Notifications.show({
					title: 'StockAdjustment',
					description: 'StockAdjustment successfully updated',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockAdjustment',
					message: `Unable to create StockAdjustment: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-inventory.StockAdjustments.StockAdjustment.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: 'Description',
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createStore = () => {
			Dialogs.showWindow({
				id: 'Store-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createType = () => {
			Dialogs.showWindow({
				id: 'StockAdjustmentType-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createOperator = () => {
			Dialogs.showWindow({
				id: 'Employee-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshStore = () => {
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
		};
		$scope.refreshType = () => {
			$scope.optionsType = [];
			$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockAdjustmentTypeService.ts').then((response) => {
				$scope.optionsType = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Type',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshOperator = () => {
			$scope.optionsOperator = [];
			$http.get('/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts').then((response) => {
				$scope.optionsOperator = response.data.map(e => ({
					value: e.Id,
					text: e.FirstName
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Operator',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});