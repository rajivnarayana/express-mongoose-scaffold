import { ODM } from "./module";
import { FieldConstructor } from "./fields";
import { AutoRouter } from "./router";
import { RESTRouter } from "./rest-router";

export = function (Model, fields, odm) {
    return {
        adminRouter : new AutoRouter(Model, fields || new FieldConstructor(Model).getFields(), odm || new ODM(Model)).getRouter(),
        apiRouter : new RESTRouter(Model, new ODM(Model)).getRouter()
    }
}