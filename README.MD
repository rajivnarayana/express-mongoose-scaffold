## Setup
```
npm install rajivnarayana/express-mongoose-scaffold
```

## Dependencies

### mongoose

This module should be used only after you establish a connection with mongoose.

### cms-forms and cms-grids

This module depends on other modules to generate [forms](https://github.com/rajivnarayana/cms-forms) and [grids](https://github.com/rajivnarayana/cms-grids).

These modules will also help you theme your pages and should be used as a middleware.
```javascript
import { render as formRenderer } from "cms-forms"
import { render as gridRenderer } from "cms-grids"
app.use(gridRenderer);
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
    description : String,
    
    // paths starting with '_' will be filtered out of the UI.
    _secretField : String, 
    
    // paths with hide: true will also be filtered out.
    _someOtherSecretField : { type : String, hide : true} 
});

export var model = Model('categories', schema);
```

Use this model to construct scaffold UI. This module provides two router one which deals with HTML and forms and the other that deals with APIs.
```javascript
import * as express from "express";
import { model as CategoriesModel } from "./models/category";
import { render as formRenderer } from "cms-forms"
import { render as gridRenderer } from "cms-grids"
import * as scaffoldRouter from "express-mongoose-scaffold";
import { connect } from "mongoose";

let app = express();
connect(process.env.MONGO_URI || 'mongodb://localhost/your-db');

app.use('/admin/categories', scaffoldRouter(CategoriesModel).adminRouter);
app.use('/categories', scaffoldRouter(CategoriesModel).apiRouter);

app.use(formRenderer);
app.use(gridRenderer);
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
## ToDo

* Ability to customize the code generated.
* Handle search and pagination.
* Expose internal Routers to be extensible.