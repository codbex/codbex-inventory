angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/Waste/WasteService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions, ButtonStates) => {
		const Dialogs = new DialogHub();
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataOffset = 0;
		$scope.dataLimit = 10;
		$scope.action = 'select';

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'Waste' && e.view === 'Waste' && (e.type === 'page' || e.type === undefined));
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
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
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Waste.Waste.clearDetails', handler: () => {
			$scope.$evalAsync(() => {
				$scope.selectedEntity = null;
				$scope.action = 'select';
			});
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Waste.Waste.entityCreated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Waste.Waste.entityUpdated', handler: () => {
			refreshData();
			$scope.loadPage($scope.dataPage, $scope.filter);
		}});
		Dialogs.addMessageListener({ topic: 'codbex-inventory.Waste.Waste.entitySearch', handler: (data) => {
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
						title: 'Waste',
						message: `Unable to list/filter Waste: '${message}'`,
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: 'Waste',
					message: `Unable to count Waste: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.postMessage({ topic: 'codbex-inventory.Waste.Waste.entitySelected', data: {
				entity: entity,
				selectedMainEntityId: entity.Id,
				optionsWasteType: $scope.optionsWasteType,
				optionsCustomer: $scope.optionsCustomer,
				optionsProduct: $scope.optionsProduct,
				optionsSupplier: $scope.optionsSupplier,
				optionsStore: $scope.optionsStore,
			}});
		};

		$scope.createEntity = () => {
			$scope.selectedEntity = null;
			$scope.action = 'create';

			Dialogs.postMessage({ topic: 'codbex-inventory.Waste.Waste.createEntity', data: {
				entity: {},
				optionsWasteType: $scope.optionsWasteType,
				optionsCustomer: $scope.optionsCustomer,
				optionsProduct: $scope.optionsProduct,
				optionsSupplier: $scope.optionsSupplier,
				optionsStore: $scope.optionsStore,
			}});
		};

		$scope.updateEntity = () => {
			$scope.action = 'update';
			Dialogs.postMessage({ topic: 'codbex-inventory.Waste.Waste.updateEntity', data: {
				entity: $scope.selectedEntity,
				optionsWasteType: $scope.optionsWasteType,
				optionsCustomer: $scope.optionsCustomer,
				optionsProduct: $scope.optionsProduct,
				optionsSupplier: $scope.optionsSupplier,
				optionsStore: $scope.optionsStore,
			}});
		};

		$scope.deleteEntity = () => {
			let id = $scope.selectedEntity.Id;
			Dialogs.showDialog({
				title: 'Delete Waste?',
				message: `Are you sure you want to delete Waste? This action cannot be undone.`,
				buttons: [{
					id: 'delete-btn-yes',
					state: ButtonStates.Emphasized,
					label: 'Yes',
				}, {
					id: 'delete-btn-no',
					label: 'No',
				}],
				closeButton: false
			}).then((buttonId) => {
				if (buttonId === 'delete-btn-yes') {
					EntityService.delete(id).then(() => {
						refreshData();
						$scope.loadPage($scope.dataPage, $scope.filter);
						Dialogs.triggerEvent('codbex-inventory.Waste.Waste.clearDetails');
					}, (error) => {
						const message = error.data ? error.data.message : '';
						Dialogs.showAlert({
							title: 'Waste',
							message: `Unable to delete Waste: '${message}'`,
							type: AlertTypes.Error
						});
						console.error('EntityService:', error);
					});
				}
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'Waste-filter',
				params: {
					entity: $scope.filterEntity,
					optionsWasteType: $scope.optionsWasteType,
					optionsCustomer: $scope.optionsCustomer,
					optionsProduct: $scope.optionsProduct,
					optionsSupplier: $scope.optionsSupplier,
					optionsStore: $scope.optionsStore,
				},
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsWasteType = [];
		$scope.optionsCustomer = [];
		$scope.optionsProduct = [];
		$scope.optionsSupplier = [];
		$scope.optionsStore = [];


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
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

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
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

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
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

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

		$scope.optionsWasteTypeValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsWasteType.length; i++) {
				if ($scope.optionsWasteType[i].value === optionKey) {
					return $scope.optionsWasteType[i].text;
				}
			}
			return null;
		};
		$scope.optionsCustomerValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsCustomer.length; i++) {
				if ($scope.optionsCustomer[i].value === optionKey) {
					return $scope.optionsCustomer[i].text;
				}
			}
			return null;
		};
		$scope.optionsProductValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		$scope.optionsSupplierValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsSupplier.length; i++) {
				if ($scope.optionsSupplier[i].value === optionKey) {
					return $scope.optionsSupplier[i].text;
				}
			}
			return null;
		};
		$scope.optionsStoreValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsStore.length; i++) {
				if ($scope.optionsStore[i].value === optionKey) {
					return $scope.optionsStore[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});
