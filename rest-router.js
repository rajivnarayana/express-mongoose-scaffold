"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator.throw(value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const express_1 = require("express");
const http_status_codes_1 = require("http-status-codes");
class RESTRouter {
    constructor(Model, odm) {
        this.Model = Model;
        this.odm = odm;
    }
    onParamId(req, res, next, id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                req.object = yield this.odm.read(id);
                next();
            }
            catch (error) {
                next(error);
            }
        });
    }
    onList(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(http_status_codes_1.OK).send(yield this.odm.list());
            }
            catch (error) {
                next(error);
            }
        });
    }
    onGet(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(http_status_codes_1.OK).send(yield this.odm.view(req.params.id));
            }
            catch (error) {
                next(error);
            }
        });
    }
    onPut(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.status(http_status_codes_1.OK).send(yield this.odm.update(req.params.id, req.body));
            }
            catch (error) {
                next(error);
            }
        });
    }
    onDelete(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.odm.remove(req.params.id);
                res.status(http_status_codes_1.OK).send();
            }
            catch (error) {
                next(error);
            }
        });
    }
    onPost(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.odm.add(req.body);
            }
            catch (error) {
                next(error);
            }
        });
    }
    getRouter() {
        let router = express_1.Router();
        router.param('id', this.onParamId.bind(this));
        router.route('/list.json')
            .get(this.onList.bind(this))
            .post(this.onPost.bind(this));
        router.route('/:id.json')
            .get(this.onGet.bind(this))
            .put(this.onPut.bind(this))
            .post(this.onPut.bind(this))
            .delete(this.onDelete.bind(this));
        return router;
    }
}
exports.RESTRouter = RESTRouter;
//# sourceMappingURL=rest-router.js.map