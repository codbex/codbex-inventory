import { GoodsIssueRepository as GoodsIssueDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/GoodsIssues/GoodsIssueRepository";
import { GoodsIssueItemRepository as GoodsIssueItemDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/GoodsIssues/GoodsIssueItemRepository";
import { ProductRepository as ProductDao } from "../../../../codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { CompanyRepository as CompanyDao } from "../../../../codbex-companies/gen/codbex-companies/dao/Companies/CompanyRepository";
import { CityRepository as CityDao } from "../../../../codbex-cities/gen/codbex-cities/dao/Cities/CityRepository";
import { CountryRepository as CountryDao } from "../../../../codbex-countries/gen/codbex-countries/dao/Countries/CountryRepository";
import { StoreRepository as StoreDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/Stores/StoreRepository";


import { Controller, Get } from "sdk/http";

@Controller
class GoodsIssueService {

    private readonly goodsIssueDao;
    private readonly goodsIssueItemDao;
    private readonly productDao;
    private readonly companyDao;
    private readonly cityDao;
    private readonly countryDao;
    private readonly storeDao;

    constructor() {
        this.goodsIssueDao = new GoodsIssueDao();
        this.goodsIssueItemDao = new GoodsIssueItemDao();
        this.productDao = new ProductDao();
        this.companyDao = new CompanyDao();
        this.cityDao = new CityDao();
        this.countryDao = new CountryDao();
        this.storeDao = new StoreDao();
    }

    @Get("/:goodsIssueId")
    public purchaseOrderData(_: any, ctx: any) {
        const goodsIssueId = ctx.pathParameters.goodsIssueId;

        let goodsIssue = this.goodsIssueDao.findById(goodsIssueId);

        let goodsIssueItems = this.goodsIssueItemDao.findAll({
            $filter: {
                equals: {
                    GoodsIssue: goodsIssue.Id
                }
            }
        });

        goodsIssueItems.forEach((item: any) => {
            let product = this.productDao.findById(item.Product);
            item.Product = product.Name;
        });

        let company;

        if (goodsIssue.Company) {
            company = this.companyDao.findById(goodsIssue.Company);
            let city = this.cityDao.findById(company.City);
            let country = this.countryDao.findById(company.Country);

            company.City = city.Name;
            company.Country = country.Name;
        }

        let store;

        if (goodsIssue.Store) {
            store = this.storeDao.findById(goodsIssue.Store);
        }


        return {
            goodsIssue: goodsIssue,
            goodsIssueItems: goodsIssueItems,
            company: company,
            store: store
        }

    }
}