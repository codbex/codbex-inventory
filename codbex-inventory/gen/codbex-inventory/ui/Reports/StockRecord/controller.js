angular.module('page', ['blimpKit', 'platformView', 'EntityService'])
	.config(['EntityServiceProvider', (EntityServiceProvider) => {
		EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockRecords/StockRecordService.ts';
	}])
	.controller('PageController', ($scope, $http, EntityService, Extensions) => {
		const Dialogs = new DialogHub();
		$scope.dataPage = 1;
		$scope.dataCount = 0;
		$scope.dataLimit = 20;

		//-----------------Custom Actions-------------------//
		Extensions.getWindows(['codbex-inventory-custom-action']).then((response) => {
			$scope.pageActions = response.data.filter(e => e.perspective === 'StockRecords' && e.view === 'StockRecord' && (e.type === 'page' || e.type === undefined));
			$scope.entityActions = response.data.filter(e => e.perspective === 'StockRecords' && e.view === 'StockRecord' && e.type === 'entity');
		});

		$scope.triggerPageAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
				path: action.path,
				params: {
					filterEntity: $scope.filterEntity,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
					optionsDirection: $scope.optionsDirection,
				},
				maxWidth: action.maxWidth,
				maxHeight: action.maxHeight,
				closeButton: true,
			});
		};

		$scope.triggerEntityAction = (action) => {
			Dialogs.showWindow({
				hasHeader: true,
        		title: action.label,
				path: action.path,
				params: {
					id: $scope.entity.Id
				},
				closeButton: true,
			});
		};
		//-----------------Custom Actions-------------------//

		function resetPagination() {
			$scope.dataPage = 1;
			$scope.dataCount = 0;
			$scope.dataLimit = 20;
		}
		resetPagination();

		//-----------------Events-------------------//
		Dialogs.addMessageListener({ topic: 'codbex-inventory.StockRecords.StockRecord.entitySearch', handler: (data) => {
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
			$scope.dataPage = pageNumber;
			EntityService.count(filter).then((resp) => {
				if (resp.data) {
					$scope.dataCount = resp.data.count;
				}
				let offset = (pageNumber - 1) * $scope.dataLimit;
				let limit = $scope.dataLimit;
				let request;
				if (filter) {
					filter.$offset = offset;
					filter.$limit = limit;
					request = EntityService.search(filter);
				} else {
					request = EntityService.list(offset, limit);
				}
				request.then((response) => {
					$scope.data = response.data;
				}, (error) => {
					const message = error.data ? error.data.message : '';
					Dialogs.showAlert({
						title: "StockRecord",
						message: `Unable to list/filter StockRecord: '${message}'`,
						type: AlertTypes.Error
					});
					console.error('EntityService:', error);
				});
			}, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: "StockRecord",
					message: `Unable to count StockRecord: '${message}'`,
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
		};
		$scope.loadPage($scope.dataPage, $scope.filter);

		$scope.selectEntity = (entity) => {
			$scope.selectedEntity = entity;
		};

		$scope.openDetails = (entity) => {
			$scope.selectedEntity = entity;
			Dialogs.showWindow({
				id: 'StockRecord-Report-details',
				params: {
					action: "select",
					entity: entity,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
					optionsDirection: $scope.optionsDirection,
				},
			});
		};

		$scope.openFilter = () => {
			Dialogs.showWindow({
				id: 'StockRecord-Report-filter',
				params: {
					entity: $scope.filterEntity,
					optionsProduct: $scope.optionsProduct,
					optionsUoM: $scope.optionsUoM,
					optionsDirection: $scope.optionsDirection,
				},
			});
		};

		//----------------Dropdowns-----------------//
		$scope.optionsProduct = [];
		$scope.optionsUoM = [];
		$scope.optionsDirection = [];

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

		$http.get('/services/ts/codbex-uoms/gen/codbex-uoms/api/UnitsOfMeasures/UoMService.ts').then((response) => {
			$scope.optionsUoM = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'UoM',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});

		$http.get('/services/ts/codbex-inventory/gen/codbex-inventory/api/Settings/StockRecordDirectionService.ts').then((response) => {
			$scope.optionsDirection = response.data.map(e => ({
				value: e.Id,
				text: e.Name
			}));
		}, (error) => {
			console.error(error);
			const message = error.data ? error.data.message : '';
			Dialogs.showAlert({
				title: 'Direction',
				message: `Unable to load data: '${message}'`,
				type: AlertTypes.Error
			});
		});
		$scope.optionsProductValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsProduct.length; i++) {
				if ($scope.optionsProduct[i].value === optionKey) {
					return $scope.optionsProduct[i].text;
				}
			}
			return null;
		};
		$scope.optionsUoMValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsUoM.length; i++) {
				if ($scope.optionsUoM[i].value === optionKey) {
					return $scope.optionsUoM[i].text;
				}
			}
			return null;
		};
		$scope.optionsDirectionValue = (optionKey) => {
			for (let i = 0; i < $scope.optionsDirection.length; i++) {
				if ($scope.optionsDirection[i].value === optionKey) {
					return $scope.optionsDirection[i].text;
				}
			}
			return null;
		};
		//----------------Dropdowns-----------------//
	});