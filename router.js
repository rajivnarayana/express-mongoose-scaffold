"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const cms_forms_1 = require("cms-forms");
const cms_grids_1 = require("cms-grids");
const express_1 = require("express");
const bodyParser = require("body-parser");
class AutoRouter {
    constructor(Model, fields, odm) {
        this.Model = Model;
        this.fields = fields;
        this.odm = odm;
        this.relativeURL = path => path;
    }
    beforeAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            req.flash = req.flash || (() => { });
            res.locals.flash = res.locals.flash || { shift: () => undefined };
            this.relativeURL = path => req.baseUrl + path;
            res.html = {};
            next();
        });
    }
    afterAll(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            next();
        });
    }
    onParamId(req, res, next, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                req.object = yield this.odm.read(id);
            }
            catch (error) {
            }
            next();
        });
    }
    list(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            let list = yield this.odm.list();
            res.grid = this.constructResults(list);
            next();
        });
    }
    constructResults(list) {
        const grid = new cms_grids_1.Grid();
        grid.header = "<h2>All Items</h2><a class='btn btn-primary' href='" + this.relativeURL('/new') + "'>New</a>";
        let fieldsToDisplay = this.fields.filter(field => field.type != cms_forms_1.WidgetTypes.Submit);
        grid.headerRow = fieldsToDisplay.map(field => field.label);
        grid.headerRow.push("Actions");
        grid.rows = list.map((item) => {
            let row = new cms_grids_1.Row();
            row.columns = fieldsToDisplay.map(field => {
                if (field.ref && item[field.name]) {
                    return item[field.name]['name'] || item[field.name]['title'] || "";
                }
                return item[field.name] || "";
            });
            row.actions = [
                {
                    title: 'Edit',
                    href: this.relativeURL(`/${item.id}/edit`)
                }, {
                    title: 'Delete',
                    href: this.relativeURL(`/${item.id}/delete`)
                }
            ];
            return row;
        });
        return grid;
    }
    onPrepareNewForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.form = new cms_forms_1.Form();
            res.form.method = "POST";
            res.form.header = "<h2>Create New</h2>";
            res.form.action = this.relativeURL('/new');
            res.form.fields = this.fields;
            for (let field of res.form.fields) {
                if (field.type == cms_forms_1.WidgetTypes.Select && field.ref) {
                    field.options = yield this.odm.listAsSelectOptions(field.ref);
                }
            }
            next();
        });
    }
    onPrepareSearchForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.form = new cms_forms_1.Form();
            res.form.method = "GET";
            res.form.header = "<h2>Search</h2>";
            res.form.action = this.relativeURL('/search');
            res.form.field = this.fields;
            for (let field of res.form.fields) {
                if (field.type == cms_forms_1.WidgetTypes.Select && field.ref) {
                    field.options = yield this.odm.listAsSelectOptions(field.ref);
                }
            }
            next();
        });
    }
    onSearchForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!req.query) {
                return next();
            }
            try {
                let results = yield this.odm.search(req.query);
                res.grid = this.constructResults(results);
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    /**
     * Populate res.html with both the form and grid.
     */
    renderSearchResultsAndForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
        });
    }
    onPrepareEditForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            this.onPrepareNewForm(req, res, () => {
                res.form.action = this.relativeURL(`/${req.params.id}/edit`);
                next();
            });
        });
    }
    onGetEditForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            res.form.setValues(req.object.toJSON());
            next();
        });
    }
    onPostNewForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.odm.add(req.body);
                req.flash('success', 'Saved successfuly');
                res.redirect(this.relativeURL('/'));
            }
            catch (error) {
                res.html.errors = error;
                res.form.setValues(req.body);
                next();
            }
        });
    }
    onPostEditForm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.odm.update(req.params.id, req.body);
                req.flash('success', 'Saved successfuly');
                res.redirect(this.relativeURL('/'));
            }
            catch (error) {
                res.html.errors = error;
                res.form.setValues(req.body);
                next();
            }
        });
    }
    onDelete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.odm.remove(req.params.id);
            res.redirect(this.relativeURL('/'));
        });
    }
    emptyMiddleware(req, res, next) {
        next();
    }
    getRouter() {
        let router = express_1.Router();
        router.use(bodyParser.urlencoded({ extended: false }));
        // router.use(flash());
        router.use(this.beforeAll.bind(this));
        router.param('id', this.onParamId.bind(this));
        router.get(['/', '/list'], this.list.bind(this));
        router.route('/search')
            .all(this.onPrepareEditForm.bind(this))
            .get(this.onSearchForm.bind(this))
            .all(this.renderSearchResultsAndForm.bind(this));
        router.route('/new')
            .all(this.onPrepareNewForm.bind(this))
            .get(this.emptyMiddleware.bind(this))
            .post(this.onPostNewForm.bind(this));
        router.route('/:id/edit').all((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.object) {
                return next();
            }
            this.onPrepareEditForm(req, res, next);
        })).get((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.object) {
                return next;
            }
            this.onGetEditForm(req, res, next);
        })).post((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.object) {
                return next();
            }
            this.onPostEditForm(req, res, next);
        }));
        router.get('/:id/delete', (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (!req.object) {
                return next();
            }
            this.onDelete(req, res, next);
        }));
        router.use(this.afterAll.bind(this));
        return router;
    }
}
exports.AutoRouter = AutoRouter;
//# sourceMappingURL=router.js.map