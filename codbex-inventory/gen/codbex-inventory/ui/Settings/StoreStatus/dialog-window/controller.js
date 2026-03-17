angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StoreStatusService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, LocaleService, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		let description = 'Description';
		let propertySuccessfullyCreated = 'StoreStatus successfully created';
		let propertySuccessfullyUpdated = 'StoreStatus successfully updated';

		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'StoreStatus Details',
			create: 'Create StoreStatus',
			update: 'Update StoreStatus'
		};
		$scope.action = 'select';

		LocaleService.onInit(() => {
			description = LocaleService.t('codbex-inventory:codbex-inventory-model.defaults.description');
			$scope.formHeaders.select = LocaleService.t('codbex-inventory:codbex-inventory-model.defaults.formHeadSelect', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)' });
			$scope.formHeaders.create = LocaleService.t('codbex-inventory:codbex-inventory-model.defaults.formHeadCreate', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)' });
			$scope.formHeaders.update = LocaleService.t('codbex-inventory:codbex-inventory-model.defaults.formHeadUpdate', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)' });
			propertySuccessfullyCreated = LocaleService.t('codbex-inventory:codbex-inventory-model.messages.propertySuccessfullyCreated', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)' });
			propertySuccessfullyUpdated = LocaleService.t('codbex-inventory:codbex-inventory-model.messages.propertySuccessfullyUpdated', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)' });
		});

		let params = ViewParameters.get();
		if (Object.keys(params).length) {
			$scope.action = params.action;
			$scope.entity = params.entity;
			$scope.selectedMainEntityKey = params.selectedMainEntityKey;
			$scope.selectedMainEntityId = params.selectedMainEntityId;
		}

		$scope.create = () => {
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.create(entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Settings.StoreStatus.entityCreated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:codbex-inventory-model.t.STORESTATUS'),
					description: propertySuccessfullyCreated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-inventory:codbex-inventory-model.messages.error.unableToCreate', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)', message: message });
				});
				console.error('EntityService:', error);
			});
		};

		$scope.update = () => {
			let id = $scope.entity.Id;
			let entity = $scope.entity;
			entity[$scope.selectedMainEntityKey] = $scope.selectedMainEntityId;
			EntityService.update(id, entity).then((response) => {
				Dialogs.postMessage({ topic: 'codbex-inventory.Settings.StoreStatus.entityUpdated', data: response.data });
				Notifications.show({
					title: LocaleService.t('codbex-inventory:codbex-inventory-model.t.STORESTATUS'),
					description: propertySuccessfullyUpdated,
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				$scope.$evalAsync(() => {
					$scope.errorMessage = LocaleService.t('codbex-inventory:codbex-inventory-model.messages.error.unableToUpdate', { name: '$t(codbex-inventory:codbex-inventory-model.t.STORESTATUS)', message: message });
				});
				console.error('EntityService:', error);
			});
		};


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
			Dialogs.closeWindow({ id: 'StoreStatus-details' });
		};

		$scope.clearErrorMessage = () => {
			$scope.errorMessage = null;
		};
	});