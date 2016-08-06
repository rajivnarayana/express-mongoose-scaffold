import { ODM } from "./module";
import { FieldConstructor } from "./fields";
import { AutoRouter } from "./router";

export = function (Model) {
    return new AutoRouter(Model, new FieldConstructor(Model).getFields(), new ODM(Model)).getRouter();
}