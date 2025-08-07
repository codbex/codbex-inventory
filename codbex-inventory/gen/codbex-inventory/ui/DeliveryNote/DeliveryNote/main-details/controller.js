angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(["EntityServiceProvider", (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/DeliveryNote/DeliveryNoteService.ts';
	}])
	.controller('PageController', ($scope, $http, Extensions, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'DeliveryNote successfully created';
		let propertySuccessfullyUpdated = 'DeliveryNote successfully updated';
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

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-inventory:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-inventory:defaults.formHeadSelect', { name: '$t(codbex-inventory:t.DELIVERYNOTE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-inventory:defaults.formHeadCreate', { name: '$t(codbex-inventory:t.DELIVERYNOTE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-inventory:defaults.formHeadUpdate', { name: '$t(codbex-inventory:t.DELIVERYNOTE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyCreated', { name: '$t(codbex-inventory:t.DELIVERYNOTE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyUpdated', { name: '$t(codbex-inventory:t.DELIVERYNOTE)' });
		});

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.entityActions = response.data.filter(e => e.perspective === 'DeliveryNote' && e.view === 'DeliveryNote' && e.type === 'entity');
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
		Dialogs.addMessageListener({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = [];
				$scope.optionsEmployee = [];
				$scope.optionsCompany = [];
				$scope.optionsCustomer = [];
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entitySelected', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCustomer = data.optionsCustomer;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.createEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.optionsStore = data.optionsStore;
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCustomer = data.optionsCustomer;
				$scope.action = 'create';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.updateEntity', handler: (data) => {
			$scope.$evalAsync(() => {
				if (data.entity.Date) {
					data.entity.Date = new Date(data.entity.Date);
				}
				$scope.entity = data.entity;
				$scope.optionsStore = data.optionsStore;
				$scope.optionsEmployee = data.optionsEmployee;
				$scope.optionsCompany = data.optionsCompany;
				$scope.optionsCustomer = data.optionsCustomer;
				$scope.action = 'update';
			});
		}});

		$scope.serviceStore = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Stores/StoreService.ts';
		$scope.serviceEmployee = '/services/ts/codbex-employees/gen/codbex-employees/api/Employees/EmployeeService.ts';
		$scope.serviceCompany = '/services/ts/codbex-companies/gen/codbex-companies/api/Companies/CompanyService.ts';
		$scope.serviceCustomer = '/services/ts/codbex-partners/gen/codbex-partners/api/Customers/CustomerService.ts';

		//-----------------Events-------------------//

		$scope.create = () => {
			EntityService.create($scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entityCreated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.clearDetails' , data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.DELIVERYNOTE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.DELIVERYNOTE'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.DELIVERYNOTE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			EntityService.update($scope.entity.Id, $scope.entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.entityUpdated', data: response.data });
				Dialogs.postMessage({ topic: 'codbex-inventory.DeliveryNote.DeliveryNote.clearDetails', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.DELIVERYNOTE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.DELIVERYNOTE'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.DELIVERYNOTE)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.cancel = () => {
			Dialogs.triggerEvent('codbex-inventory.DeliveryNote.DeliveryNote.clearDetails');
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
		$scope.createEmployee = () => {
			Dialogs.showWindow({
				id: 'Employee-details',
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
		$scope.createCustomer = () => {
			Dialogs.showWindow({
				id: 'Customer-details',
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
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};
		$scope.refreshEmployee = () => {
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
		$scope.refreshCustomer = () => {
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
					message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
					type: AlertTypes.Error
				});
			});
		};

		//----------------Dropdowns-----------------//	
	});