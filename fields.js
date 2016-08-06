"use strict";
const mongoose_1 = require("mongoose");
const cms_forms_1 = require("cms-forms");
const toTitle = require("to-title-case");
class FieldConstructor {
    constructor(Model) {
        this.Model = Model;
    }
    getFields() {
        let fields = Object.keys(this.Model.schema.paths)
            .filter(path => !path.startsWith("_"))
            .map((path) => {
            let val = this.Model.schema.paths[path];
            let field = {};
            field.label = toTitle(path);
            field.name = path;
            field.type = cms_forms_1.WidgetTypes.TextField;
            if (val.options.type == String) {
                if (val.enumValues && val.enumValues.length) {
                    field.type = cms_forms_1.WidgetTypes.Select;
                    field.options = val.enumValues.reduce((prev, enumValue) => {
                        prev[enumValue] = toTitle(enumValue);
                        return prev;
                    }, {});
                }
            }
            else if (val.options.type == Boolean) {
                field.type = cms_forms_1.WidgetTypes.CheckBox;
            }
            else if (val.options.type == mongoose_1.Schema.ObjectId && val.options.ref) {
                field.type = cms_forms_1.WidgetTypes.Select;
                field.ref = val.options.ref;
            }
            return field;
        });
        fields.push({
            value: 'Submit',
            class: ['col-sm-offset-4', 'col-sm-4'],
            name: 'submit',
            type: cms_forms_1.WidgetTypes.Submit
        });
        return fields;
    }
}
exports.FieldConstructor = FieldConstructor;
//# sourceMappingURL=fields.js.map