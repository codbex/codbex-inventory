angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockRecords/StockRecordService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'StockRecord Details',
			create: 'Create StockRecord',
			update: 'Update StockRecord'
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'StockRecords' && e.view === 'StockRecord' && e.type === 'entity');
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
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockRecords.StockRecord.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsProduct = [];
				$scope.optionsUoM = [];
				$scope.optionsDirection = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockRecords.StockRecord.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsProduct = data.optionsProduct;
				$scope.optionsUoM = data.optionsUoM;
				$scope.optionsDirection = data.optionsDirection;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockRecords.StockRecord.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsProduct = data.optionsProduct;
				$scope.optionsUoM = data.optionsUoM;
				$scope.optionsDirection = data.optionsDirection;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockRecords.StockRecord.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsProduct = data.optionsProduct;
				$scope.optionsUoM = data.optionsUoM;
				$scope.optionsDirection = data.optionsDirection;
				$scope.action = 'update';
			});
		}});

		$scope.serviceProduct = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
		$scope.serviceUoM = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';
		$scope.serviceDirection = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockRecordDirectionService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.StockRecords.StockRecord.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.StockRecords.StockRecord.clearDetails' , data: response.data });
				Notifications.show({
					title: 'StockRecord',
					description: 'StockRecord successfully created',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockRecord',
					message: `Unable to create StockRecord: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.StockRecords.StockRecord.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.StockRecords.StockRecord.clearDetails', data: response.data });
				Notifications.show({
					title: 'StockRecord',
					description: 'StockRecord successfully updated',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockRecord',
					message: `Unable to create StockRecord: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-inventory.StockRecords.StockRecord.clearDetails');
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
		
		$scope.createProduct = () => {
			Dialogs.showWindow({
				id: 'Product-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createUoM = () => {
			Dialogs.showWindow({
				id: 'UoM-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createDirection = () => {
			Dialogs.showWindow({
				id: 'StockRecordDirection-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshProduct = () => {
			$scope.optionsProduct = [];
			$http.get('/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts').then((response) => {
				$scope.optionsProduct = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Product',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshUoM = () => {
			$scope.optionsUoM = [];
			$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts').then((response) => {
				$scope.optionsUoM = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'UoM',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshDirection = () => {
			$scope.optionsDirection = [];
			$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockRecordDirectionService.ts').then((response) => {
				$scope.optionsDirection = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Direction',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});