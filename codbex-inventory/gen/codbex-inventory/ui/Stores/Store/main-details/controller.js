angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Store successfully created';
		let propertySuccessfullyUpdated = 'Store successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Store Details',
			create: 'Create Store',
			update: 'Update Store'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-inventory:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-inventory:defaults.formHeadSelect', { name: '$t(codbex-inventory:t.STORE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-inventory:defaults.formHeadCreate', { name: '$t(codbex-inventory:t.STORE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-inventory:defaults.formHeadUpdate', { name: '$t(codbex-inventory:t.STORE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyCreated', { name: '$t(codbex-inventory:t.STORE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyUpdated', { name: '$t(codbex-inventory:t.STORE)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'Stores' && e.view === 'Store' && e.type === 'entity');
		});

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Stores.Store.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCountry = [];
				$scope.optionsCity = [];
				$scope.optionsStatus = [];
				$scope.optionsCompany = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Stores.Store.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCountry = data.optionsCountry;
				$scope.optionsCity = data.optionsCity;
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsCompany = data.optionsCompany;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Stores.Store.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsCountry = data.optionsCountry;
				$scope.optionsCity = data.optionsCity;
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsCompany = data.optionsCompany;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Stores.Store.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = data.entity;
				$scope.optionsCountry = data.optionsCountry;
				$scope.optionsCity = data.optionsCity;
				$scope.optionsStatus = data.optionsStatus;
				$scope.optionsCompany = data.optionsCompany;
				$scope.action = 'update';
			});
		}});

		$scope.serviceCountry = '/services/ts/codbex-countries/gen/codbex-countries/api/Countries/CountryService.ts';
		$scope.serviceCity = '/services/ts/codbex-cities/gen/codbex-cities/api/Settings/CityService.ts';
		$scope.serviceStatus = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StoreStatusService.ts';
		$scope.serviceCompany = '/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts';


		$scope.$watch('entity.Country', (newValue, oldValue) => {
			if (newValue !== undefined && newValue !== null) {
				$http.get($scope.serviceCountry + '/' + newValue).then((response) => {
					let valueFrom = response.data.Id;
					$http.post('/services/ts/codbex-cities/gen/codbex-cities/api/Settings/CityService.ts/search', {
						$filter: {
							equals: {
								Country: valueFrom
							}
						}
					}).then((response) => {
						$scope.optionsCity = response.data.map(e => ({
							value: e.Id,
							text: e.Name
						}));
						if ($scope.action !== 'select' && newValue !== oldValue) {
							if ($scope.optionsCity.length == 1) {
								$scope.entity.City = $scope.optionsCity[0].value;
							} else {
								$scope.entity.City = undefined;
							}
						}
					}, (error) => {
						console.error(error);
					});
				}, (error) => {
					console.error(error);
				});
			}
		});
		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Stores.Store.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.Stores.Store.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.STORE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.STORE'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.STORE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Stores.Store.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.Stores.Store.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.STORE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.STORE'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.STORE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-inventory.Stores.Store.clearDetails');
		};
		
		//-----------------Dialogs-------------------//
		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};
		
		$scope.createCountry = () => {
			Dialogs.showWindow({
				id: 'Country-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createCity = () => {
			Dialogs.showWindow({
				id: 'City-details',
				params: {
					action: 'create',
					entity: {},
				},
				closeButton: false
			});
		};
		$scope.createStatus = () => {
			Dialogs.showWindow({
				id: 'StoreStatus-details',
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

		//-----------------Dialogs-------------------//



		//----------------Dropdowns-----------------//

		$scope.refreshCountry = () => {
			$scope.optionsCountry = [];
			$http.get('/services/ts/codbex-countries/gen/codbex-countries/api/Countries/CountryService.ts').then((response) => {
				$scope.optionsCountry = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Country',
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshCity = () => {
			$scope.optionsCity = [];
			$http.get('/services/ts/codbex-cities/gen/codbex-cities/api/Settings/CityService.ts').then((response) => {
				$scope.optionsCity = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'City',
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshStatus = () => {
			$scope.optionsStatus = [];
			$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StoreStatusService.ts').then((response) => {
				$scope.optionsStatus = response.data.map(e => ({
					value: e.Id,
					text: e.Name
				}));
			}, (error) => {
				console.error(error);
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Status',
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
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
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});