import { Model as MongooseModel } from "mongoose";
import { Form, Field, WidgetTypes } from "cms-forms";
import { Grid, Row } from "cms-grids";
import { ODM } from "./module";
import { Router, Request, Response } from "express";
import * as bodyParser from "body-parser";

export class AutoRouter {

    private relativeURL = path => path;

    constructor(public Model: MongooseModel, private fields : Field[], private odm: ODM) {

    }

    public async beforeAll(req: Request, res : Response, next) {
        req.flash = req.flash || (() => {})
        res.locals.flash = res.locals.flash || { shift : () => undefined};
        this.relativeURL = path => req.baseUrl + path;
        res.html = {};
        next();
    }

    public async afterAll(req, res, next) {
        next();
    }

    public async onParamId(req: Request, res: Response, next, id) {
        try{
            req.object = await this.odm.read(id);
        } catch(error){
        }
        next();
    }

    public async list(req: Request, res: Response, next) {
        let list = await this.odm.list();
        const grid = new Grid();
        grid.header = "<h2>All Items</h2><a class='btn btn-primary' href='" + this.relativeURL('/new') + "'>New</a>";
        let fieldsToDisplay : Field [] = this.fields.filter(field => field.type != WidgetTypes.Submit);
        grid.headerRow = fieldsToDisplay.map(field => field.label);
        grid.headerRow.push("Actions");
        grid.rows = list.map((item) => {
            let row: Row = new Row();
            row.columns = fieldsToDisplay.map(field => {
                if (field.ref) {
                    return item[field.name]['name'] || item[field.name]['title'] || "";
                }
                return item[field.name] || ""
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
        })
        res.grid = grid;
        next();
    }

    private async onPrepareNewForm(req, res, next) {
        res.form = new Form();
        res.form.method = "POST";
        res.form.header = "<h2>Create New</h2>";
        res.form.action = this.relativeURL('/new');
        res.form.fields = this.fields;
        for (let field of res.form.fields) {
            if (field.type == WidgetTypes.Select && field.ref) {
                field.options = await this.odm.listAsSelectOptions(field.ref);
            }
        }
        next();
    }

    private async onPrepareEditForm(req, res, next) {
        this.onPrepareNewForm(req, res, ()=>{
            res.form.action = this.relativeURL(`/${req.params.id}/edit`);
            next();
        })
    }

    public async onGetEditForm(req, res, next) {
        res.form.setValues(req.object.toJSON());
        next();
    }

    public async onPostNewForm(req, res, next) {
        try {
            await this.odm.add(req.body);
            req.flash('success', 'Saved successfuly');
            res.redirect(this.relativeURL('/')); 
        } catch(error) {
            res.html.errors = error;
            res.form.setValues(req.body);
            next();
        }
    }

    public async onPostEditForm(req, res, next) {
        try {
            await this.odm.update(req.params.id, req.body);
            req.flash('success', 'Saved successfuly');
            res.redirect(this.relativeURL('/')); 
        } catch(error) {
            res.html.errors = error;
            res.form.setValues(req.body);
            next();
        }
    }

    public async onDelete(req, res, next) {
        await this.odm.remove(req.params.id);
        res.redirect(this.relativeURL('/'));
    }

    private emptyMiddleware(req, res, next) {
        next();
    }

    public getRouter() {
        let router = Router();
        
        router.use(bodyParser.urlencoded({ extended: false }));
        // router.use(flash());

        router.use(this.beforeAll.bind(this));

        router.param('id', this.onParamId.bind(this));

        router.get(['/','/list'], this.list.bind(this));

        router.route('/new')
            .all(this.onPrepareNewForm.bind(this))
            .get(this.emptyMiddleware.bind(this))
            .post(this.onPostNewForm.bind(this));

        router.route('/:id/edit').all( async (req, res, next) => {
            if (!req.object) {
                return next();
            }
            this.onPrepareEditForm(req, res, next);
        }).get(async (req, res, next) => {
            if (!req.object) {
                return next;
            }
            this.onGetEditForm(req, res, next);
        }).post(async (req, res, next) => {
            if (!req.object) {
                return next();
            }
            this.onPostEditForm(req, res, next);
        });

        router.get('/:id/delete', async (req, res, next) => {
            if (!req.object) {
                return next();
            }
            this.onDelete(req, res, next);
        });

        router.use(this.afterAll.bind(this));

        return router;
    }


}