angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'Waste successfully created';
		let propertySuccessfullyUpdated = 'Waste successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'Waste Details',
			create: 'Create Waste',
			update: 'Update Waste'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-inventory:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-inventory:defaults.formHeadSelect', { name: '$t(codbex-inventory:t.WASTE)' });
			$scope.formHeaders.create = LocaleService.t('codbex-inventory:defaults.formHeadCreate', { name: '$t(codbex-inventory:t.WASTE)' });
			$scope.formHeaders.update = LocaleService.t('codbex-inventory:defaults.formHeadUpdate', { name: '$t(codbex-inventory:t.WASTE)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyCreated', { name: '$t(codbex-inventory:t.WASTE)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyUpdated', { name: '$t(codbex-inventory:t.WASTE)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			if (params.entity.Date) {
				params.entity.Date = new Date(params.entity.Date);
			}
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsWasteType = params.optionsWasteType;
			$scope.optionsCustomer = params.optionsCustomer;
			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsSupplier = params.optionsSupplier;
			$scope.optionsStore = params.optionsStore;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Waste.Waste.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.WASTE'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.WASTE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Waste.Waste.entityUpdated', data: response.data });
				$scope.cancel();
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.WASTE'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-inventory:messages.error.unableToUpdate', { name: '$t(codbex-inventory:t.WASTE)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceWasteType = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteTypeService.ts';
		
		$scope.optionsWasteType = [];
		
		$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteTypeService.ts').then((response) => {
			$scope.optionsWasteType = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'WasteType',
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});
		$scope.serviceProduct = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
		
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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});
		$scope.serviceSupplier = '/services/ts/codbex-partners/gen/codbex-partners/api/Suppliers/SupplierService.ts';
		
		$scope.optionsSupplier = [];
		
		$http.get('/services/ts/codbex-partners/gen/codbex-partners/api/Suppliers/SupplierService.ts').then((response) => {
			$scope.optionsSupplier = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Supplier',
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});
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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.alert = (message) => {
			if (message) Dialogs.showAlert({
				title: description,
				message: message,
				type: AlertTypes.Information,
				preformatted: true,
			});
		};

		$scope.cancel = () => {
			$scope.entity = {};
			$scope.action = 'select';
			Dialogs.closeWindow({ id: 'Waste-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});