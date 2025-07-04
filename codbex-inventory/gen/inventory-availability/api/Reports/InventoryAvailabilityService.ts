import { Controller, Get, Post } from "sdk/http"
import { InventoryAvailabilityRepository, InventoryAvailabilityFilter, InventoryAvailabilityPaginatedFilter } from "../../dao/Reports/InventoryAvailabilityRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { HttpUtils } from "../utils/HttpUtils";

@Controller
class InventoryAvailabilityService {

    private readonly repository = new InventoryAvailabilityRepository();

    @Get("/")
    public filter(_: any, ctx: any) {
        try {
            this.checkPermissions("read");

            const filter: InventoryAvailabilityPaginatedFilter = {
                Store: ctx.queryParameters.Store ? ctx.queryParameters.Store : undefined,
                "$limit": ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                "$offset": ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            return this.repository.findAll(filter).map(e => this.transformEntity("read", e));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count(_: any, ctx: any) {
        try {
            this.checkPermissions("read");

            const filter: InventoryAvailabilityFilter = {
                Store: ctx.queryParameters.Store ? ctx.queryParameters.Store : undefined,
            };
            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/count")
    public countWithFilter(filter: any) {
        try {
            this.checkPermissions("read");

            return { count: this.repository.count(filter) };
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/search")
    public search(filter: any) {
        try {
            this.checkPermissions("read");

            return this.repository.findAll(filter).map(e => this.transformEntity("read", e));
        } catch (error: any) {
            this.handleError(error);
        }
    }

    private handleError(error: any) {
        if (error.name === "ForbiddenError") {
            HttpUtils.sendForbiddenRequest(error.message);
        } else if (error.name === "ValidationError") {
            HttpUtils.sendResponseBadRequest(error.message);
        } else {
            HttpUtils.sendInternalServerError(error.message);
        }
    }

    private checkPermissions(operationType: string) {
        if (operationType === "read" && !(user.isInRole("codbex-inventory.Report.InventoryAvailabilityReadOnly"))) {
            throw new ForbiddenError();
        }
    }

    private transformEntity(operationType: string, originalEntity: any) {
        const entity = { ...originalEntity };
        return entity;
    }

}