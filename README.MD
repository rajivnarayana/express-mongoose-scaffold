## Setup
```
npm install rajivnarayana/express-mongoose-scaffold
```

## Dependencies

This module depends on other modules to generate [forms](https://github.com/rajivnarayana/cms-forms) and [grids](https://github.com/rajivnarayana/cms-grids).

These modules will also help you theme your pages and should be used as a middleware.
```javascript
import { render as formRenderer } from "cms-forms"
app.use(formRenderer);
```

These modules will populate res.html object and can be safely output into your layout engine pages.
Heres an example for master.jade
```jade
.container-fluid 
      :verbatim
        !{html.content}
```

## Usage

Create your mongoose schema file
```javascript
import { Schema, model as Model } from "mongoose";

let schema = new Schema({
    name : String,
    description : String
});

export var model = Model('categories', schema);
```

Use this model to construct scaffold UI
```javascript
import * as express from "express";
import { model as CategoriesModel } from "./models/category";
import { render as formRenderer } from "cms-forms"
import * as scaffoldRouter from "express-mongoose-scaffold";

let app = express();

app.use('/categories', scaffoldRouter(CategoriesModel));

app.use(formRenderer);
app.use((req, res, next) => {
    if (res.html) {
        res.locals.html = res.html;
        res.render(res.html.layout || 'layouts/master');
        delete res.html;
    } else {
        next();
    }
})
```
