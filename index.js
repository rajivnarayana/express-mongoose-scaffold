"use strict";
const module_1 = require("./module");
const fields_1 = require("./fields");
const router_1 = require("./router");
const rest_router_1 = require("./rest-router");
module.exports = function (Model, fields, odm) {
    return {
        adminRouter: new router_1.AutoRouter(Model, fields || new fields_1.FieldConstructor(Model).getFields(), odm || new module_1.ODM(Model)).getRouter(),
        apiRouter: new rest_router_1.RESTRouter(Model, new module_1.ODM(Model)).getRouter()
    };
};
//# sourceMappingURL=index.js.map