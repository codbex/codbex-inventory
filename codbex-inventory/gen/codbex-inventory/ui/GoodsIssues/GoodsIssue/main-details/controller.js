angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/GoodsIssues/GoodsIssueService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'GoodsIssue Details',
			create: 'Create GoodsIssue',
			update: 'Update GoodsIssue'
		};
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'GoodsIssues' && e.view === 'GoodsIssue' && e.type === 'entity');
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
		Dialogs.addMessageListener({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsCompany = [];
				$scope.optionsCurrency = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = data.optionsStore;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCurrency = data.optionsCurrency;
				$scope.action = 'update';
			});
		}});

		$scope.serviceStore = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts';
		$scope.serviceCompany = '/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts';
		$scope.serviceCurrency = '/services/ts/codbex-currencies/gen/codbex-currencies/api/Currencies/CurrencyService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.clearDetails' , data: response.data });
				Notifications.show({
					title: 'GoodsIssue',
					description: 'GoodsIssue successfully created',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'GoodsIssue',
					message: `Unable to create GoodsIssue: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssue.clearDetails', data: response.data });
				Notifications.show({
					title: 'GoodsIssue',
					description: 'GoodsIssue successfully updated',
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'GoodsIssue',
					message: `Unable to create GoodsIssue: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-inventory.GoodsIssues.GoodsIssue.clearDetails');
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
		$scope.createCompany = () => {
			Dialogs.showWindow({
				id: 'Company-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createCurrency = () => {
			Dialogs.showWindow({
				id: 'Currency-details',
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
		$scope.refreshCompany = () => {
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
		};
		$scope.refreshCurrency = () => {
			$scope.optionsCurrency = [];
			$http.get('/services/ts/codbex-currencies/gen/codbex-currencies/api/Currencies/CurrencyService.ts').then((response) => {
				$scope.optionsCurrency = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Currency',
					message: `Unable to load data: '${message}'`,
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});