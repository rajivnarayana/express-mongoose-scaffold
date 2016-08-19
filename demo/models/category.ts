import { Schema, model as Model } from "mongoose";

let schema = new Schema({
    name : String,
    secretCode : { type : String, hide : true},
    description : String
});

export var model = Model('categories', schema);
