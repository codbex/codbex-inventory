import { StoreRepository } from "codbex-inventory/gen/codbex-inventory/dao/Stores/StoreRepository";
import { CityRepository } from "codbex-cities/gen/codbex-cities/dao/Cities/CityRepository";

export const trigger = (event) => {
    const StoreDao = new StoreRepository();
    const CityDao = new CityRepository();

    const item = event.entity;
    const operation = event.operation;

    if (operation === "create") {

        const stores = StoreDao.findAll({
            $filter: {
                equals: {
                    Id: item.Id
                }
            }
        });

        const cities = CityDao.findAll({
            $filter: {
                equals: {
                    Id: item.City
                }
            }
        });

        stores[0].Country = cities[0].Country;

        StoreDao.update(stores[0]);

    }

}