angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentItemService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete StockAdjustmentItem? This action cannot be undone.',
			deleteTitle: 'Delete StockAdjustmentItem?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-inventory:defaults.yes');
			translated.no = LocaleService.t('codbex-inventory:defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-inventory:defaults.deleteTitle', { name: '$t(codbex-inventory:t.STOCKADJUSTMENTITEM)' });
			translated.deleteConfirm = LocaleService.t('codbex-inventory:messages.deleteConfirm', { name: '$t(codbex-inventory:t.STOCKADJUSTMENTITEM)' });
		});
		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'StockAdjustments' && e.view === 'StockAdjustmentItem' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'StockAdjustments' && e.view === 'StockAdjustmentItem' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					selectedMainEntityKey: 'StockAdjustment',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				params: {
					id: $scope.entity.Id,
					selectedMainEntityKey: 'StockAdjustment',
					selectedMainEntityId: $scope.selectedMainEntityId,
				},
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entitySelected', handler: (data) => {
			resetPagination();
			$scope.selectedMainEntityId = data.selectedMainEntityId;
			$scope.loadPage($scope.dataPage);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				resetPagination();
				$scope.selectedMainEntityId = null;
				$scope.data = null;
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.entity = {};
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entityCreated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entityUpdated', handler: () => {
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustmentItem.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			let StockAdjustment = $scope.selectedMainEntityId;
			$scope.dataPage = pageNumber;
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			if (!filter.$filter) {
				filter.$filter = {};
			}
			if (!filter.$filter.equals) {
				filter.$filter.equals = {};
			}
			filter.$filter.equals.StockAdjustment = StockAdjustment;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				filter.$offset = (pageNumber - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				EntityService.search(filter).then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENTITEM'),
						message: LocaleService.t('codbex-inventory:messages.error.unableToLF', { name: '$t(codbex-inventory:t.STOCKADJUSTMENTITEM)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENTITEM'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCount', { name: '$t(codbex-inventory:t.STOCKADJUSTMENTITEM)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'StockAdjustmentItem-details',
				params: {
					action: 'select',
					entity: entity,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'StockAdjustmentItem-filter',
				params: {
					entity: $scope.filterEntity,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
				},
			});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			Dialogs.showWindow({
				id: 'StockAdjustmentItem-details',
				params: {
					action: 'create',
					entity: {
						'StockAdjustment': $scope.selectedMainEntityId
					},
					selectedMainEntityKey: 'StockAdjustment',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
				},
				closeButton: false
			});
		};

		$scope.updateEntity = (entity) => {
			Dialogs.showWindow({
				id: 'StockAdjustmentItem-details',
				params: {
					action: 'update',
					entity: entity,
					selectedMainEntityKey: 'StockAdjustment',
					selectedMainEntityId: $scope.selectedMainEntityId,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
			},
				closeButton: false
			});
		};

		$scope.deleteEntity = (entity) => {
			let id = entity.Id;
			Dialogs.showDialog({
				title: translated.deleteTitle,
				message: translated.deleteConfirm,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: translated.yes,
				}, {
					id: 'delete-btn-no',
					label: translated.no,
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-inventory.StockAdjustments.StockAdjustmentItem.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENTITEM'),
							message: LocaleService.t('codbex-inventory:messages.error.unableToDelete', { name: '$t(codbex-inventory:t.STOCKADJUSTMENTITEM)', message: message }),
							type: AlertTypes.Error,
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProduct = [];
		$scope.optionsUoM = [];


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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsProductValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		$scope.optionsUoMValue = function (optionKey) {
			for (let i = 0; i < $scope.optionsUoM.length; i++) {
				if ($scope.optionsUoM[i].value === optionKey) {
					return $scope.optionsUoM[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
