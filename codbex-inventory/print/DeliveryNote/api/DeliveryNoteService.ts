import { DeliveryNoteRepository as DeliveryNoteDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/DeliveryNote/DeliveryNoteRepository";
import { DeliveryNoteItemRepository as DeliveryNoteItemDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/DeliveryNote/DeliveryNoteItemRepository";
import { ProductRepository as ProductDao } from "../../../../codbex-products/gen/codbex-products/dao/Products/ProductRepository";
import { CompanyRepository as CompanyDao } from "../../../../codbex-companies/gen/codbex-companies/dao/Companies/CompanyRepository";
import { CityRepository as CityDao } from "../../../../codbex-cities/gen/codbex-cities/dao/Cities/CityRepository";
import { CountryRepository as CountryDao } from "../../../../codbex-countries/gen/codbex-countries/dao/Countries/CountryRepository";
import { StoreRepository as StoreDao } from "../../../../codbex-inventory/gen/codbex-inventory/dao/Stores/StoreRepository";
import { CustomerRepository as CustomerDao } from "../../../../codbex-partners/gen/codbex-partners/dao/Customers/CustomerRepository";
import { EmployeeRepository as EmployeeDao } from "../../../../codbex-employees/gen/codbex-employees/dao/Employees/EmployeeRepository";


import { Controller, Get } from "sdk/http";

@Controller
class DeliveryNoteService {

    private readonly deliveryNoteDao;
    private readonly deliveryNoteItemDao;
    private readonly productDao;
    private readonly companyDao;
    private readonly cityDao;
    private readonly countryDao;
    private readonly storeDao;
    private readonly customerDao;
    private readonly employeeDao;

    constructor() {
        this.deliveryNoteDao = new DeliveryNoteDao();
        this.deliveryNoteItemDao = new DeliveryNoteItemDao();
        this.productDao = new ProductDao();
        this.companyDao = new CompanyDao();
        this.cityDao = new CityDao();
        this.countryDao = new CountryDao();
        this.storeDao = new StoreDao();
        this.customerDao = new CustomerDao();
        this.employeeDao = new EmployeeDao();
    }

    @Get("/:deliveryNoteId")
    public deliveryNoteData(_: any, ctx: any) {
        const deliveryNoteId = ctx.pathParameters.deliveryNoteId;

        let deliveryNote = this.deliveryNoteDao.findById(deliveryNoteId);

        let deliveryNoteItems = this.deliveryNoteItemDao.findAll({
            $filter: {
                equals: {
                    DeliveryNote: deliveryNote.Id
                }
            }
        });

        deliveryNoteItems.forEach((item: any) => {
            let product = this.productDao.findById(item.Product);
            item.Product = product.Name;
        });

        let company;

        if (deliveryNote.Company) {
            company = this.companyDao.findById(deliveryNote.Company);
            let city = this.cityDao.findById(company.City);
            let country = this.countryDao.findById(company.Country);

            company.City = city.Name;
            company.Country = country.Name;
        }

        let store;

        if (deliveryNote.Store) {
            store = this.storeDao.findById(deliveryNote.Store);
        }

        const customer = this.customerDao.findAll({
            $filter: {
                equals: {
                    Id: deliveryNote.Customer
                }
            }
        });

        const employee = this.employeeDao.findAll({
            $filter: {
                equals: {
                    Id: deliveryNote.Employee
                }
            }
        });

        return {
            deliveryNote: deliveryNote,
            deliveryNoteItems: deliveryNoteItems,
            company: company,
            store: store,
            customer: customer[0].Name,
            employee: employee[0].FirstName
        }

    }
}