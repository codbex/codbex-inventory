import { Controller, Get, Post, Put, Delete, response } from "sdk/http"
import { Extensions } from "sdk/extensions"
import { StockAdjustmentItemRepository, StockAdjustmentItemEntityOptions } from "../../dao/StockAdjustments/StockAdjustmentItemRepository";
import { user } from "sdk/security"
import { ForbiddenError } from "../utils/ForbiddenError";
import { ValidationError } from "../utils/ValidationError";
import { HttpUtils } from "../utils/HttpUtils";

const validationModules = await Extensions.loadExtensionModules("codbex-inventory-StockAdjustments-StockAdjustmentItem", ["validate"]);

@Controller
class StockAdjustmentItemService {

    private readonly repository = new StockAdjustmentItemRepository();

    @Get("/")
    public getAll(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const options: StockAdjustmentItemEntityOptions = {
                $limit: ctx.queryParameters["$limit"] ? parseInt(ctx.queryParameters["$limit"]) : undefined,
                $offset: ctx.queryParameters["$offset"] ? parseInt(ctx.queryParameters["$offset"]) : undefined
            };

            let StockAdjustment = parseInt(ctx.queryParameters.StockAdjustment);
            StockAdjustment = isNaN(StockAdjustment) ? ctx.queryParameters.StockAdjustment : StockAdjustment;

            if (StockAdjustment !== undefined) {
                options.$filter = {
                    equals: {
                        StockAdjustment: StockAdjustment
                    }
                };
            }

            return this.repository.findAll(options);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Post("/")
    public create(entity: any) {
        try {
            this.checkPermissions("write");
            this.validateEntity(entity);
            entity.Id = this.repository.create(entity);
            response.setHeader("Content-Location", "/services/ts/codbex-inventory/gen/codbex-inventory/api/StockAdjustments/StockAdjustmentItemService.ts/" + entity.Id);
            response.setStatus(response.CREATED);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/count")
    public count() {
        try {
            this.checkPermissions("read");
            return { count: this.repository.count() };
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
            return this.repository.findAll(filter);
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Get("/:id")
    public getById(_: any, ctx: any) {
        try {
            this.checkPermissions("read");
            const id = parseInt(ctx.pathParameters.id);
            const entity = this.repository.findById(id);
            if (entity) {
                return entity;
            } else {
                HttpUtils.sendResponseNotFound("StockAdjustmentItem not found");
            }
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Put("/:id")
    public update(entity: any, ctx: any) {
        try {
            this.checkPermissions("write");
            entity.Id = ctx.pathParameters.id;
            this.validateEntity(entity);
            this.repository.update(entity);
            return entity;
        } catch (error: any) {
            this.handleError(error);
        }
    }

    @Delete("/:id")
    public deleteById(_: any, ctx: any) {
        try {
            this.checkPermissions("write");
            const id = ctx.pathParameters.id;
            const entity = this.repository.findById(id);
            if (entity) {
                this.repository.deleteById(id);
                HttpUtils.sendResponseNoContent();
            } else {
                HttpUtils.sendResponseNotFound("StockAdjustmentItem not found");
            }
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
        if (operationType === "read" && !(user.isInRole("codbex-inventory.StockAdjustments.StockAdjustmentItemReadOnly") || user.isInRole("codbex-inventory.StockAdjustments.StockAdjustmentItemFullAccess"))) {
            throw new ForbiddenError();
        }
        if (operationType === "write" && !user.isInRole("codbex-inventory.StockAdjustments.StockAdjustmentItemFullAccess")) {
            throw new ForbiddenError();
        }
    }

    private validateEntity(entity: any): void {
        if (entity.Product === null || entity.Product === undefined) {
            throw new ValidationError(`The 'Product' property is required, provide a valid value`);
        }
        if (entity.AdjustedQuantity === null || entity.AdjustedQuantity === undefined) {
            throw new ValidationError(`The 'AdjustedQuantity' property is required, provide a valid value`);
        }
        if (entity.Batch?.length > 30) {
            throw new ValidationError(`The 'Batch' exceeds the maximum length of [30] characters`);
        }
        if (entity.Serial?.length > 30) {
            throw new ValidationError(`The 'Serial' exceeds the maximum length of [30] characters`);
        }
        if (entity.Description?.length > 200) {
            throw new ValidationError(`The 'Description' exceeds the maximum length of [200] characters`);
        }
        for (const next of validationModules) {
            next.validate(entity);
        }
    }

}
