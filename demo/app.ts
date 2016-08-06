import * as express from "express";
import { Application, Request, Response } from "express";
import { OK } from "http-status-codes";
import * as autoRouter from "auto-router";
import { connect } from "mongoose";
import { render as formRenderer } from "cms-forms";
import { render as gridRenderer } from "cms-grids";
import * as path from "path";
import { model as FoodsModel } from "./models/something";
import { model as CategoriesModel } from "./models/category";

connect(process.env.MONGO_URL || "mongodb://localhost/auto-router-demo");

let app :Application = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.get('/', (request : Request, response : Response) => {
    response.status(OK).send("Hello World");
});

app.use('/categories', autoRouter(CategoriesModel));
app.use('/foods', autoRouter(FoodsModel));

app.use(formRenderer);
app.use(gridRenderer);

app.use((req, res, next) => {
    if (res.html) {
        if (res.html.errors && !Array.isArray(res.html.errors)) {
            res.html.errors = [res.html.errors];
        }
        res.locals.html = res.html;
        res.render(res.html.layout || 'layouts/master');
        delete res.html;
    } else {
        next();
    }
})

export = app;
