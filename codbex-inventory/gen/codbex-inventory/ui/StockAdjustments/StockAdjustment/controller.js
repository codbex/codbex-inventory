angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, LocaleService, ButtonStates) => {
		const Dialogs = new DialogHub();
		let translated = {
			yes: 'Yes',
			no: 'No',
			deleteConfirm: 'Are you sure you want to delete StockAdjustment? This action cannot be undone.',
			deleteTitle: 'Delete StockAdjustment?'
		};

		LocaleService.onInit(() => {
			translated.yes = LocaleService.t('codbex-inventory:defaults.yes');
			translated.no = LocaleService.t('codbex-inventory:defaults.no');
			translated.deleteTitle = LocaleService.t('codbex-inventory:defaults.deleteTitle', { name: '$t(codbex-inventory:t.STOCKADJUSTMENT)' });
			translated.deleteConfirm = LocaleService.t('codbex-inventory:messages.deleteConfirm', { name: '$t(codbex-inventory:t.STOCKADJUSTMENT)' });
		});
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'StockAdjustments' && e.view === 'StockAdjustment' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: LocaleService.t(action.translation.key, action.translation.options, action.label),
				path: action.path,
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true
			});
		};
		//-----------------Custom Actions-------------------//

		function refreshData() {
			$scope.dataReset = true;
			$scope.dataPage--;
		}

		function resetPagination() {
			$scope.dataReset = true;
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 10;
		}

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entitySearch', handler: (data) => {
			resetPagination();
			$scope.filter = data.filter;
			$scope.filterEntity = data.entity;
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		//-----------------Events-------------------//

		$scope.loadPage = (pageNumber, filter) => {
			if (!filter && $scope.filter) {
				filter = $scope.filter;
			}
			if (!filter) {
				filter = {};
			}
			$scope.selectedEntity = null;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				$scope.dataPages = Math.ceil($scope.dataCount / $scope.dataLimit);
				filter.$offset = ($scope.dataPage - 1) * $scope.dataLimit;
				filter.$limit = $scope.dataLimit;
				if ($scope.dataReset) {
					filter.$offset = 0;
					filter.$limit = $scope.dataPage * $scope.dataLimit;
				}

				EntityService.search(filter).then((response) => {
					if ($scope.data == null || $scope.dataReset) {
						$scope.data = [];
						$scope.dataReset = false;
					}
					response.data.forEach(e => {
						if (e.Date) {
							e.Date = new Date(e.Date);
						}
					});

					$scope.data = $scope.data.concat(response.data);
					$scope.dataPage++;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENT'),
						message: LocaleService.t('codbex-inventory:messages.error.unableToLF', { name: '$t(codbex-inventory:t.STOCKADJUSTMENT)', message: message }),
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENT'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToCount', { name: '$t(codbex-inventory:t.STOCKADJUSTMENT)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsStore: $scope.optionsStore,
				optionsType: $scope.optionsType,
				optionsOperator: $scope.optionsOperator,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.createEntity', data: {
				entity: {},
				optionsStore: $scope.optionsStore,
				optionsType: $scope.optionsType,
				optionsOperator: $scope.optionsOperator,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-inventory.StockAdjustments.StockAdjustment.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionsStore: $scope.optionsStore,
				optionsType: $scope.optionsType,
				optionsOperator: $scope.optionsOperator,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.Id;
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
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-inventory.StockAdjustments.StockAdjustment.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: LocaleService.t('codbex-inventory:t.STOCKADJUSTMENT'),
							message: LocaleService.t('codbex-inventory:messages.error.unableToDelete', { name: '$t(codbex-inventory:t.STOCKADJUSTMENT)', message: message }),
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'StockAdjustment-filter',
				params: {
					entity: $scope.filterEntity,
					optionsStore: $scope.optionsStore,
					optionsType: $scope.optionsType,
					optionsOperator: $scope.optionsOperator,
				},
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsStore = [];
		$scope.optionsType = [];
		$scope.optionsOperator = [];


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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

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
				message: LocaleService.t('codbex-inventory:messages.error.unableToLoad', { message: message }),
				type: AlertTypes.Error
			});
		});

		$scope.optionsStoreValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsStore.length; i++) {
				if ($scope.optionsStore[i].value === optionKey) {
					return $scope.optionsStore[i].text;
				}
			}
			return null;
		};
		$scope.optionsTypeValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsType.length; i++) {
				if ($scope.optionsType[i].value === optionKey) {
					return $scope.optionsType[i].text;
				}
			}
			return null;
		};
		$scope.optionsOperatorValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsOperator.length; i++) {
				if ($scope.optionsOperator[i].value === optionKey) {
					return $scope.optionsOperator[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
