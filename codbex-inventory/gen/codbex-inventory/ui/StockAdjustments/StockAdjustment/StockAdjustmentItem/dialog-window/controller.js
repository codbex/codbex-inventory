angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentItemService.ts';
	}])
	.controller('PageController', ($scope, $http, ViewParameters, EntityService) => {
		const Dialogs = new DialogHub();
		const Notifications = new NotificationHub();
		$scope.entity = {};
		$scope.forms = {
			details: {},
		};
		$scope.formHeaders = {
			select: 'StockAdjustmentItem Details',
			create: 'Create StockAdjustmentItem',
			update: 'Update StockAdjustmentItem'
		};
		$scope.action = 'select';

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
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entityCreated', data: response.data });
				Notifications.show({
					title: 'StockAdjustmentItem',
					description: 'StockAdjustmentItem successfully created',
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockAdjustmentItem',
					message: `Unable to create StockAdjustmentItem: '${message}'`,
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
				Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entityUpdated', data: response.data });
				Notifications.show({
					title: 'StockAdjustmentItem',
					description: 'StockAdjustmentItem successfully updated',
					type: 'positive'
				});
				$scope.cancel();
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'StockAdjustmentItem',
					message: `Unable to update StockAdjustmentItem: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.serviceProduct = '/services/ts/codbex-products/gen/codbex-products/api/Products/ProductService.ts';
		$scope.serviceUoM = '/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts';

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
			Dialogs.closeWindow({ id: 'StockAdjustmentItem-details' });
		};
	});