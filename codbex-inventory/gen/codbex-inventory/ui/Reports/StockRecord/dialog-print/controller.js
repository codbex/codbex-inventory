angular.module('page', ['blimpKit', 'platformView', 'platformLocale', 'EntityService'])
    .config(['EntityServiceProvider', (EntityServiceProvider) => {
        EntityServiceProvider.baseUrl = '/services/ts/codbex-inventory/gen/codbex-inventory/api/StockRecords/StockRecordService.ts';
    }])
    .controller('PageController', ($scope, EntityService, LocaleService, ViewParameters) => {
        const Dialogs = new DialogHub();
		let params = ViewParameters.get();
		if (Object.keys(params).length) {         
            const filterEntity = params.filterEntity ?? {};

			const filter = {
				$filter: {
					equals: {},
					notEquals: {},
					contains: {},
					greaterThan: {},
					greaterThanOrEqual: {},
					lessThan: {},
					lessThanOrEqual: {}
				},
			};
			if (filterEntity.Id) {
				filter.$filter.equals.Id = filterEntity.Id;
			}
			if (filterEntity.Product) {
				filter.$filter.equals.Product = filterEntity.Product;
			}
			if (filterEntity.Quantity) {
				filter.$filter.equals.Quantity = filterEntity.Quantity;
			}
			if (filterEntity.Price) {
				filter.$filter.equals.Price = filterEntity.Price;
			}
			if (filterEntity.Net) {
				filter.$filter.equals.Net = filterEntity.Net;
			}
			if (filterEntity.UoM) {
				filter.$filter.equals.UoM = filterEntity.UoM;
			}
			if (filterEntity.VAT) {
				filter.$filter.equals.VAT = filterEntity.VAT;
			}
			if (filterEntity.Gross) {
				filter.$filter.equals.Gross = filterEntity.Gross;
			}
			if (filterEntity.Direction) {
				filter.$filter.equals.Direction = filterEntity.Direction;
			}
			if (filterEntity.ItemId) {
				filter.$filter.equals.ItemId = filterEntity.ItemId;
			}
			if (filterEntity.Deleted) {
				filter.$filter.equals.Deleted = filterEntity.Deleted;
			}
			if (filterEntity.Reference) {
				filter.$filter.contains.Reference = filterEntity.Reference;
			}

            $scope.filter = filter;

			$scope.optionsProduct = params.optionsProduct;
			$scope.optionsUoM = params.optionsUoM;
			$scope.optionsDirection = params.optionsDirection;
		}

        $scope.loadPage = (filter) => {
            if (!filter && $scope.filter) {
                filter = $scope.filter;
            }
            let request;
            if (filter) {
                request = EntityService.search(filter);
            } else {
                request = EntityService.list();
            }
            request.then((response) => {
                $scope.data = response.data;
                setTimeout(() => {
                    window.print();
                }, 250);
            }, (error) => {
				const message = error.data ? error.data.message : '';
				Dialogs.showAlert({
					title: LocaleService.t('codbex-inventory:t.STOCKRECORD'),
					message: LocaleService.t('codbex-inventory:messages.error.unableToLF', { name: '$t(codbex-inventory:t.STOCKRECORD)', message: message }),
					type: AlertTypes.Error
				});
				console.error('EntityService:', error);
			});
        };
        $scope.loadPage($scope.filter);

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
        window.onafterprint = () => {
            Dialogs.closeWindow({ path: viewData.path });
        }
    });