import { Model as MongooseModel, Schema } from "mongoose";
import { Field, WidgetTypes } from "cms-forms";
import * as toTitle from "to-title-case";

export class FieldConstructor {
    constructor(private Model:MongooseModel) {

    }

    public getFields() : Field[] {
        let fields : Field[] = Object.keys(this.Model.schema.paths)
            .filter(path => !path.startsWith("_") && !this.Model.schema.paths[path].options.hide)
            .map((path) => {
                let val = this.Model.schema.paths[path];
                let field : Field = {};
                field.label = toTitle(path);
                field.name = path;
                field.type = WidgetTypes.TextField;
                if (val.options.type == String) {
                    if (val.enumValues && val.enumValues.length) {
                        field.type = WidgetTypes.Select;
                        field.options = val.enumValues.reduce((prev, enumValue) => {
                            prev[enumValue] = toTitle(enumValue)
                            return prev;
                        }, {})
                    }
                } else if (val.options.type == Boolean) {
                    field.type = WidgetTypes.CheckBox;
                } else if (val.options.type == Schema.ObjectId && val.options.ref) {
                    field.type = WidgetTypes.Select;
                    field.ref = val.options.ref;
                }
                return field;
            });
        fields.push({
            value : 'Submit',
            class : ['col-sm-offset-4','col-sm-4'],
            name : 'submit',
            type : WidgetTypes.Submit
        })
        return fields;
    }    
}