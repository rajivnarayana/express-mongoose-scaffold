"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const mongoose_1 = require("mongoose");
class ODM {
    constructor(Model) {
        this.Model = Model;
    }
    getPathsToPopulate() {
        return Object.keys(this.Model.schema.paths)
            .filter(path => !path.startsWith("_"))
            .filter(path => typeof this.Model.schema.paths[path].options.ref !== 'undefined');
    }
    getPathsToSearch() {
        return Object.keys(this.Model.schema.paths)
            .filter(path => !path.startsWith("_"));
    }
    list(options = {}) {
        return __awaiter(this, void 0, Promise, function* () {
            let paths = this.getPathsToPopulate();
            return yield this.Model.find(options).populate(paths.join(', ')).exec();
        });
    }
    add(doc) {
        return __awaiter(this, void 0, Promise, function* () {
            return yield this.Model.create(doc);
        });
    }
    view(id) {
        return __awaiter(this, void 0, Promise, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new Error('Unknown Record');
            }
            let paths = this.getPathsToPopulate();
            return yield this.Model.findById(id).populate(paths.join(', '));
        });
    }
    read(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.Types.ObjectId.isValid(id)) {
                throw new Error('Unknown Record');
            }
            return yield this.Model.findById(id).exec();
        });
    }
    update(id, keysToSet = null, keysToUnset = null) {
        return __awaiter(this, void 0, Promise, function* () {
            let updates = {};
            if (keysToSet) {
                updates['$set'] = keysToSet;
            }
            if (keysToUnset) {
                updates['$unset'] = keysToUnset;
            }
            return yield this.Model.findByIdAndUpdate(id, updates, { 'new': true }).exec();
        });
    }
    remove(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.Model.findByIdAndRemove(id).exec();
        });
    }
    listAsSelectOptions(collection) {
        return __awaiter(this, void 0, void 0, function* () {
            let documents = yield mongoose_1.model(collection).find({}).exec();
            return documents.reduce((prev, doc) => {
                prev[doc.id] = doc.name || doc.title;
                return prev;
            }, {});
        });
    }
    search(body) {
        return __awaiter(this, void 0, void 0, function* () {
            let searchQuery = {};
            let pathsToSearch = this.getPathsToSearch();
            Object.keys(body)
                .filter(key => pathsToSearch.indexOf(key) != undefined)
                .reduce((prev, key) => {
                let val = this.Model.schema.paths[key];
                if (val.options.type == String) {
                    // if (val.enumValues && val.enumValues.length) {
                    // }
                    prev[key] = new RegExp(body[key], 'i');
                }
                else if (val.options.type == Boolean) {
                    prev[key] = JSON.parse(body[key]);
                }
                else if (val.options.type == Number) {
                    prev[key] = JSON.parse(body[key]);
                }
                else if (val.options.type == mongoose_1.Schema.ObjectId && val.options.ref) {
                    prev[key] = body[key];
                }
                return prev;
            }, searchQuery);
            return yield this.list(searchQuery);
        });
    }
}
exports.ODM = ODM;
//# sourceMappingURL=module.js.map