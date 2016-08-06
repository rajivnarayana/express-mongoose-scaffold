"use strict";
const module_1 = require("./module");
const fields_1 = require("./fields");
const router_1 = require("./router");
module.exports = function (Model) {
    return new router_1.AutoRouter(Model, new fields_1.FieldConstructor(Model).getFields(), new module_1.ODM(Model)).getRouter();
};
//# sourceMappingURL=index.js.map