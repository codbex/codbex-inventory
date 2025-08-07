angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/GoodsIssues/GoodsIssueItemService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'GoodsIssueItem successfully created';
		let propertySuccessfullyUpdated = 'GoodsIssueItem successfully updated';
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'GoodsIssueItem Details',
			create: 'Create GoodsIssueItem',
			update: 'Update GoodsIssueItem'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-inventory:defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-inventory:defaults.formHeadSelect', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)' });
			$scope.formHeaders.create = LocaleService.t('codbex-inventory:defaults.formHeadCreate', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)' });
			$scope.formHeaders.update = LocaleService.t('codbex-inventory:defaults.formHeadUpdate', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyCreated', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-inventory:messages.propertySuccessfullyUpdated', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsUoM = params.optionsUoM;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssueItem.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.GOODSISSUEITEM'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.GOODSISSUEITEM'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCreate', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.GoodsIssues.GoodsIssueItem.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:t.GOODSISSUEITEM'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.GOODSISSUEITEM'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToUpdate', { name: '$t(codbex-inventory:t.GOODSISSUEITEM)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProduct = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
		$scope.serviceUoM = '/services/ts/codbex-uoms/gen/codbex-uoms/api/Settings/UoMService.ts';

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
			Dialogs.closeWindow({ id: 'GoodsIssueItem-details' });
		};
	});