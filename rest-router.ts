import { Model as MongooseModel } from "mongoose";
import { ODM } from "./module";
import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";
import { OK } from "http-status-codes";

export class RESTRouter {
    
    constructor(public Model: MongooseModel, private odm: ODM) {

    }

    public async onParamId(req: Request, res: Response, next, id) {
        try{
            req.object = await this.odm.read(id);
            next();
        } catch(error){
            next(error);
        }
    }

    public async onList(req, res, next) {
        try {
            res.status(OK).send(await this.odm.list());
        } catch(error) {
            next(error);
        }
    }

    public async onGet(req, res, next) {
        try {
            res.status(OK).send(await this.odm.view(req.params.id));
        } catch (error) {
            next(error);
        }
    }

    public async onPut(req, res, next) {
        try {
            res.status(OK).send(await this.odm.update(req.params.id, req.body));
        } catch (error) {
            next(error);
        }
    }

    public async onDelete(req, res, next) {
        try {
            await this.odm.remove(req.params.id);
            res.status(OK).send();
        } catch (error) {
            next(error);
        }
    }

    public async onPost(req, res, next) {
        try {
            await this.odm.add(req.body);
        } catch (error) {
            next(error);
        }
    }

    public getRouter() {
        let router = Router();
        
        router.param('id', this.onParamId.bind(this));

        router.route('/list.json')
            .get(this.onList.bind(this))
            .post(this.onPost.bind(this))

        router.route('/:id.json')
            .get(this.onGet.bind(this))
            .put(this.onPut.bind(this))
            .post(this.onPut.bind(this))
            .delete(this.onDelete.bind(this))

        return router;
    }
}
